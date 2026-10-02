# 凌虚子 · 原版 Q 版风格完全统一动作序列帧

> [!IMPORTANT]
> **画风与角色形象 100% 严谨对齐原版立绘**  
> 直接以原版 [`player_anime.png`](file:///e:/CODE/game/public/player_anime.png) 作为直接参考图像（Reference Image）进行同源衍生重绘：
> 1. **头身比例**：完全统一为经典 **3.5 头身 Q 版动漫仙侠体型**，解决先前比例拉长变样的问题；
> 2. **容貌与发型**：完美复刻凌虚子清秀俊逸的面容、灵动琥珀色大眼、额前分发流海、高束发马尾、**白玉祥云发簪**与**招展的赤红发带**；
> 3. **道服细节**：准确还原**墨绿色金边绣鹤无袖罩袍**（内衬白底青边阔袖长衫）、墨绿布带束腰、白裤与黑靴；
> 4. **御剑剑诀（彻底解耦武器）**：双手完全空置，以正统仙宗「**两指成剑 · 掐诀驭器**」为主，与游戏内周身游曳环绕的独立飞剑系统天衣无缝、绝不穿帮！

---

## 一、 原版立绘与三大本命神兵序列帧画廊

````carousel
![原版角色参考立绘 (凌虚子)](C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487/.user_uploaded/media_1790922335404.png)
<!-- slide -->
![青锋灵剑 · 穿云剑指身法序列帧 (Q版同源版)](C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487/lingxuzi_q_qingfeng_1790926930102.jpg)
<!-- slide -->
![疾风残刃 · 双手机敏御风诀序列帧 (Q版同源版)](C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487/lingxuzi_q_jifeng_1790926948735.jpg)
<!-- slide -->
![奔雷古剑 · 九天引雷诀序列帧 (Q版同源版)](C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487/lingxuzi_q_benlei_1790926967859.jpg)
<!-- slide -->
![实装游戏透明序列帧贴图 (青锋灵剑)](C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487/player_sword_qingfeng_sheet.png)
<!-- slide -->
![实装游戏透明序列帧贴图 (疾风残刃)](C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487/player_sword_jifeng_sheet.png)
<!-- slide -->
![实装游戏透明序列帧贴图 (奔雷古剑)](C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487/player_sword_benlei_sheet.png)
````

---

## 二、 动作帧与实装效果

| 动作阶段 | 帧号 | 青锋灵剑（贯穿索敌） | 疾风残刃（360°风暴） | 奔雷古剑（九天落雷） |
| :--- | :--- | :--- | :--- | :--- |
| **待机姿态** | Frame 0 | 胸前并指成剑，衣袂微动 | 低姿微蹲，双指倒剪护胸 | 沉步抱元，右手单指斜指苍穹 |
| **移步起手** | Frame 1 | 疾步踏出，单指前指锁定妖魔 | 疾风滑步，双臂交替划风 | 宽步沉腰，双臂问天聚雷 |
| **蓄劲引势** | Frame 2 | 斜向指天，指尖泛起青锋灵晕 | 旋身自转，双袖顺势飞扬带风 | 九天雷霆入体，双腕紫电盘旋 |
| **斩击巅峰** | Frame 3 | 剑指全力前戳，破空青芒爆射 | 双臂十字撕开，环形翡翠风暴爆裂 | 双臂如重锤重重下劈，引雷轰地 |
| **破空余韵** | Frame 4 | 破空剑环涟漪向前激荡 | 翡翠风痕向八方肆虐飞旋 | 紫色蛛网电弧自脚底与指尖碎裂 |
| **敛息收招** | Frame 5 | 剑指划半圆回引，气定神闲 | 双手合十合掌，旋风悠然消散 | 吐纳调息，雷芒回缩，归于沉寂 |

---

## 三、 测试与验证指标

1. **同屏法宝视觉完美协同**：空中游曳与飞出的青锋剑/疾风双刃/奔雷古剑与角色剑指方向完全吻合，手中不拿剑，告别重复穿帮；
2. **全套自动化测试全部通过**：13/13 套测试（包括 `tools/test_player_weapon_sheets.mjs` 40 项断言）全绿通过；
3. **桌面端路径兼容**：所有静态贴图均采用相对路径引用，已成功构建并打包。
