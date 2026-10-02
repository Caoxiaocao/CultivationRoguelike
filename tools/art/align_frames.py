#!/usr/bin/env python3
"""
align_frames.py —— 序列帧网格对齐与打包

解决的问题
----------
AI 出的 N×M 序列帧网格，格子之间的**角色垂直位置常常不一致**
（实测：清虚仙子八卦阵盘套 v2 的上排头顶在 y≈26、下排却在 y≈12，相差 14px）。
直接切帧打包会导致实装时角色上下跳动。

本工具按「角色头顶」做稳健对齐，再统一缩放到指定基线，最后打包成序列帧图。

为什么不用 import_art.py
------------------------
`import_art.py` 的 `autocrop + fit_into` 会按**内容包围盒**居中，
而带地面法阵的帧包围盒会被法阵拉低，反而破坏对齐。
序列帧要的是「角色本体对齐」，所以需要按头顶锚定。

用法
----
python tools/art/align_frames.py \
    --in art-source/raw/qingxu_sheet_bagua_v2.png \
    --out public/player_spell_bagua_sheet.png \
    --grid 3x2 --frame 180 --pack-cols 3 \
    --baseline 0.93 --head 0.07 --tol-lo 4 --tol-hi 14
"""
from __future__ import annotations

import argparse
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artlib import (  # noqa: E402
    content_bbox,
    premultiply,
    remove_background,
    save_png,
    slice_grid,
    unpremultiply,
)

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))


def parse_grid(t: str) -> tuple[int, int]:
    try:
        c, r = t.lower().split("x")
        return int(c), int(r)
    except Exception:
        raise argparse.ArgumentTypeError("--grid 格式应为 列x行，例如 3x2")


def head_rows(mask: np.ndarray, frac_lo=0.45, frac_hi=0.55, min_px=3) -> np.ndarray:
    """返回每行在中央窄带内的不透明像素数，用于稳健判定角色头顶。"""
    w = mask.shape[1]
    band = mask[:, int(w * frac_lo):int(w * frac_hi)]
    return band.sum(1)


def robust_top(mask: np.ndarray, min_px: int = 3) -> int:
    """头顶 = 中央窄带内不透明像素数首次达到阈值的行（跳过零散飘带像素）。"""
    rows = np.nonzero(head_rows(mask) >= min_px)[0]
    return int(rows.min()) if rows.size else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="序列帧网格对齐与打包")
    ap.add_argument("--in", dest="src", required=True)
    ap.add_argument("--out", dest="dst", required=True)
    ap.add_argument("--grid", type=parse_grid, default=(3, 2))
    ap.add_argument("--frame", type=int, default=180, help="单帧边长")
    ap.add_argument("--pack-cols", type=int, default=3)
    ap.add_argument("--baseline", type=float, default=0.93, help="角色脚底所在的帧高比例")
    ap.add_argument("--head", type=float, default=0.07, help="角色头顶所在的帧高比例")
    ap.add_argument("--bg", type=lambda s: tuple(int(v) for v in s.split(",")), default=None)
    ap.add_argument("--tol-lo", type=float, default=4.0)
    ap.add_argument("--tol-hi", type=float, default=14.0)
    ap.add_argument("--seal", type=int, default=1)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with Image.open(args.src) as raw:
        raw.load()
        src = raw.copy()

    cols, rows = args.grid
    frames = slice_grid(src, cols, rows)
    print(f"源图 {src.size[0]}x{src.size[1]} -> {cols}x{rows} = {len(frames)} 帧，"
          f"单帧 {frames[0].size[0]}x{frames[0].size[1]}")

    # 1) 抠底
    cut = [remove_background(f, args.bg, args.tol_lo, args.tol_hi, seal=args.seal) for f in frames]

    # 2) 逐帧测头顶
    tops = [robust_top(np.asarray(f)[..., 3] > 128) for f in cut]
    print(f"\n各帧头顶 y: {tops}   极差 {max(tops)-min(tops)}px")

    # 3) 估计角色本体高度（中位数，避免带地面法阵的帧把高度拉大）
    heights = []
    for f, t in zip(cut, tops):
        b = content_bbox(f)[3] - 1
        heights.append(b - t + 1)
    char_h = int(np.median(heights))
    print(f"各帧内容高: {heights}   取中位角色高 = {char_h}px")

    # 4) 统一缩放到 [head, baseline] 区间
    F = args.frame
    target_h = (args.baseline - args.head) * F
    s = target_h / char_h
    head_y = args.head * F
    print(f"缩放系数 {s:.4f}  -> 角色高 {char_h}px 映射为 {target_h:.1f}px，"
          f"头顶 y={head_y:.1f}，脚底 y={args.baseline*F:.1f}")

    # 5) 逐帧对齐并放置到 F×F
    placed = []
    for i, (f, t) in enumerate(zip(cut, tops)):
        w, h = f.size
        scaled_w, scaled_h = max(1, round(w * s)), max(1, round(h * s))
        small = unpremultiply(f.convert("RGBA").resize((scaled_w, scaled_h), Image.Resampling.LANCZOS))
        # 源帧的头顶会落在 small 的 round(t*s) 处，把它抬到 head_y
        y_off = int(round(head_y - t * s))
        # 水平：按内容包围盒中心对齐到帧中心
        l, _, r, _ = content_bbox(f)
        cx_src = (l + r - 1) / 2 * s
        x_off = int(round(F / 2 - cx_src))
        canvas = Image.new("RGBA", (F, F), (0, 0, 0, 0))
        canvas.alpha_composite(small, (x_off, y_off))
        placed.append(canvas)
        if i == 0 or tops[i] != tops[0]:
            print(f"  帧{i}: 头顶源 y={t} -> 位移 {y_off:+d}px, 水平 {x_off:+d}px")

    # 6) 打包
    pc = args.pack_cols
    pr = (len(placed) + pc - 1) // pc
    sheet = Image.new("RGBA", (pc * F, pr * F), (0, 0, 0, 0))
    for i, p in enumerate(placed):
        sheet.paste(p, ((i % pc) * F, (i // pc) * F), p)

    # 7) 复核：对齐后各帧头顶与脚底
    print("\n对齐后复核:")
    ok = True
    for i, p in enumerate(placed):
        m = np.asarray(p)[..., 3] > 128
        t2 = robust_top(m)
        b2 = content_bbox(p)[3] - 1
        dev = abs(t2 - head_y)
        flag = "OK" if dev <= 3 else "!!"
        if dev > 3: ok = False
        print(f"  帧{i}: 头顶 {t2:>3} (目标 {head_y:.0f}) 偏差 {t2-head_y:+.0f}px {flag}"
              f"   内容底边 {b2/F*100:5.1f}%")
    print("对齐" + ("通过" if ok else "仍有偏差，请检查"))

    out_path = os.path.normpath(os.path.join(ROOT, args.dst)) if not os.path.isabs(args.dst) else args.dst
    if args.dry_run:
        print(f"\nDRY-RUN，未写盘。目标: {out_path}  {sheet.size[0]}x{sheet.size[1]}")
    else:
        n = save_png(sheet, out_path)
        print(f"\n已写出: {out_path}  {sheet.size[0]}x{sheet.size[1]}  {n/1024:.1f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
