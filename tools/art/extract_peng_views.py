#!/usr/bin/env python3
"""
tools/art/extract_peng_views.py
Extract and chroma-key the 3 views of 巡天金翅大鹏 from user design sheet
"""
import os
from PIL import Image

BRAIN_DIR = r"C:\Users\Administrator\.gemini\antigravity\brain\bce5c981-c741-4fb6-b269-6bc282a5d487"
SRC_IMG = os.path.join(BRAIN_DIR, ".user_uploaded", "media_1791180259977.jpg")
OUT_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "boss_celestial_peng"))
os.makedirs(OUT_DIR, exist_ok=True)

print(f"Loading {SRC_IMG}...")
im = Image.open(SRC_IMG).convert("RGB")
w, h = im.size
print(f"Image size: {w}x{h}")

def chroma_key(sub_img, green_thresh=18, feather=25):
    """Clean green chroma key with green spill suppression"""
    img_rgba = sub_img.convert("RGBA")
    pixels = img_rgba.load()
    sw, sh = img_rgba.size

    for y in range(sh):
        for x in range(sw):
            r, g, b, a = pixels[x, y]
            # Green dominance metric
            max_rb = max(r, b)
            diff = g - max_rb

            if diff > green_thresh:
                if diff > green_thresh + feather:
                    pixels[x, y] = (0, 0, 0, 0)
                else:
                    # Feather transition edge
                    alpha_factor = 1.0 - (diff - green_thresh) / float(feather)
                    alpha = int(255 * alpha_factor)
                    # Despill: clamp green to max(r, b) so edge glow stays golden
                    new_g = max_rb
                    pixels[x, y] = (r, new_g, b, alpha)
            elif g > max_rb:
                # Slight green despill on feather highlights
                pixels[x, y] = (r, int((g + max_rb) / 2), b, 255)

    return img_rgba

# View 1: Front view (0 to 455)
im_front = im.crop((0, 0, 460, h))
im_front_clean = chroma_key(im_front)
bbox1 = im_front_clean.getbbox()
if bbox1:
    im_front_clean = im_front_clean.crop(bbox1)
out_front = os.path.join(OUT_DIR, "view_front.png")
im_front_clean.save(out_front, "PNG")
print(f"Saved {out_front}: {im_front_clean.size}")

# View 2: Side profile view (430 to 665)
im_side = im.crop((420, 0, 665, h))
im_side_clean = chroma_key(im_side)
bbox2 = im_side_clean.getbbox()
if bbox2:
    im_side_clean = im_side_clean.crop(bbox2)
out_side = os.path.join(OUT_DIR, "view_side.png")
im_side_clean.save(out_side, "PNG")
print(f"Saved {out_side}: {im_side_clean.size}")

# View 3: Back view (640 to 1024)
im_back = im.crop((630, 0, 1024, h))
im_back_clean = chroma_key(im_back)
bbox3 = im_back_clean.getbbox()
if bbox3:
    im_back_clean = im_back_clean.crop(bbox3)
out_back = os.path.join(OUT_DIR, "view_back.png")
im_back_clean.save(out_back, "PNG")
print(f"Saved {out_back}: {im_back_clean.size}")

print("Extraction complete!")
