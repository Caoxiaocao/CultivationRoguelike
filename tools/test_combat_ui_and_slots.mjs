/**
 * 战斗画面 UI 与法宝灵宠 4 槽位系统单元测试
 *
 * 验证：
 * 1. 界面 DOM 结构：左下角角色立绘与血条境界条、右下角十字形武器槽（中间本命、四周4槽位）
 * 2. 槽位类型区分：独立进攻能力法宝/灵宠占用槽位，属性/被动/强化卡不占用槽位
 * 3. 槽位收集机制：未满时入槽、相同物品收集升 1 级 (Lv.1 -> Lv.2)
 * 4. 槽位满额与替换机制：4 个槽占满后不能收集新法宝，但可指定槽位新旧替换
 * 5. 开局重置与状态同步
 */
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`PASS  ${message}`)
    passed++
  } else {
    console.error(`FAIL  ${message}`)
    failed++
  }
}

// 模拟 DOM 桩
const elements = new Map()
function makeEl(id) {
  const el = {
    id,
    style: {},
    dataset: {},
    onclick: null,
    _classes: new Set(),
    _text: '',
    _html: '',
    _handlers: {},
    _children: [],
  }
  el.classList = {
    add: (c) => el._classes.add(c),
    remove: (c) => el._classes.delete(c),
    contains: (c) => el._classes.has(c),
    toggle: (c, force) => {
      const on = force === undefined ? !el._classes.has(c) : force
      if (on) el._classes.add(c)
      else el._classes.delete(c)
    },
  }
  el.addEventListener = (type, fn) => { (el._handlers[type] = el._handlers[type] || []).push(fn) }
  el.click = () => { for (const fn of el._handlers.click || []) fn(); if (el.onclick) el.onclick() }
  el.querySelectorAll = (sel) => {
    if (sel === '[data-card]') return el._children.filter(c => 'card' in c.dataset)
    if (sel === '[data-loot]') return el._children.filter(c => 'loot' in c.dataset)
    return []
  }
  el.querySelector = (sel) => {
    if (sel.startsWith('#')) return getEl(sel)
    return makeEl(sel)
  }
  el.appendChild = (child) => { el._children.push(child); return child }
  el.remove = () => {}
  el.getAttribute = (attr) => el[attr] || null
  el.setAttribute = (attr, val) => { el[attr] = val }
  Object.defineProperty(el, 'textContent', { get: () => el._text, set: (v) => { el._text = String(v) } })
  Object.defineProperty(el, 'innerHTML', { get: () => el._html, set: (v) => { el._html = String(v) } })
  return el
}

function getEl(sel) {
  if (!elements.has(sel)) elements.set(sel, makeEl(sel))
  return elements.get(sel)
}

const canvasEl = getEl('#game')
canvasEl.width = 960
canvasEl.height = 540
canvasEl.getContext = () => ({
  fillRect() {}, strokeRect() {}, beginPath() {}, moveTo() {}, lineTo() {},
  stroke() {}, fill() {}, arc() {}, save() {}, restore() {},
  createRadialGradient: () => ({ addColorStop() {} }),
  createLinearGradient: () => ({ addColorStop() {} }),
  drawImage() {}, setLineDash() {}, translate() {}, rotate() {}
})

globalThis.document = {
  querySelector: getEl,
  querySelectorAll: () => [],
  createElement: (tag) => makeEl(tag),
}
globalThis.MutationObserver = class { observe() {} }
globalThis.window = { addEventListener() {} }
globalThis.performance = { now: () => Date.now() }
globalThis.requestAnimationFrame = () => {}
globalThis.location = { reload() {} }

const assets = readdirSync(resolve('dist/assets'))
const bundle = assets.find(name => name.endsWith('.js'))
if (!bundle) throw new Error('未找到构建产物，请先执行 npm run build')
await import(pathToFileURL(resolve('dist/assets', bundle)).href)

const gc = globalThis.window.__gameControls
assert(!!gc, '__gameControls 挂载成功')

// 1. 验证左下角 HUD 元素存在与底部对齐容器
assert(!!getEl('#hud-bottom-bar'), '战斗界面底部统一对齐容器 #hud-bottom-bar 存在，确保左右面板中心高度一致')
const hudBottomLeft = getEl('#hud-bottom-left')
assert(!!hudBottomLeft, '战斗界面左下角角色状态容器 #hud-bottom-left 存在')
assert(!!getEl('#hp-bar'), '左下角血条填充元素 #hp-bar 存在')
assert(!!getEl('#hp-value'), '左下角血量文本元素 #hp-value 存在')
assert(!!getEl('#xp-bar'), '左下角境界灵气条元素 #xp-bar 存在')
assert(!!getEl('#xp-value'), '左下角境界灵气文本元素 #xp-value 存在')
assert(!!getEl('#hud-char-avatar'), '左下角角色立绘头像元素 #hud-char-avatar 存在')
assert(!!getEl('#hud-char-name'), '左下角角色道号文本元素 #hud-char-name 存在')
assert(!!getEl('#hud-char-realm-badge'), '左下角角色大境界徽章 #hud-char-realm-badge 存在')

// 1.5 验证顶部正中 HUD 元素
assert(!!getEl('#timer'), '顶部正中倒计时 #timer 存在')
assert(!!getEl('#boss-hud-bar'), '顶部正中领主血条 #boss-hud-bar 存在')

// 2. 验证右下角武器槽 HUD 元素存在（十字布局：中间本命，四周4槽位）
const hudBottomRight = getEl('#hud-bottom-right')
assert(!!hudBottomRight, '战斗界面右下角武器槽容器 #hud-bottom-right 存在')
assert(!!getEl('#natal-weapon-slot'), '中心本命法宝槽位 #natal-weapon-slot 存在')
assert(!!getEl('#offensive-slot-0'), '上方进攻槽位 0 #offensive-slot-0 存在')
assert(!!getEl('#offensive-slot-1'), '右方进攻槽位 1 #offensive-slot-1 存在')
assert(!!getEl('#offensive-slot-2'), '下方进攻槽位 2 #offensive-slot-2 存在')
assert(!!getEl('#offensive-slot-3'), '左方进攻槽位 3 #offensive-slot-3 存在')
assert(!!getEl('#modal-slot-replace'), '槽位满额替换选择模态窗口 #modal-slot-replace 存在')

// 3. 验证进攻能力法宝判定 (isOffensiveItem)
assert(gc.isOffensiveItem('fire') === true, '赤炎葫芦属于独立进攻法宝')
assert(gc.isOffensiveItem('pet') === true, '青羽灵狐属于独立进攻灵宠')
assert(gc.isOffensiveItem('formation') === true, '回风阵属于独立进攻法宝/阵法')
assert(gc.isOffensiveItem('thunder') === true, '昊天雷符属于独立进攻法宝/符箓')

assert(gc.isOffensiveItem('sword') === false, '本命飞剑强化不占用次级槽位')
assert(gc.isOffensiveItem('chain_arc') === false, '连锁电弧作用于主武器，不占用槽位')
assert(gc.isOffensiveItem('gather') === false, '聚灵诀属于角色被动属性，不占用槽位')
assert(gc.isOffensiveItem('body') === false, '玄木灵体属于角色被动体质，不占用槽位')
assert(gc.isOffensiveItem('haste') === false, '御风行属于角色身法被动，不占用槽位')
assert(gc.isOffensiveItem('meridian') === false, '逆脉诀属于功法被动，不占用槽位')

// 4. 验证槽位装备流程 (未满时逐个入槽)
gc.game.offensiveSlots = [null, null, null, null]
assert(gc.getOccupiedOffensiveSlotCount() === 0, '初始进攻槽位为空 (0/4)')

const res1 = gc.equipOrUpgradeOffensiveItem('fire')
assert(res1.success && res1.action === 'equipped' && res1.slotIndex === 0, '赤炎葫芦放入上方槽位 0')
assert(gc.game.offensiveSlots[0].name === '赤炎葫芦' && gc.game.offensiveSlots[0].level === 1, '槽位 0 显示为赤炎葫芦 Lv.1')

const res2 = gc.equipOrUpgradeOffensiveItem('pet')
assert(res2.success && res2.action === 'equipped' && res2.slotIndex === 1, '青羽灵狐放入右方槽位 1')
assert(gc.game.offensiveSlots[1].name === '青羽灵狐' && gc.game.offensiveSlots[1].level === 1, '槽位 1 显示为青羽灵狐 Lv.1')

const res3 = gc.equipOrUpgradeOffensiveItem('formation')
assert(res3.success && res3.action === 'equipped' && res3.slotIndex === 2, '回风阵放入下方槽位 2')

const res4 = gc.equipOrUpgradeOffensiveItem('thunder')
assert(res4.success && res4.action === 'equipped' && res4.slotIndex === 3, '昊天雷符放入左方槽位 3')
assert(gc.getOccupiedOffensiveSlotCount() === 4, '4 个槽位已全部占满 (4/4)')

// 5. 验证收集到相同法宝/灵宠时自动升 1 级 (升级机制)
const upgradeRes = gc.equipOrUpgradeOffensiveItem('fire')
assert(upgradeRes.success && upgradeRes.action === 'upgraded' && upgradeRes.slotIndex === 0, '再次收集赤炎葫芦触发槽位 0 升级')
assert(gc.game.offensiveSlots[0].level === 2, '赤炎葫芦槽位升至 Lv.2')
assert(gc.getOccupiedOffensiveSlotCount() === 4, '槽位数量保持 4，未增加新槽位')

// 再次收集升级
gc.equipOrUpgradeOffensiveItem('pet')
assert(gc.game.offensiveSlots[1].level === 2, '青羽灵狐槽位升至 Lv.2')

// 6. 验证满槽时尝试放入未拥有的新法宝被阻挡 (返回 full)
gc.game.offensiveSlots[3] = null // 先空出一个
gc.equipOrUpgradeOffensiveItem('thunder') // 填满
assert(gc.getOccupiedOffensiveSlotCount() === 4, '重新填满 4 个槽位')

// 7. 验证新旧替换机制 (replaceOffensiveSlot)
// 用 thunder 替换槽位 0 (原为赤炎葫芦 Lv.2)
const replaced = gc.replaceOffensiveSlot(0, 'thunder')
assert(replaced === true, '执行 replaceOffensiveSlot(0, "thunder") 成功')
assert(gc.game.offensiveSlots[0].name === '昊天雷符' && gc.game.offensiveSlots[0].level === 1, '槽位 0 成功被新法宝替换并重置为 Lv.1')
assert(!gc.game.weapons.some(x => x.id === 'fire'), '旧法宝赤炎葫芦已从战斗技能列表中剔除')

// 8. 验证开局重置
gc.startRunFromSelection()
assert(gc.game.offensiveSlots.every(s => s === null), '新开局时 4 个进攻槽位完全清空置为 null')
assert(gc.game.weapons.length === 1, '新开局武器列表仅保留中心唯一的本命法宝')

console.log(`\n测试汇总: ${passed} 项通过, ${failed} 项失败\n`)
if (failed > 0) process.exit(1)
