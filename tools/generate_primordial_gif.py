import os
from PIL import Image, ImageDraw, ImageFont

pub_dir = r"E:\CODE\game\public"
art_dir = r"C:\Users\Administrator\.gemini\antigravity\brain\bce5c981-c741-4fb6-b269-6bc282a5d487"

whisk_img = Image.open(os.path.join(pub_dir, "boss_primordial_whisk_sheet.png"))
scroll_img = Image.open(os.path.join(pub_dir, "boss_primordial_scroll_sheet.png"))
singularity_img = Image.open(os.path.join(pub_dir, "boss_primordial_singularity_sheet.png"))
rush_img = Image.open(os.path.join(pub_dir, "boss_primordial_rush_sheet.png"))

# 4 actions, 24 frames each
# Grid: 2x2, each cell 256x256 + title banner -> Total width = 540, height = 580
frames = []

font = None
try:
    font = ImageFont.truetype("msyh.ttc", 13)
except:
    font = ImageFont.load_default()

action_titles = [
    ("① 拂尘裂空 · 弹幕挥斩", (76, 201, 240)),
    ("② 真卷启灵 · 九天玄刹神雷", (255, 209, 102)),
    ("③ 混沌归元 · 太极黑洞坍缩", (247, 37, 133)),
    ("④ 太虚折跃 · 触手破虚突刺", (181, 23, 158))
]

for frame_idx in range(24):
    col = frame_idx % 6
    row = frame_idx // 6
    box = (col * 256, row * 256, (col + 1) * 256, (row + 1) * 256)

    f_whisk = whisk_img.crop(box)
    f_scroll = scroll_img.crop(box)
    f_singularity = singularity_img.crop(box)
    f_rush = rush_img.crop(box)

    # Composite into 540x590
    comp = Image.new("RGBA", (536, 590), (7, 11, 18, 255))
    draw = ImageDraw.Draw(comp)

    # 4 cells layout:
    # Cell 0: (8, 30) -> (264, 286)
    # Cell 1: (272, 30) -> (528, 286)
    # Cell 2: (8, 320) -> (264, 576)
    # Cell 3: (272, 320) -> (528, 576)

    cells = [
        (8, 30, f_whisk, action_titles[0]),
        (272, 30, f_scroll, action_titles[1]),
        (8, 320, f_singularity, action_titles[2]),
        (272, 320, f_rush, action_titles[3])
    ]

    for x, y, img_frame, (title, color) in cells:
        # draw title
        draw.rectangle([x, y - 22, x + 256, y - 4], fill=(15, 23, 42, 220))
        draw.text((x + 8, y - 20), title, fill=color, font=font)
        # draw border
        draw.rectangle([x, y, x + 256, y + 256], fill=(5, 8, 14, 255), outline=(30, 41, 59, 255))
        # paste frame with alpha
        comp.alpha_composite(img_frame, (x, y))

    # Frame indicator
    draw.rectangle([210, 568, 326, 586], fill=(15, 23, 42, 240), outline=(76, 201, 240, 180))
    draw.text((226, 570), f"Frame {frame_idx + 1:02d} / 24", fill=(255, 255, 255), font=font)

    # Convert to P mode for GIF with adaptive palette
    frames.append(comp.convert("P", palette=Image.ADAPTIVE))

gif_pub = os.path.join(pub_dir, "primordial_god_animated.gif")
gif_art = os.path.join(art_dir, "primordial_god_animated.gif")

frames[0].save(
    gif_pub,
    save_all=True,
    append_images=frames[1:],
    duration=65,  # ~15 fps
    loop=0,
    optimize=True
)

import shutil
shutil.copyfile(gif_pub, gif_art)
print(f"Generated animated gif: {gif_pub} ({os.path.getsize(gif_pub)} bytes)")
print(f"Saved artifact: {gif_art}")
