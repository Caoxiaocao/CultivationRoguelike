# art-source —— 原始出图归档

这里存放**生成游戏贴图所用的原始素材**，以及当时的设计文稿。

## 为什么要有这个目录

这些文件原先只存在于本机的 Antigravity 会话目录里：

```
C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487/
```

那个目录**不在版本库里，也没有任何备份**。一旦清理缓存、卸载 Antigravity 或重装系统，
以下几组素材就再也无法重新生成了（现有的 `public/*.png` 都是经过抠图/切帧/缩放处理的产物，
无法反推回原始出图）。因此把它们归档进仓库。

## 目录结构

```
art-source/
├── raw/      16 张原始出图（AI 生成，未做任何处理）
└── briefs/   5 份设计文稿 + 5 份元数据（Antigravity 会话产物）
```

## raw/ 与产物的对应关系

### 当前管线仍在使用（9 张）

| 原始出图 | 生成脚本 | 产物 |
| :--- | :--- | :--- |
| `lingxuzi_q_qingfeng_1790926930102.jpg` | `generate_player_weapon_sheets.cjs` | `player_sword_qingfeng_sheet.png` |
| `lingxuzi_q_jifeng_1790926948735.jpg` | 同上 | `player_sword_jifeng_sheet.png` |
| `lingxuzi_q_benlei_1790926967859.jpg` | 同上 | `player_sword_benlei_sheet.png` |
| `corpse_poison_pool_art_1790850655543.jpg` | `generate_poison_pool_asset.cjs` | `effect_corpse_poison_pool.png` |
| `corpse_skull_art_1790848004880.jpg` | `generate_realistic_corpse_emperor_assets.cjs` | `boss_corpse_skull_sheet.png` |
| `corpse_tri_skull_art_1790848064867.jpg` | 同上 | `boss_corpse_tri_skull_sheet.png` |
| `corpse_arm_art_1790848083796.jpg` | 同上 | `boss_corpse_arm_sheet.png` |
| `corpse_knuckle_art_1790848102579.jpg` | 同上 | `effect_corpse_knuckle.png` |
| `corpse_ghost_fire_art_1790848139526.jpg` | 同上 | `effect_corpse_ghost_fire.png` |

### 历史迭代，当前管线未引用（7 张）

`dragon_spritesheet_1790837108096.jpg`、`lingxuzi_mudra_{qingfeng,jifeng,benlei}_*.jpg`、
`sword_{qingfeng,jifeng,benlei}_action_sheet_*.jpg`

这些是早期尝试（例如"掐诀"版动作），后来被 `lingxuzi_q_*` 系列取代。
保留是为了留档：万一想回退或参考早期风格，原始出图还在。

## briefs/ 是什么

Antigravity 当时写的**美术设计文稿**，是这个项目事实上的"画风圣经"，例如：

- `lingxuzi_weapon_action_sheets.md` —— 凌虚子的 3.5 头身 Q 版比例、道服细节，
  以及 6 帧剑招逐帧动作表（待机 / 移步 / 蓄劲 / 斩击 / 破空 / 收招）
- `boss_corpse_emperor_redesign.md`、`enemy_spritesheets_design.md` 等

> [!NOTE]
> 文稿里的图片链接是 `C:/Users/Administrator/.gemini/...` 的**绝对路径，现已全部失效**。
> 文稿按原样归档作为风格参考，未做改写。对应的图片请在 `raw/` 里找。

## 怎么用它重新生成贴图

三个 `tools/generate_*.cjs` 已改为从本目录读取，不再硬编码绝对路径：

```bash
# 默认读取 art-source/raw
node tools/generate_player_weapon_sheets.cjs

# 也可以用环境变量指向别处（例如新一批出图）
ART_SOURCE_DIR=/path/to/new/art node tools/generate_player_weapon_sheets.cjs
```

**新素材建议直接用 `tools/art/import_art.py`**（见下），它比旧的 Electron + Canvas 脚本更快、
抠图质量更好，且支持切帧与打包：

```bash
python tools/art/import_art.py --in art-source/raw/xxx.jpg --out public/xxx.png \
       --grid 3x2 --frame 180 --pack-cols 3 --anchor bottom --preview
```

## 相关文档

- 素材处理核心库：[`tools/art/artlib.py`](../tools/art/artlib.py)
- 通用导入器：[`tools/art/import_art.py`](../tools/art/import_art.py)
- 贴图压缩器：[`tools/art/optimize_assets.py`](../tools/art/optimize_assets.py)
