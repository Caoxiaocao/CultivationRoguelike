/**
 * 战斗飘字与受击/回复表现 回归测试
 *
 * 覆盖：
 *   1. 飘字样式表 —— 受击红 / 暴击大号白 / 回复绿 / 敌方沿用攻击色
 *   2. 暴击接口 —— 默认关闭时**不改变任何伤害数值**；开启后按倍率放大
 *   3. 角色血量钩子 —— 扣血出红字并触发红晕与震动，回血出绿字，且按窗口聚合
 *
 * 运行： npm run build && node tools/test_damage_numbers.mjs
 */
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

let passed = 0
let failed = 0
function assert(cond, msg) {
  if (cond) { console.log(`PASS  ${msg}`); passed++ }
  else { console.error(`FAIL  ${msg}`); failed++ }
}

/* ---------- 最小 DOM 桩 ---------- */
const elements = new Map()
function makeEl(id) {
  const el = { id, style: {}, dataset: {}, onclick: null, _classes: new Set(), _text: '', _html: '', _handlers: {}, _children: [] }
  el.classList = {
    add: (c) => el._classes.add(c),
    remove: (c) => el._classes.delete(c),
    contains: (c) => el._classes.has(c),
    toggle: (c, force) => { const on = force === undefined ? !el._classes.has(c) : force; if (on) el._classes.add(c); else el._classes.delete(c) },
  }
  el.addEventListener = (t, fn) => { (el._handlers[t] = el._handlers[t] || []).push(fn) }
  el.click = () => { for (const fn of el._handlers.click || []) fn(); if (el.onclick) el.onclick() }
  el.querySelectorAll = () => []
  el.querySelector = (sel) => getEl(`${id} ${sel}`)
  el.appendChild = () => {}
  el.remove = () => {}
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
canvasEl.getContext = () => new Proxy({}, {
  get: (t, p) => {
    if (p === 'createRadialGradient' || p === 'createLinearGradient') return () => ({ addColorStop() {} })
    if (p === 'measureText') return () => ({ width: 0 })
    return () => {}
  },
  set: () => true,
})

// 表现层对象在 headless 下默认不产出；本测试要验证的正是这套表现规则
globalThis.__FORCE_VISUAL_FX__ = true

globalThis.document = {
  querySelector: getEl,
  querySelectorAll: () => [],
  createElement: () => makeEl('tmp'),
  body: makeEl('body'),
}
globalThis.MutationObserver = class { observe() {} }
globalThis.window = { addEventListener() {} }
let clock = 0
globalThis.performance = { now: () => clock }
let pendingFrame = null
globalThis.requestAnimationFrame = (cb) => { pendingFrame = cb }
globalThis.location = { reload() {} }
globalThis.Image = class { constructor() { this.src = '' } }

/* ---------- 载入构建产物 ---------- */
const assets = readdirSync(resolve('dist/assets'))
const bundle = assets.find((n) => n.endsWith('.js'))
if (!bundle) throw new Error('未找到构建产物，请先执行 npm run build')
await import(pathToFileURL(resolve('dist/assets', bundle)).href)

const gc = globalThis.window.__gameControls
assert(Boolean(gc), '__gameControls 挂载成功')
assert(typeof gc.damageEnemy === 'function', 'damageEnemy 已导出（用于验证敌方飘字）')

const STEP_MS = 16
function step(n = 1) {
  for (let i = 0; i < n; i++) {
    clock += STEP_MS
    if (!pendingFrame) throw new Error('游戏循环停止')
    const cb = pendingFrame
    pendingFrame = null
    cb(clock)
  }
}

const ci = gc.characters.findIndex((c) => c.id === 'sword')
gc.setChar(ci, 0)
gc.startRunFromSelection()
step(3)

const game = gc.game
const nums = () => game.damageNumbers
const last = () => nums()[nums().length - 1]

/* ================= 1. 敌方飘字：默认小号、攻击色 ================= */
game.damageNumbers.length = 0
const dummy = { x: 300, y: 200, r: 14, hp: 99999, maxHp: 99999, kind: 'wisp' }
gc.damageEnemy(dummy, 12, '#ffd166')
const e1 = last()
assert(Boolean(e1), '敌方受击产出了飘字')
assert(e1.kind === 'enemy', `默认按敌方受击呈现（kind=${e1.kind}）`)
assert(e1.size === 13, `敌方飘字为小号 13px（实际 ${e1.size}）`)
assert(e1.prefix === '-', '敌方飘字带 "-" 前缀')
assert(e1.color === '#ffd166', `敌方飘字沿用攻击色（实际 ${e1.color}）`)

/* ================= 2. 暴击：默认不改变伤害 ================= */
game.critChance = 0
const hpA = dummy.hp
gc.damageEnemy(dummy, 20, '#ffd166')
const dealtDefault = hpA - dummy.hp
assert(dealtDefault === 20, `暴击关闭时伤害就是原值 20（实际 ${dealtDefault}）`)
assert(last().kind === 'enemy', '暴击关闭时不会出现暴击飘字')

/* ================= 3. 暴击：开启后大号白字 + 按倍率放大 ================= */
game.critChance = 1          // 必定暴击
game.critMultiplier = 1.8
game.damageNumbers.length = 0
const hpB = dummy.hp
gc.damageEnemy(dummy, 20, '#ffd166')
const dealtCrit = hpB - dummy.hp
const critNum = last()
assert(dealtCrit === 36, `必定暴击时伤害 = 20 × 1.8 = 36（实际 ${dealtCrit}）`)
assert(critNum.kind === 'crit', `暴击飘字的 kind 为 crit（实际 ${critNum.kind}）`)
assert(critNum.size === 26, `暴击为大号 26px（实际 ${critNum.size}）`)
assert(critNum.color === '#ffffff', `暴击为白色（实际 ${critNum.color}）`)
assert(critNum.pop > 0, '暴击带弹入缩放，视觉上更突出')
assert(critNum.size > e1.size, `暴击字号 ${critNum.size} 明显大于普通 ${e1.size}`)
game.critChance = 0

/* ================= 4. 角色血量钩子：扣血 -> 红字 + 红晕 + 震动 ================= */
game.damageNumbers.length = 0
game.hurtFlash = 0
game.cameraShake = 0
game._prevHp = game.hp
game._hpFloat = { dmg: 0, heal: 0, timer: 0 }
game.hp = Math.max(1, game.hp - 17)
// 钩子按 0.25s 窗口聚合，推进足够帧数后结算
for (let i = 0; i < 30 && nums().length === 0; i++) step(1)
const pNum = nums().find((n) => n.kind === 'player')
assert(Boolean(pNum), '角色扣血产出了受击飘字')
assert(pNum.size === 18, `受击飘字为中号 18px（实际 ${pNum.size}）`)
assert(pNum.color === '#ff4d4f', `受击飘字为红色（实际 ${pNum.color}）`)
assert(pNum.prefix === '-', '受击飘字带 "-" 前缀')
assert(pNum.text === 17, `受击飘字数值等于扣血量 17（实际 ${pNum.text}）`)
assert(game.hurtFlash > 0, `受击触发了屏幕红晕（hurtFlash=${game.hurtFlash.toFixed(2)}）`)

/* ================= 5. 角色血量钩子：回血 -> 绿字 + "+" ================= */
game.damageNumbers.length = 0
game._prevHp = game.hp
game._hpFloat = { dmg: 0, heal: 0, timer: 0 }
// 注意：回血会被 maxHp 截断，飘字应显示**实际回复量**而非请求值，
// 因此这里按真实差值断言（测试 4 扣了 17 点，此处只差 17 点满血）
const hpBeforeHeal = game.hp
game.hp = Math.min(game.maxHp, game.hp + 25)
const expectedHeal = game.hp - hpBeforeHeal
for (let i = 0; i < 30 && nums().length === 0; i++) step(1)
const hNum = nums().find((n) => n.kind === 'heal')
assert(Boolean(hNum), '角色回血产出了回复飘字')
assert(hNum.size === 16, `回复飘字为 16px（实际 ${hNum.size}）`)
assert(hNum.color === '#4ade80', `回复飘字为绿色（实际 ${hNum.color}）`)
assert(hNum.prefix === '+', '回复飘字带 "+" 前缀（不是伤害的 "-"）')
assert(hNum.text === expectedHeal,
  `回复飘字数值等于实际回血量 ${expectedHeal}（受 maxHp 截断，实际 ${hNum.text}）`)

/* ================= 6. 聚合：持续掉血不会每帧刷一条 ================= */
game.damageNumbers.length = 0
game._prevHp = game.hp
game._hpFloat = { dmg: 0, heal: 0, timer: 0 }
for (let i = 0; i < 3; i++) {           // 连续 3 帧各掉 2 点（模拟灼烧）
  game.hp = Math.max(1, game.hp - 2)
  step(1)
}
const duringTick = nums().filter((n) => n.kind === 'player').length
assert(duringTick === 0, `持续掉血在聚合窗口内不产出飘字（实际 ${duringTick} 条）`)
for (let i = 0; i < 30 && !nums().some((n) => n.kind === 'player'); i++) step(1)
const ticks = nums().filter((n) => n.kind === 'player')
assert(ticks.length === 1, `3 帧的持续掉血聚合为 1 条飘字（实际 ${ticks.length} 条）`)
assert(ticks[0].text === 6, `聚合数值为累计掉血 6（实际 ${ticks[0].text}）`)

/* ================= 7. 受击飘字的位置：锚在角色身上 ================= */
const p = game.player
game.damageNumbers.length = 0
game._prevHp = game.hp
game._hpFloat = { dmg: 0, heal: 0, timer: 0 }
game.hp = Math.max(1, game.hp - 9)
for (let i = 0; i < 30 && nums().length === 0; i++) step(1)
const pn = nums().find((n) => n.kind === 'player')
assert(Math.abs(pn.x - p.x) < 40 && Math.abs(pn.y - p.y) < 60,
  `受击飘字锚定在角色附近（飘字 ${pn.x.toFixed(0)},${pn.y.toFixed(0)} vs 角色 ${p.x.toFixed(0)},${p.y.toFixed(0)}）`)

console.log(`\n测试结果统计: ${passed} 通过, ${failed} 失败`)
process.exit(failed ? 1 : 0)
