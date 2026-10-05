import os
from PIL import Image, ImageDraw, ImageFont

BRAIN_DIR = r"C:\Users\Administrator\.gemini\antigravity\brain\bce5c981-c741-4fb6-b269-6bc282a5d487"
PUB_DIR = r"E:\CODE\game\public"

rush_sheet = Image.open(os.path.join(PUB_DIR, "boss_peng_rush_sheet.png")).convert("RGBA")
feather_sheet = Image.open(os.path.join(PUB_DIR, "boss_peng_feather_sheet.png")).convert("RGBA")
screech_sheet = Image.open(os.path.join(PUB_DIR, "boss_peng_screech_sheet.png")).convert("RGBA")

cols = 6
rows = 4
total_frames = 24
frame_w = 256
frame_h = 256

# 加载系统原生中文字体
font_path = "C:/Windows/Fonts/msyh.ttc"
font_title = ImageFont.truetype(font_path, 22) if os.path.exists(font_path) else ImageFont.load_default()
font_subtitle = ImageFont.truetype(font_path, 13) if os.path.exists(font_path) else ImageFont.load_default()
font_card = ImageFont.truetype(font_path, 16) if os.path.exists(font_path) else ImageFont.load_default()
font_badge = ImageFont.truetype(font_path, 12) if os.path.exists(font_path) else ImageFont.load_default()

def get_frame(sheet, frame_idx):
    col = frame_idx % cols
    row = frame_idx // cols
    x = col * frame_w
    y = row * frame_h
    return sheet.crop((x, y, x + frame_w, y + frame_h))

# -------------------------------------------------------------
# 1. 生成 24 帧并排循环动画 GIF (peng_actions_animated.gif)
# -------------------------------------------------------------
gif_w = 256 * 3 + 40
gif_h = 256 + 70

gif_frames = []

for f in range(total_frames):
    canvas = Image.new("RGBA", (gif_w, gif_h), (11, 17, 26, 255))
    draw = ImageDraw.Draw(canvas)

    # 绘制顶栏标题与帧号
    title_text = f"巡天金翅大鹏 · 24帧三动作循环动态走查 [帧 {f+1}/24]"
    draw.text((20, 10), title_text, fill=(255, 183, 3, 255), font=font_card)

    # 动作 1：冲刺飞扑
    act1_x = 10
    act1_y = 42
    draw.rounded_rectangle([act1_x, act1_y, act1_x + 256, act1_y + 256], radius=8, outline=(255, 183, 3, 100), width=1)
    frame_rush = get_frame(rush_sheet, f)
    canvas.alpha_composite(frame_rush, (act1_x, act1_y))
    draw.text((act1_x + 10, act1_y + 10), "① 冲刺飞扑", fill=(255, 234, 0, 240), font=font_badge)

    # 动作 2：扇翅射羽
    act2_x = act1_x + 256 + 10
    act2_y = 42
    draw.rounded_rectangle([act2_x, act2_y, act2_x + 256, act2_y + 256], radius=8, outline=(255, 183, 3, 100), width=1)
    frame_feather = get_frame(feather_sheet, f)
    canvas.alpha_composite(frame_feather, (act2_x, act2_y))
    draw.text((act2_x + 10, act2_y + 10), "② 扇翅射羽", fill=(255, 234, 0, 240), font=font_badge)

    # 动作 3：矗立鸣叫
    act3_x = act2_x + 256 + 10
    act3_y = 42
    draw.rounded_rectangle([act3_x, act3_y, act3_x + 256, act3_y + 256], radius=8, outline=(255, 183, 3, 100), width=1)
    frame_screech = get_frame(screech_sheet, f)
    canvas.alpha_composite(frame_screech, (act3_x, act3_y))
    draw.text((act3_x + 10, act3_y + 10), "③ 矗立鸣叫", fill=(255, 234, 0, 240), font=font_badge)

    gif_frames.append(canvas.convert("RGB"))

gif_out = os.path.join(BRAIN_DIR, "peng_actions_animated.gif")
gif_frames[0].save(
    gif_out,
    save_all=True,
    append_images=gif_frames[1:],
    duration=83, # 12 FPS
    loop=0
)
print("Saved animated GIF:", gif_out)

# -------------------------------------------------------------
# 2. 生成静态全景多帧展示大图 (peng_actions_showcase.png)
# -------------------------------------------------------------
showcase_w = 1200
showcase_h = 800
showcase = Image.new("RGBA", (showcase_w, showcase_h), (9, 13, 19, 255))
s_draw = ImageDraw.Draw(showcase)

# 标题栏
s_draw.text((30, 16), "巡天金翅大鹏 · 24帧三动作序列帧全景图", fill=(255, 183, 3, 255), font=font_title)
s_draw.text((30, 48), "原版高精三视图无缝重构 · 冲刺飞扑 (24帧) / 扇动翅膀发射羽毛 (24帧) / 矗立鸣叫 (24帧)", fill=(148, 163, 184, 255), font=font_subtitle)

# 挑选 4 个关键帧展示动作演变过程: 帧 3 (蓄力), 帧 9 (爆发), 帧 15 (绝杀/齐射/长鸣), 帧 22 (复位)
key_indices = [2, 8, 14, 21]
actions_info = [
    ("① 冲刺飞扑 (Dive Rush / Sprint Swoop)", rush_sheet, 85),
    ("② 扇动翅膀发射羽毛 (Wing Flap & Feather Barrage)", feather_sheet, 320),
    ("③ 矗立鸣叫 (Perched Screech / Celestial Call)", screech_sheet, 555)
]

thumb_size = 200

for title, sheet, start_y in actions_info:
    s_draw.text((30, start_y), title, fill=(251, 191, 36, 255), font=font_card)
    s_draw.line([(30, start_y + 24), (1170, start_y + 24)], fill=(255, 183, 3, 70), width=1)

    for i, f_idx in enumerate(key_indices):
        bx = 30 + i * (thumb_size + 24)
        by = start_y + 32
        s_draw.rounded_rectangle([bx, by, bx + thumb_size, by + thumb_size], radius=6, outline=(255, 183, 3, 80), width=1)
        f_crop = get_frame(sheet, f_idx).resize((thumb_size, thumb_size), Image.Resampling.LANCZOS)
        showcase.alpha_composite(f_crop, (bx, by))
        # 标签背景胶囊
        s_draw.rounded_rectangle([bx + 6, by + 6, bx + 70, by + 24], radius=4, fill=(15, 23, 42, 200))
        s_draw.text((bx + 10, by + 8), f"帧 {f_idx+1}/24", fill=(56, 189, 248, 240), font=font_badge)

showcase_out = os.path.join(BRAIN_DIR, "peng_actions_showcase.png")
showcase.save(showcase_out, "PNG")
print("Saved showcase PNG:", showcase_out)
