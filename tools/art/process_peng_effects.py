import os
import math
from PIL import Image, ImageOps, ImageFilter

BRAIN_DIR = r"C:\Users\Administrator\.gemini\antigravity\brain\bce5c981-c741-4fb6-b269-6bc282a5d487"
PUBLIC_DIR = r"E:\CODE\game\public"

# -----------------------------------------------------------------------------
# 1. 处理「太乙金羽剑雨」飞刃 (effect_peng_feather.png)
# -----------------------------------------------------------------------------
feather_raw = os.path.join(BRAIN_DIR, "effect_peng_feather_1791182660346.jpg")
print(f"Loading raw feather: {feather_raw}")
im_feather = Image.open(feather_raw).convert("RGBA")

# 水平镜像翻转，使剑刃羽尖朝右 (+X 顺运动方向)，金羽箭翎与星屑拖尾朝左 (-X)
im_feather = im_feather.transpose(Image.FLIP_LEFT_RIGHT)
fw, fh = im_feather.size
fpixels = list(im_feather.getdata())

# 纯黑底精准抠图：剃除尖端外侧发散气流雾气，保留坚实锐利的泥金剑身与尾部金羽
raw_rgb = Image.open(feather_raw).convert("RGB")
rw, rh = raw_rgb.size
rpixels = raw_rgb.load()

out_raw = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
out_raw_pixels = out_raw.load()

for x in range(rw):
    for y in range(rh):
        r, g, b = rpixels[x, y]
        max_c = max(r, g, b)
        
        # 针对剑尖区域 (x < 480) 剔除外围气浪包络
        if x < 480:
            t = (x - 70) / (480.0 - 70.0)
            if t < 0:
                continue
            half_h = 13 + t * 74
            dy = abs(y - 512)
            if dy > half_h:
                continue
            elif dy > half_h - 8:
                edge_mult = (half_h - dy) / 8.0
            else:
                edge_mult = 1.0
        else:
            edge_mult = 1.0

        if max_c < 20:
            continue
            
        lum = (r * 299 + g * 587 + b * 114) / 1000.0
        alpha_f = min(1.0, (max_c / 200.0) * edge_mult)
        if alpha_f < 0.05:
            continue
            
        # 严谨 Unmult 避免灰边
        un_r = min(255, int(r / alpha_f))
        un_g = min(255, int(g / alpha_f))
        un_b = min(255, int(b / alpha_f))
        
        # 强化浓郁暖琥珀泥金色泽，杜绝在浅色地图上被冲蚀变白
        un_r = min(255, int(un_r * 1.08))
        un_g = min(255, int(un_g * 0.94))
        un_b = int(un_b * 0.65)
        
        if lum > 65:
            final_alpha = min(255, int(200 + (lum - 65) * 0.45))
        else:
            final_alpha = int(alpha_f * 220)
            
        out_raw_pixels[x, y] = (un_r, un_g, un_b, final_alpha)

# 水平镜像翻转，使剑刃羽尖朝右 (+X 顺飞行方向)
im_feather = out_raw.transpose(Image.FLIP_LEFT_RIGHT)

# 自动裁剪至紧凑包围盒
f_bbox = im_feather.getbbox()
if f_bbox:
    im_feather = im_feather.crop(f_bbox)

# 规范化居中放置在 160 x 64 画布 (纵横比适配飞刃高速穿梭感)
target_fw = 160
target_fh = 64
feather_final = Image.new("RGBA", (target_fw, target_fh), (0, 0, 0, 0))

ratio = min((target_fw - 6) / im_feather.width, (target_fh - 6) / im_feather.height)
new_w = int(im_feather.width * ratio)
new_h = int(im_feather.height * ratio)
im_feather_scaled = im_feather.resize((new_w, new_h), Image.Resampling.LANCZOS)

paste_x = (target_fw - new_w) // 2
paste_y = (target_fh - new_h) // 2
feather_final.paste(im_feather_scaled, (paste_x, paste_y), im_feather_scaled)

out_feather = os.path.join(PUBLIC_DIR, "effect_peng_feather.png")
feather_final.save(out_feather, "PNG")
print(f"Saved: {out_feather} ({feather_final.size})")


# -----------------------------------------------------------------------------
# 2. 处理「九霄神雷法阵」预警底盘 (effect_peng_thunder_array.png)
# -----------------------------------------------------------------------------
array_raw = os.path.join(BRAIN_DIR, "effect_peng_thunder_array_v2_1791182732771.jpg")
print(f"Loading raw thunder array: {array_raw}")
im_array = Image.open(array_raw).convert("RGBA")
aw, ah = im_array.size
apixels = list(im_array.getdata())

# 纯黑底抠图 + 圆形暗角平滑羽化
new_apixels = []
cx = aw / 2.0
cy = ah / 2.0
max_radius = min(cx, cy) - 4

for idx, (r, g, b, a) in enumerate(apixels):
    x = idx % aw
    y = idx // aw
    dist = math.hypot(x - cx, y - cy)

    if dist > max_radius:
        new_apixels.append((0, 0, 0, 0))
        continue

    # 边缘渐隐羽化因子
    edge_feather = 1.0
    if dist > max_radius - 20:
        edge_feather = max(0.0, (max_radius - dist) / 20.0)

    max_c = max(r, g, b)
    if max_c < 15:
        new_apixels.append((0, 0, 0, 0))
    elif max_c < 50:
        alpha = int(((max_c - 15) / 35.0) * 200 * edge_feather)
        new_apixels.append((r, g, b, alpha))
    else:
        alpha = int(min(255, max_c * 1.15 + 40) * edge_feather)
        new_apixels.append((r, g, b, alpha))

im_array.putdata(new_apixels)

# 规范化居中放置在 256 x 256 画布
array_final = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
im_array_scaled = im_array.resize((250, 250), Image.Resampling.LANCZOS)
array_final.paste(im_array_scaled, (3, 3), im_array_scaled)

out_array = os.path.join(PUBLIC_DIR, "effect_peng_thunder_array.png")
array_final.save(out_array, "PNG")
print(f"Saved: {out_array} ({array_final.size})")


# -----------------------------------------------------------------------------
# 3. 处理「九霄神雷天劫霹雳轰击爆裂」 (effect_peng_thunder_strike.png)
# -----------------------------------------------------------------------------
strike_raw = os.path.join(BRAIN_DIR, "effect_peng_thunder_strike_1791182704542.jpg")
print(f"Loading raw thunder strike: {strike_raw}")
im_strike = Image.open(strike_raw).convert("RGBA")
sw, sh = im_strike.size
spixels = list(im_strike.getdata())

new_spixels = []
scx = sw / 2.0
scy = sh / 2.0
s_max_radius = min(scx, scy) - 6

for idx, (r, g, b, a) in enumerate(spixels):
    x = idx % sw
    y = idx // sw
    dist = math.hypot(x - scx, y - scy)

    if dist > s_max_radius:
        new_spixels.append((0, 0, 0, 0))
        continue

    edge_feather = 1.0
    if dist > s_max_radius - 24:
        edge_feather = max(0.0, (s_max_radius - dist) / 24.0)

    max_c = max(r, g, b)
    if max_c < 12:
        new_spixels.append((0, 0, 0, 0))
    elif max_c < 45:
        alpha = int(((max_c - 12) / 33.0) * 190 * edge_feather)
        new_spixels.append((r, g, b, alpha))
    else:
        alpha = int(min(255, max_c * 1.2 + 30) * edge_feather)
        new_spixels.append((r, g, b, alpha))

im_strike.putdata(new_spixels)

# 规范化居中放置在 256 x 256 画布
strike_final = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
im_strike_scaled = im_strike.resize((252, 252), Image.Resampling.LANCZOS)
strike_final.paste(im_strike_scaled, (2, 2), im_strike_scaled)

out_strike = os.path.join(PUBLIC_DIR, "effect_peng_thunder_strike.png")
strike_final.save(out_strike, "PNG")
print(f"Saved: {out_strike} ({strike_final.size})")

print("\nAll 3 Celestial Peng VFX textures processed and exported successfully!")
