# 问道 · 青冥秘境 (Xianxia Roguelite)

> 国风修仙题材 Roguelite 生存割草单机游戏。基于 Electron + Vite + 原生 HTML5 Canvas 2D 构建，零重型框架依赖，启动瞬时，支持键鼠与游戏手柄双振动沉浸体验。

---

## 🎮 游戏核心特色

- **八大修仙流派与道统**：剑修（凌虚子）、法修（清虚仙子）、体修（铁狂徒）、灵兽师（白灵儿）、阵法师（诸葛玄清）、丹药师（云舒）、魔修（厉苍溟）、鬼修（幽月）。
- **24 把门派本命神兵**：贯穿飞剑、回旋残刃、神雷紫电、太极阵盘、泰山重鼎、阴阳弈棋、三昧丹火、修罗血刃等。
- **4 进攻槽位与神通体系**：中心本命法宝锁定，四周纳新与升阶赤炎葫芦、青羽灵狐、回风阵、昊天雷符；参悟连锁电弧与离火焚原等绝技。
- **五大境界突破与秘境领主**：炼气、筑基、结丹、元婴、化神；挑战千年赤炼蛟、幽冥白骨尸皇、九天噬魂魔尊等领主。
- **演武试炼场与秘境图鉴**：内置不死神桩与草人集群，实时秒伤 DPS 分项分析控制台；收录 54+ 项道法万象图鉴。

---

## 🕹️ 操作控制

- **移动**：`W / A / S / D` 或 `方向键` / 🎮 手柄左摇杆与十字键
- **攻击**：神识范围内自动御剑索敌（贴身威胁优先自保）
- **暂停/调息**：`Esc` / `P` / 🎮 `Start` / `Menu`
- **全屏切换**：`F11` / `Alt + Enter`
- **手柄特性**：自动识别 Xbox / PlayStation / Switch 手柄，支持双马达触感震动反馈与菜单焦点寻路。

---

## 🛠️ 开发与测试指令

本项目无需外部音频资源包，全部音效由 Web Audio API 原生程序化实时合成。

```bash
# 安装依赖
npm install

# 启动本地开发调试服务（默认 http://127.0.0.1:5173）
npm run dev

# 运行生产打包
npm run build

# 执行基础冒烟测试 (34项断言)
npm test

# 运行全量自动化测试套件 (包含 10 个核心系统与机制测试套件)
npm run test:all

# 启动桌面端 Electron 应用（开发模式：自动拉起 dev server，支持热更新）
npm run electron:dev

# 构建 Windows 安装包与免安装便携版
npm run electron:dist

# 贴图体积优化（按实际绘制尺寸降采样 + 无损重编码，需 Python + Pillow + numpy）
npm run art:optimize

# 导入新素材（自动抠底 / 归一化构图 / 切帧 / 打包序列帧）
npm run art:import -- --in art-source/raw/xxx.jpg --out public/xxx.png --size 256 --anchor bottom
```

### 端口被占用时（`EACCES: permission denied 127.0.0.1:xxxx`）

Windows 上如果目标端口被别的程序绑定，Vite 会报
`Error: listen EACCES: permission denied 127.0.0.1:xxxx` —— **看着像权限不足，实际是端口冲突**
（Windows 对已被占用的地址返回 `WSAEACCES`）。

本项目默认端口是 **5173**（原为 3000，但该端口常年被 Clash Verge 等代理工具占用）。换端口：

```bash
PORT=4000 npm run dev          # bash / PowerShell 7
$env:PORT=4000; npm run dev    # Windows PowerShell
```

排查是谁占用了端口：

```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen |
  ForEach-Object { Get-Process -Id $_.OwningProcess }
```

---

## 🎨 素材管线

贴图相关的工具都在 `tools/art/`，原始出图归档在 `art-source/`。

| 工具 | 作用 |
| :--- | :--- |
| [`tools/art/artlib.py`](tools/art/artlib.py) | 核心库：抠底、预乘 alpha 重采样、切帧、打包 |
| [`tools/art/import_art.py`](tools/art/import_art.py) | 通用导入器：AI 出图 → 游戏可用贴图 |
| [`tools/art/optimize_assets.py`](tools/art/optimize_assets.py) | 按实际绘制尺寸压缩贴图 |
| [`tools/art/align_frames.py`](tools/art/align_frames.py) | 序列帧网格按头顶锚定对齐 + 逐帧高度归一 |
| [`tools/capture_frame.cjs`](tools/capture_frame.cjs) | 实装截图验证（战斗内 / 候选大厅） |

截图验证（`npm run art:frame`）：

```bash
npm run build
npm run art:frame -- --char spell --weapon spell_fuchen --out shot.png
npm run art:frame -- --char spell --weapon spell_bagua --screen char-select --out hall.png
```

**关于贴图分辨率**：游戏画布缓冲区被 `renderScale` 钳制在 1920×1080（最多 2400×1350），
与显示器是 1080p / 2K / 4K 无关。因此贴图的可用细节上限就是它在 1920×1080 缓冲区里占的像素数，
超出部分在 2K/4K 上不会带来任何可见收益。`optimize_assets.py` 里的 `TARGETS` 表就是按
源码中实测的绘制尺寸推导出来的，`PROTECTED` 表则记录了不能压的贴图及其原因。

抠底采用**连通域判定**：只有能从图像边缘走到的背景才算真背景。否则白底上的白袍、
浅色皮肤会被一起抠掉，在角色身上留下半透明空洞。

---

## 📚 详细设计文档

系统数值平衡与设计详情请参阅文档：[docs/GAME_DESIGN_MANUAL.md](docs/GAME_DESIGN_MANUAL.md)。
