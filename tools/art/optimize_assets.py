#!/usr/bin/env python3
"""
问道 · 青冥秘境 —— 贴图批量优化器

设计依据（实测，不是拍脑袋）：
  游戏画布缓冲区被 renderScale 钳制在 1920x1080（最多 2400x1350），
  见 src/main.js 的 draw():  renderScale = clamp(devicePixelRatio, 2, 2.5)
  且 ARENA 固定 960x540。所以一张贴图能贡献的细节上限，就是它在
  1920x1080 缓冲区里占的像素数 —— 超出部分在 2K/4K 上纯属浪费。

因此本脚本按「实际绘制尺寸」把过采样贴图降采样，其余贴图只做无损重编码。

关键点：RGBA 贴图先做 alpha 预乘再重采样。若直接对非预乘数据重采样，
透明区域的颜色会被混进边缘像素，产生白边/黑边（halo）。

用法:
    python tools/art/optimize_assets.py --dry-run        # 只报告，不写文件
    python tools/art/optimize_assets.py                  # 执行降采样 + 无损重编码
    python tools/art/optimize_assets.py --lossless-only  # 跳过降采样，只做无损重编码
    python tools/art/optimize_assets.py --only a.png b.png
"""
from __future__ import annotations

import argparse
import io
import os
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    sys.exit(f"需要 Pillow 与 numpy：{exc}\n  安装: pip install Pillow numpy")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artlib import (  # noqa: E402  核心算法统一放在 artlib，避免重复实现
    EPS_ALPHA,
    premultiply,
    resize_max,
    unpremultiply,
)

PUBLIC_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public")
)

# ---------------------------------------------------------------------------
# 目标边长表（等比缩放到 max(w, h) == 目标值）
#
# 每项数值都来自源码里实测的绘制尺寸。注释写明依据：
#   设备 px = 逻辑 px x renderScale（renderScale 上限 2.5）
# ---------------------------------------------------------------------------
TARGETS: dict[str, int] = {
    # --- DOM 卡片图标（CSS 固定像素，随 DPR 放大）---
    "skill_chain_lightning.png": 192,   # .choice-icon-img 28px / .loot-review-icon-img 52px -> DPR3 约 156px
    "skill_blazing_fire.png": 128,      # .choice-icon-img 28px / .tile-icon-img 24px -> 约 84px

    # --- 战斗特效（Canvas drawImage，逻辑尺寸随等级/进度变化）---
    "effect_chain_arc.png": 256,        # 节点尺寸 56~78 逻辑 px -> 195 设备 px
    "effect_fire_burst.png": 384,       # radius(85+lvl*20) x (0.35+scale*0.75)，高等级可达约 330 设备 px

    # --- 角色立绘（charSprites w/h = 64~68 逻辑 px -> 170 设备 px）---
    "player_anime.png": 256,            # 剑修
    "player_fairy.png": 256,            # 法修
    "player_body.png": 256,             # 体修
    "player_beast.png": 256,            # 灵兽师
    "player_formation.png": 256,        # 阵法师
    "player_alchemist.png": 256,        # 丹药师
    "player_demon.png": 256,            # 魔修
    "player_ghost.png": 256,            # 鬼修
    "player_ink.png": 256,              # 目前未被任何代码引用，仅一并优化

    # --- 小怪单图（drawImage 写死 w=h=84 逻辑 px -> 210 设备 px）---
    "enemy_brute.png": 256,
    "enemy_wisp.png": 256,
    "enemy_frost_brute.png": 256,
}

# 明确不动、并写明原因的贴图，避免后人"顺手优化"掉
PROTECTED: dict[str, str] = {
    "map_arena.jpg": "全屏背景：绘制 960x540 逻辑 px -> 需 1920x1080 设备 px；现有 1376x768 本就不够，不能再降",
    "player_sword_qingfeng_sheet.png": "序列帧：单帧 180px 且按 180 逻辑 px 绘制 -> 需 360 设备 px，现已偏软",
    "player_sword_jifeng_sheet.png": "同上",
    "player_sword_benlei_sheet.png": "同上",
    "boss_red_dragon_sheet.png": "序列帧，且有尺寸断言 720x360",
    "enemy_wisp_sheet.png": "序列帧，且有尺寸断言 640x320",
    "enemy_brute_sheet.png": "序列帧，且有尺寸断言 720x360",
    "enemy_frost_brute_sheet.png": "序列帧，且有尺寸断言 720x360",
    "boss_corpse_skull_sheet.png": "序列帧，且有尺寸断言 720x360",
    "boss_corpse_tri_skull_sheet.png": "序列帧，且有尺寸断言 720x360",
    "boss_corpse_arm_sheet.png": "序列帧，且有尺寸断言 720x360",
    "effect_dragon_lava.png": "有尺寸断言 512x512，且为大范围法阵",
    "effect_corpse_poison_pool.png": "有尺寸断言 512x512",
}

IMAGE_EXT = (".png", ".jpg", ".jpeg")

# premultiply / unpremultiply / resize_max 均来自 artlib，此处不再重复实现


def transform(path: str, target: int | None) -> dict:
    """计算处理结果（不落盘）。返回 {img, note, src_size, src_format, has_alpha, changed}"""
    with Image.open(path) as src:
        src_format, src_size, src_mode = src.format, src.size, src.mode
        has_alpha = "A" in src.getbands() or src_mode == "P"
        src.load()
        base = src.copy()  # 脱离文件句柄，后续可安全使用

    if target is not None and max(src_size) > target:
        work = unpremultiply(resize_max(premultiply(base), target)) if has_alpha \
            else resize_max(base.convert("RGB"), target)
        return {"img": work, "note": "降采样+预乘alpha" if has_alpha else "降采样",
                "src_size": src_size, "src_format": src_format,
                "has_alpha": has_alpha, "changed_dims": True}

    if target is not None:
        # 已在目标之内：仅无损重编码
        return {"img": base, "note": f"已达标(<= {target})", "src_size": src_size,
                "src_format": src_format, "has_alpha": has_alpha, "changed_dims": False}

    if src_format != "PNG":
        return {"img": None, "note": "跳过(非PNG，转码反而变大)", "src_size": src_size,
                "src_format": src_format, "has_alpha": has_alpha, "changed_dims": False}

    return {"img": base, "note": "无损重编码", "src_size": src_size,
            "src_format": src_format, "has_alpha": has_alpha, "changed_dims": False}


def encode_png(im: Image.Image) -> bytes:
    buf = io.BytesIO()
    out = im if im.mode in ("RGB", "RGBA", "L", "LA", "P") else im.convert("RGBA")
    out.save(buf, format="PNG", optimize=True, compress_level=9)
    return buf.getvalue()


def main() -> int:
    ap = argparse.ArgumentParser(description="按实际绘制尺寸优化贴图")
    ap.add_argument("--dry-run", action="store_true", help="只报告，不写文件（会真实编码以得到准确体积）")
    ap.add_argument("--lossless-only", action="store_true", help="跳过降采样")
    ap.add_argument("--only", nargs="*", default=None, help="只处理指定文件名")
    args = ap.parse_args()

    if not os.path.isdir(PUBLIC_DIR):
        sys.exit(f"找不到 public 目录: {PUBLIC_DIR}")

    files = sorted(f for f in os.listdir(PUBLIC_DIR) if f.lower().endswith(IMAGE_EXT))
    if args.only:
        files = [f for f in files if f in set(args.only)]

    print(f"public: {PUBLIC_DIR}")
    print(f"模式: {'DRY-RUN（不写盘）' if args.dry_run else '执行写入'}"
          f"{' · 仅无损重编码' if args.lossless_only else ''}\n")

    rows, downsized, recompressed, wrote = [], 0, 0, 0
    tot_before = tot_after = 0

    for name in files:
        path = os.path.join(PUBLIC_DIR, name)
        target = None if args.lossless_only else TARGETS.get(name)
        before = os.path.getsize(path)
        try:
            info = transform(path, target)
        except Exception as exc:  # noqa: BLE001
            print(f"  !! {name}: {exc}")
            continue

        if info["img"] is None:
            continue
        payload = encode_png(info["img"])
        after = len(payload)

        # 无损重编码若没变小，就保留原文件
        skipped = (not info["changed_dims"]) and after >= before
        final = before if skipped else after
        wrote += 0 if (skipped or args.dry_run) else 1
        if info["changed_dims"]:
            downsized += 1
        else:
            recompressed += 1
        tot_before += before
        tot_after += final

        if not args.dry_run and not skipped:
            tmp = path + ".opt.tmp"
            with open(tmp, "wb") as fh:
                fh.write(payload)
            os.replace(tmp, path)

        rows.append({
            "file": name, "note": info["note"], "before": before, "after": final,
            "size": f"{info['src_size'][0]}x{info['src_size'][1]}",
            "newsize": f"{info['img'].size[0]}x{info['img'].size[1]}",
            "skipped": skipped,
        })

    print(f"{'文件':<38}{'原尺寸':<12}{'新尺寸':<12}{'原KB':>9}{'新KB':>9}  说明")
    print("-" * 100)
    for r in rows:
        tag = "保留原文件" if r["skipped"] else r["note"]
        print(f"{r['file']:<38}{r['size']:<12}{r['newsize']:<12}"
              f"{r['before']/1024:>9.1f}{r['after']/1024:>9.1f}  {tag}")

    print("-" * 100)
    saved = tot_before - tot_after
    pct = (saved / tot_before * 100) if tot_before else 0
    print(f"降采样 {downsized} 个 · 重编码 {recompressed} 个 · 写入 {wrote} 个"
          f"{'（dry-run 未写盘）' if args.dry_run else ''}")
    print(f"已处理贴图: {tot_before/1048576:.1f} MB -> {tot_after/1048576:.1f} MB "
          f"(省 {saved/1048576:.1f} MB, {pct:.1f}%)")

    all_bytes = sum(os.path.getsize(os.path.join(PUBLIC_DIR, f)) for f in
                    os.listdir(PUBLIC_DIR) if f.lower().endswith(IMAGE_EXT))
    print(f"public 当前实际体积: {all_bytes/1048576:.1f} MB")

    print("\n受保护、未处理的贴图:")
    for n, why in PROTECTED.items():
        print(f"  - {n}: {why}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
