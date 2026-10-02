#!/usr/bin/env python3
"""
artlib.py —— 问道 · 青冥秘境 素材处理核心库

把原先散落在各个 tools/generate_*.cjs 里的内联 Canvas 像素循环，
统一重写为基于 Pillow + numpy 的向量化实现。

相比原来的逐像素 JS 实现，这里改进了三件事：

1. **向量化**：numpy 广播替代双层 for 循环，速度快一个数量级以上；
2. **背景色自适应**：不再把"白底"写死，而是从图像边框采样估计背景色，
   因此对米白、浅灰、淡蓝等非纯白底也成立；
3. **正确的去背景数学**：把像素视为 P = F·a + B·(1-a)，
   由距离得到 a 后反解 F = (P - B·(1-a)) / a，从根上消除白边/灰边，
   而不是像旧实现那样用一堆阈值去"猜" alpha。

用法（作为库）:
    from artlib import remove_background, fit_square, slice_grid, pack_grid

    im = Image.open("raw.png")
    cut = remove_background(im)          # 自动识别背景并抠成透明
    out = fit_square(cut, 256, padding=12)
    out.save("public/xxx.png")
"""
from __future__ import annotations

import os
from typing import Iterable, Sequence

import numpy as np
from PIL import Image

EPS_ALPHA = 0.004  # 低于该 alpha 视为完全透明


# ---------------------------------------------------------------------------
# alpha 预乘 / 还原
# ---------------------------------------------------------------------------
def premultiply(im: Image.Image) -> Image.Image:
    """RGB <- RGB * A。让重采样发生在预乘空间，避免透明区颜色渗入边缘。"""
    arr = np.asarray(im.convert("RGBA")).astype(np.float32)
    alpha = arr[..., 3:4] / 255.0
    rgb = arr[..., :3] * alpha
    return _to_image(np.concatenate([rgb, arr[..., 3:4]], axis=2))


def unpremultiply(im: Image.Image) -> Image.Image:
    """RGB <- RGB / A。还原为浏览器/Canvas 期望的非预乘 RGBA。"""
    arr = np.asarray(im.convert("RGBA")).astype(np.float32)
    alpha = arr[..., 3:4] / 255.0
    rgb = arr[..., :3] / np.maximum(alpha, EPS_ALPHA)
    rgb[alpha[..., 0] < EPS_ALPHA] = 0.0
    return _to_image(np.concatenate([np.clip(rgb, 0, 255), arr[..., 3:4]], axis=2))


def _to_image(arr: np.ndarray) -> Image.Image:
    return Image.fromarray(np.clip(arr + 0.5, 0, 255).astype(np.uint8), "RGBA")


# ---------------------------------------------------------------------------
# 缩放
# ---------------------------------------------------------------------------
def resize_max(im: Image.Image, target: int, alpha_aware: bool = True) -> Image.Image:
    """等比缩放，使 max(w, h) == target（已达标则原样返回）。

    alpha_aware=True 时对 RGBA 走预乘空间，避免半透明边缘出现 halo。
    """
    w, h = im.size
    if max(w, h) <= target:
        return im
    scale = target / float(max(w, h))
    size = (max(1, round(w * scale)), max(1, round(h * scale)))
    has_alpha = "A" in im.getbands() or im.mode == "P"
    if alpha_aware and has_alpha:
        return unpremultiply(resize_exact(premultiply(im), size))
    return im.resize(size, Image.Resampling.LANCZOS)


def resize_exact(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    return im.resize(size, Image.Resampling.LANCZOS)


def fit_into(im: Image.Image, size: int, padding: int = 0) -> Image.Image:
    """等比缩放并居中放进 size x size 的正方形画布（保持长宽比）。"""
    inner = max(1, size - padding * 2)
    w, h = im.size
    scale = min(inner / w, inner / h)
    new = (max(1, round(w * scale)), max(1, round(h * scale)))
    has_alpha = "A" in im.getbands() or im.mode == "P"
    scaled = unpremultiply(resize_exact(premultiply(im), new)) if has_alpha \
        else resize_exact(im.convert("RGB"), new)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(scaled.convert("RGBA"), ((size - new[0]) // 2, (size - new[1]) // 2), scaled.convert("RGBA"))
    return canvas


# ---------------------------------------------------------------------------
# 背景移除（抠图）
# ---------------------------------------------------------------------------
def detect_bg_color(im: Image.Image, border: int = 6) -> tuple[int, int, int]:
    """从图像四周边框采样，用中位数估计背景色（抗噪、抗少量前景侵入）。"""
    arr = np.asarray(im.convert("RGB")).astype(np.float32)
    h, w, _ = arr.shape
    b = max(1, min(border, h // 4, w // 4))
    ring = np.concatenate([
        arr[:b, :, :].reshape(-1, 3),
        arr[-b:, :, :].reshape(-1, 3),
        arr[:, :b, :].reshape(-1, 3),
        arr[:, -b:, :].reshape(-1, 3),
    ])
    return tuple(int(v) for v in np.median(ring, axis=0))


def _erode(mask: np.ndarray, k: int = 1) -> np.ndarray:
    """布尔掩码腐蚀 k 次（4 邻域）。"""
    r = mask.copy()
    for _ in range(k):
        g = r.copy()
        g[1:, :] &= r[:-1, :]
        g[:-1, :] &= r[1:, :]
        g[:, 1:] &= r[:, :-1]
        g[:, :-1] &= r[:, 1:]
        r = g
    return r


def _dilate(mask: np.ndarray, k: int = 1) -> np.ndarray:
    """布尔掩码膨胀 k 次（4 邻域）。"""
    r = mask.copy()
    for _ in range(k):
        g = r.copy()
        g[1:, :] |= r[:-1, :]
        g[:-1, :] |= r[1:, :]
        g[:, 1:] |= r[:, :-1]
        g[:, :-1] |= r[:, 1:]
        r = g
    return r


def _border_connected(cand: np.ndarray, max_iter: int = 20000) -> np.ndarray:
    """返回 cand 中「与图像四边 4-连通」的像素掩码。

    这是形态学重建：每次迭代把已到达集合在 cand 内部向外扩 1 像素，
    到达不动点即为完整连通域。对 1264x848 实测 622 次迭代 / 0.6s，可接受。

    注：Pillow 12.3 的 ImageDraw.floodfill 实测为空操作（连 6x6 都不填充），
    scipy/cv2/skimage 又不在运行环境里，因此这里自己实现，避免隐式依赖。
    """
    reached = np.zeros_like(cand)
    reached[0, :] = cand[0, :]
    reached[-1, :] = cand[-1, :]
    reached[:, 0] |= cand[:, 0]
    reached[:, -1] |= cand[:, -1]
    for _ in range(max_iter):
        grown = reached.copy()
        grown[1:, :] |= reached[:-1, :]
        grown[:-1, :] |= reached[1:, :]
        grown[:, 1:] |= reached[:, :-1]
        grown[:, :-1] |= reached[:, 1:]
        grown &= cand
        if np.array_equal(grown, reached):
            break
        reached = grown
    return reached


def remove_background(
    im: Image.Image,
    bg: Sequence[int] | None = None,
    tol_lo: float = 10.0,
    tol_hi: float = 48.0,
    despill: bool = True,
    feather: float = 0.0,
    connected: bool = True,
    seal: int = 1,
) -> Image.Image:
    """把纯色/近纯色背景抠成透明，返回 RGBA。

    参数
    ----
    bg        : 背景色 RGB。None = 自动从边框估计。
    tol_lo    : 与背景色距离低于此值 -> 全透明。
    tol_hi    : 距离高于此值 -> 完全不透明；中间线性过渡（保留抗锯齿边缘）。
    despill   : 按 P = F·a + B·(1-a) 反解前景色，消除白边/灰边。
    feather   : 对生成的 alpha 做半径（像素）高斯羽化。0 = 关闭。
    connected : **关键开关**。True = 只把「与图像边框连通」的背景判为透明。
    seal      : 连通判定前先把候选背景腐蚀几个像素，用于封住轮廓上的细小缺口
                （否则背景会渗进白色衣物内部留下半透明斑）。0 = 不封。

    为什么需要 connected
    -------------------
    白底 + 白色衣物/浅色皮肤在逐像素判据下天然歧义：白裤子离背景色同样近。
    朴素的"距离阈值"会把角色身上抠出洞（脸、裤子、内衬全部变透明）。
    解决方法是连通域判定：**只有能从图像边缘走到的背景才是真背景**，
    被角色轮廓围住的白色衣物不连通，因而保持不透明。

    connected=False 退化为纯阈值抠图，适用于背景确实弥散全图的情况
    （例如需要保留的半透明光效）。
    """
    rgb = np.asarray(im.convert("RGB")).astype(np.float32)
    if bg is None:
        bg = detect_bg_color(im)
    bg_arr = np.array(bg, dtype=np.float32)

    # 与背景色的欧氏距离：越低越像背景
    dist = np.sqrt(((rgb - bg_arr) ** 2).sum(axis=2))

    if connected:
        cand = dist < tol_hi
        if seal > 0:
            # 先把候选背景腐蚀 seal 像素：断开 1~2px 宽的"细缝"。
            # 否则背景会顺着轮廓上的细小缺口渗进白色衣物内部，留下半透明斑。
            reached = _border_connected(_erode(cand, seal))
            # 再膨胀回来并交回候选集，恢复被腐蚀掉的抗锯齿边缘
            bg_connected = _dilate(reached, seal) & cand
        else:
            bg_connected = _border_connected(cand)
    else:
        bg_connected = np.ones(dist.shape, dtype=bool)

    span = max(1e-6, tol_hi - tol_lo)
    ramp = np.clip((dist - tol_lo) / span, 0.0, 1.0)
    # 连通背景区走软过渡；角色内部一律不透明
    alpha = np.where(bg_connected, ramp, 1.0)

    if despill:
        a3 = alpha[..., None]
        safe = np.maximum(a3, EPS_ALPHA)
        rgb = np.clip((rgb - bg_arr * (1.0 - a3)) / safe, 0, 255)

    out = np.concatenate([rgb, (alpha * 255.0)[..., None]], axis=2)
    result = _to_image(out)

    if feather > 0:
        from PIL import ImageFilter
        result.putalpha(result.getchannel("A").filter(ImageFilter.GaussianBlur(feather)))
    return result


# ---------------------------------------------------------------------------
# 裁剪 / 切片 / 打包
# ---------------------------------------------------------------------------
def content_bbox(im: Image.Image, alpha_min: int = 16) -> tuple[int, int, int, int]:
    """返回非透明内容的包围盒 (left, top, right, bottom)，右/下为开区间。"""
    alpha = np.asarray(im.convert("RGBA"))[..., 3]
    ys, xs = np.nonzero(alpha > alpha_min)
    if xs.size == 0:
        return (0, 0, im.size[0], im.size[1])
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def autocrop(im: Image.Image, alpha_min: int = 16) -> Image.Image:
    """裁掉四周全透明区域。"""
    return im.crop(content_bbox(im, alpha_min))


def slice_grid(im: Image.Image, cols: int, rows: int) -> list[Image.Image]:
    """把一张等分网格序列帧切成 cols*rows 帧（按行优先返回）。"""
    w, h = im.size
    fw, fh = w // cols, h // rows
    return [im.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh))
            for r in range(rows) for c in range(cols)]


def pack_grid(frames: Iterable[Image.Image], cols: int | None = None,
              frame_size: int | None = None, padding: int = 0) -> Image.Image:
    """把若干帧按行优先打包成一张序列帧图（cols 省略时排成一行）。"""
    frames = list(frames)
    if not frames:
        raise ValueError("pack_grid: 帧列表为空")
    n = len(frames)
    cols = cols or n
    rows = (n + cols - 1) // cols
    fw, fh = (frame_size, frame_size) if frame_size else frames[0].size

    sheet = Image.new("RGBA", (cols * fw, rows * fh), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        cell = fit_into(fr, fw, padding) if fr.size != (fw, fh) else fr.convert("RGBA")
        sheet.paste(cell, ((i % cols) * fw, (i // cols) * fh), cell)
    return sheet


# ---------------------------------------------------------------------------
# 保存
# ---------------------------------------------------------------------------
def save_png(im: Image.Image, path: str, compress_level: int = 9) -> int:
    """存为优化过的 PNG，返回写入字节数。"""
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    out = im if im.mode in ("RGB", "RGBA", "L", "LA", "P") else im.convert("RGBA")
    out.save(path, format="PNG", optimize=True, compress_level=compress_level)
    return os.path.getsize(path)
