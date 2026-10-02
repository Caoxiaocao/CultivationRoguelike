#!/usr/bin/env python3
"""
import_art.py —— 通用素材导入器（AI 出图 -> 游戏可用贴图）

把「AI 出的一张图」变成「能直接进游戏的贴图」，一次搞定：
    抠背景 -> 裁掉空白 -> 按锚点归一化构图 -> 切帧/打包 -> 存进 public/

与旧 tools/generate_*.cjs 的区别：
  - 不再把输入目录写死成 Antigravity 的绝对路径（改为 --in，默认 art-source/raw）
  - 抠图用 artlib 的向量化实现，且按 P = F·a + B·(1-a) 正确反解前景色
  - 支持序列帧：既能把一张 N 宫格大图切开重排，也能把多张单图打包成序列帧图

典型用法
--------
# 1) 单图 -> 角色立绘 256x256，底部对齐（贴合游戏 -h*0.86 的落脚点约定）
python tools/art/import_art.py --in art-source/raw/npc.png --out public/npc.png \
       --size 256 --anchor bottom

# 2) 一张 3x2 的 AI 序列帧大图 -> 重新打包成 540x360 的 6 帧图（每帧 180）
python tools/art/import_art.py --in raw_sheet.jpg --out public/player_sword_xxx_sheet.png \
       --grid 3x2 --frame 180 --pack-cols 3

# 3) 多张单帧 -> 打包成一行 6 帧
python tools/art/import_art.py --in art-source/raw/pos
       --out public/player_sword_xxx_sheet.png --frame 180 --pack-cols 6

# 4) 只预览不写盘（叠加洋红背景 + 落脚参考线，便于肉眼检查边缘）
python tools/art/import_art.py --in raw.png --out public/x.png --size 256 --preview
"""
from __future__ import annotations

import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artlib import (  # noqa: E402
    autocrop,
    fit_into,
    pack_grid,
    remove_background,
    save_png,
    slice_grid,
)

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
DEFAULT_IN = os.path.join(ROOT, "art-source", "raw")
DEFAULT_OUT = os.path.join(ROOT, "public")
EXTS = (".png", ".jpg", ".jpeg", ".webp", ".bmp")


def place(frame: Image.Image, size: int, padding: int, anchor: str, ground: float) -> Image.Image:
    """把单帧放进 size×size 画布。

    anchor='bottom' 时把内容底部对齐到画布高度的 ground 处 —— 对应游戏里
    drawImage(img, -w/2, -h*0.86, w, h) 的落脚点约定，保证不同素材脚底齐平。
    """
    if anchor == "center":
        return fit_into(frame, size, padding)

    inner = max(1, size - padding * 2)
    w, h = frame.size
    scale = min(inner / w, inner / h)
    new = (max(1, round(w * scale)), max(1, round(h * scale)))
    scaled = frame.convert("RGBA").resize(new, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - new[0]) // 2
    y = int(round(size * ground)) - new[1]
    y = max(0, min(size - new[1], y)) if new[1] <= size else 0
    canvas.paste(scaled, (x, y), scaled)
    return canvas


def parse_grid(text: str) -> tuple[int, int]:
    try:
        c, r = text.lower().split("x")
        return int(c), int(r)
    except Exception:
        raise argparse.ArgumentTypeError("--grid 格式应为 列x行，例如 3x2")


def parse_bg(text: str) -> tuple[int, int, int]:
    try:
        parts = [int(v) for v in text.replace(" ", "").split(",")]
        if len(parts) != 3:
            raise ValueError
        return tuple(parts)  # type: ignore[return-value]
    except Exception:
        raise argparse.ArgumentTypeError("--bg 格式应为 R,G,B，例如 255,255,255")


def add_preview(img: Image.Image, ground: float | None) -> Image.Image:
    """在洋红底上叠出结果，并画落脚参考线，便于肉眼检查抠图边缘。"""
    w, h = img.size
    bg = Image.new("RGBA", (w, h), (255, 0, 255, 255))
    bg.alpha_composite(img.convert("RGBA"))
    if ground is not None:
        d = ImageDraw.Draw(bg)
        y = int(round(h * ground))
        d.line([(0, y), (w, y)], fill=(0, 255, 0, 255), width=1)
    return bg.convert("RGB")


def rel(path: str) -> str:
    """相对仓库根显示；跨盘符时退回绝对路径（Windows 上 relpath 会抛 ValueError）。"""
    try:
        return os.path.relpath(path, ROOT)
    except ValueError:
        return path


def collect_inputs(path: str) -> list[str]:
    if os.path.isdir(path):
        return sorted(os.path.join(path, f) for f in os.listdir(path)
                      if f.lower().endswith(EXTS))
    if os.path.isfile(path):
        return [path]
    raise SystemExit(f"输入不存在: {path}")


def main() -> int:
    ap = argparse.ArgumentParser(
        description="AI 出图 -> 游戏可用贴图（抠底 / 归一化 / 切帧 / 打包）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("--in", dest="src", default=DEFAULT_IN,
                    help=f"输入图片或目录（默认 {os.path.relpath(DEFAULT_IN, ROOT)}）")
    ap.add_argument("--out", dest="dst", required=True,
                    help="输出文件；输入是目录时视为输出目录")
    ap.add_argument("--size", type=int, default=None, help="单图模式的目标边长（正方形）")
    ap.add_argument("--frame", type=int, default=None, help="序列帧模式每帧边长")
    ap.add_argument("--grid", type=parse_grid, default=None,
                    help="把输入当作 NxM 等分网格切开，例如 3x2")
    ap.add_argument("--pack-cols", type=int, default=None, help="打包成几列（默认一行）")
    ap.add_argument("--anchor", choices=["center", "bottom"], default="center",
                    help="构图锚点；角色/怪物建议 bottom")
    ap.add_argument("--ground", type=float, default=0.86,
                    help="bottom 锚点时内容底边所在的高度比例（默认 0.86，与游戏一致）")
    ap.add_argument("--padding", type=int, default=0, help="留边像素")
    ap.add_argument("--bg", type=parse_bg, default=None, help="背景色 R,G,B；默认自动识别")
    ap.add_argument("--tol-lo", type=float, default=12.0, help="低于此距离视为完全背景")
    ap.add_argument("--tol-hi", type=float, default=64.0, help="高于此距离视为完全前景")
    ap.add_argument("--feather", type=float, default=0.0, help="alpha 羽化半径，0=关闭")
    ap.add_argument("--no-crop", action="store_true", help="不自动裁掉四周空白，保持原构图")
    ap.add_argument("--no-despill", action="store_true", help="不做前景色反解（会残留白边）")
    ap.add_argument("--no-flood", action="store_true",
                    help="关闭连通域判定，退化为纯阈值抠图（背景弥散全图时才需要）")
    ap.add_argument("--seal", type=int, default=1,
                    help="连通判定前腐蚀候选背景的像素数，用于封住轮廓细缝（0~3，默认 1）")
    ap.add_argument("--preview", action="store_true",
                    help="不写 --out，改为输出 <out>.preview.png（洋红底 + 落脚线）")
    args = ap.parse_args()

    inputs = collect_inputs(args.src)
    if not inputs:
        raise SystemExit(f"目录中没有图片: {args.src}")

    # ---- 切帧 ----
    frames: list[Image.Image] = []
    for path in inputs:
        with Image.open(path) as raw:
            raw.load()
            src = raw.copy()
        cut = remove_background(src, args.bg, args.tol_lo, args.tol_hi,
                                despill=not args.no_despill, feather=args.feather,
                                connected=not args.no_flood, seal=args.seal)
        if args.grid:
            frames.extend(slice_grid(cut, *args.grid))
        else:
            frames.append(cut)

    if not args.no_crop:
        frames = [autocrop(f) for f in frames]

    # ---- 组装 ----
    sheet_mode = bool(args.grid) or len(frames) > 1 or args.frame is not None
    if sheet_mode:
        frame_size = args.frame or (args.size or 180)
        placed = [place(f, frame_size, args.padding, args.anchor, args.ground) for f in frames]
        result = pack_grid(placed, cols=args.pack_cols, frame_size=frame_size)
    else:
        if args.size is None:
            raise SystemExit("单图模式需要 --size（或使用 --frame 进入序列帧模式）")
        result = place(frames[0], args.size, args.padding, args.anchor, args.ground)

    # ---- 输出 ----
    out_path = args.dst
    if os.path.isdir(args.dst) or (len(inputs) > 1 and not sheet_mode):
        os.makedirs(args.dst, exist_ok=True)
        out_path = os.path.join(args.dst, os.path.basename(inputs[0]))

    if args.preview:
        out_path = out_path + ".preview.png"
        add_preview(result, args.ground if args.anchor == "bottom" else None).save(out_path)
        print(f"预览已写出: {rel(out_path)}")
    else:
        n = save_png(result, out_path)
        print(f"已写出: {rel(out_path)}  "
              f"{result.size[0]}x{result.size[1]}  {n/1024:.1f} KB")

    print(f"  来源 {len(inputs)} 张 · 帧数 {len(frames)} · 锚点 {args.anchor}"
          f"{' · 已自动裁边' if not args.no_crop else ''}")
    if sheet_mode:
        cols = args.pack_cols or len(frames)
        rows = (len(frames) + cols - 1) // cols
        print(f"  序列帧: 每帧 {result.size[0]//cols}x{result.size[1]//rows} · "
              f"{cols} 列 x {rows} 行 = {len(frames)} 帧")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
