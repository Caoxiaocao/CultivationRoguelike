import os
import math
from PIL import Image

BRAIN_DIR = r"C:\Users\Administrator\.gemini\antigravity\brain\bce5c981-c741-4fb6-b269-6bc282a5d487"
PUBLIC_DIR = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public"))

# 1. Process Boss (Remove white background)
boss_raw = os.path.join(BRAIN_DIR, "boss_asura_demon_1791085967789.jpg")
print(f"Loading boss: {boss_raw}")
im_boss = Image.open(boss_raw).convert("RGBA")
bw, bh = im_boss.size
pixels = list(im_boss.getdata())

# Use flood-fill / BFS from borders to remove white background without touching internal highlights
visited = bytearray(bw * bh)
queue = []
for x in range(bw):
    queue.append(x)
    queue.append((bh - 1) * bw + x)
    visited[x] = 1
    visited[(bh - 1) * bw + x] = 1
for y in range(bh):
    queue.append(y * bw)
    queue.append(y * bw + bw - 1)
    visited[y * bw] = 1
    visited[y * bw + bw - 1] = 1

out_pixels = [list(p) for p in pixels]

head = 0
while head < len(queue):
    idx = queue[head]
    head += 1
    r, g, b, a = out_pixels[idx]
    # Check if pixel is white / light gray background
    is_white = (r > 215 and g > 215 and b > 215) or (r > 200 and g > 200 and b > 200 and abs(r - g) < 15 and abs(g - b) < 15)
    if is_white:
        out_pixels[idx][3] = 0
        x = idx % bw
        y = idx // bw
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < bw and 0 <= ny < bh:
                nidx = ny * bw + nx
                if not visited[nidx]:
                    visited[nidx] = 1
                    queue.append(nidx)

# Smooth edges
for y in range(1, bh - 1):
    for x in range(1, bw - 1):
        idx = y * bw + x
        if out_pixels[idx][3] > 0:
            r, g, b, a = out_pixels[idx]
            if r > 215 and g > 215 and b > 215:
                lum = (r + g + b) // 3
                out_pixels[idx][3] = max(0, min(255, (255 - lum) * 3))

im_boss.putdata([tuple(p) for p in out_pixels])
# Autocrop bbox
bbox = im_boss.getbbox()
if bbox:
    im_boss = im_boss.crop(bbox)

# Fit into 380x380
final_boss = Image.new("RGBA", (380, 380), (0, 0, 0, 0))
im_boss.thumbnail((370, 370), Image.Resampling.LANCZOS)
fx = (380 - im_boss.width) // 2
fy = (380 - im_boss.height) // 2
final_boss.paste(im_boss, (fx, fy))
boss_out = os.path.join(PUBLIC_DIR, "boss_asura_demon.png")
final_boss.save(boss_out, "PNG")
print(f"Saved {boss_out} ({final_boss.size})")

# 2. Process Soul (Cyan screaming wraith on black)
soul_raw = os.path.join(BRAIN_DIR, "effect_asura_soul_1791085982088.jpg")
print(f"Loading soul: {soul_raw}")
im_soul = Image.open(soul_raw).convert("RGBA")
sw, sh = im_soul.size
spixels = list(im_soul.getdata())
new_spixels = []
for r, g, b, a in spixels:
    max_c = max(r, g, b)
    if max_c < 18:
        new_spixels.append((0, 0, 0, 0))
    elif max_c < 55:
        alpha = int(((max_c - 18) / 37.0) * 255)
        new_spixels.append((r, g, b, alpha))
    else:
        new_spixels.append((r, g, b, 255))

im_soul.putdata(new_spixels)
sbbox = im_soul.getbbox()
if sbbox:
    im_soul = im_soul.crop(sbbox)

final_soul = Image.new("RGBA", (140, 140), (0, 0, 0, 0))
im_soul.thumbnail((136, 136), Image.Resampling.LANCZOS)
sx = (140 - im_soul.width) // 2
sy = (140 - im_soul.height) // 2
final_soul.paste(im_soul, (sx, sy))
soul_out = os.path.join(PUBLIC_DIR, "effect_asura_soul.png")
final_soul.save(soul_out, "PNG")
print(f"Saved {soul_out} ({final_soul.size})")

# 3. Process Black Hole (Circular mask)
hole_raw = os.path.join(BRAIN_DIR, "effect_asura_blackhole_1791085999317.jpg")
print(f"Loading blackhole: {hole_raw}")
im_hole = Image.open(hole_raw).convert("RGBA")
hw, hh = im_hole.size
cx, cy = hw / 2.0, hh / 2.0
max_r = min(hw, hh) * 0.485
hpixels = list(im_hole.getdata())
new_hpixels = []
for i, (r, g, b, a) in enumerate(hpixels):
    x = i % hw
    y = i // hw
    dist = math.hypot(x - cx, y - cy)
    if dist > max_r:
        new_hpixels.append((r, g, b, 0))
    elif dist > max_r - 6:
        fade = (max_r - dist) / 6.0
        new_hpixels.append((r, g, b, int(a * fade)))
    else:
        new_hpixels.append((r, g, b, a))

im_hole.putdata(new_hpixels)
final_hole = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
im_hole.thumbnail((240, 240), Image.Resampling.LANCZOS)
hx = (240 - im_hole.width) // 2
hy = (240 - im_hole.height) // 2
final_hole.paste(im_hole, (hx, hy))
hole_out = os.path.join(PUBLIC_DIR, "effect_asura_blackhole.png")
final_hole.save(hole_out, "PNG")
print(f"Saved {hole_out} ({final_hole.size})")

print("All assets successfully processed and saved!")
