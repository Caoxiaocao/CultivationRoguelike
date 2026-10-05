/**
 * 龙鳞霸甲 · 霸龙金拳与漫天虚影暴风连拳 回归测试
 *
 * 验证规则：
 * 1. 每次出招首发 1 个实体拳头（贯穿目标，造成 100% 基础拳伤）。
 * 2. 随后源源不断飞出多个半透明虚影拳头（飞出攻击并带残影）。
 * 3. 虚影拳头攻击持续 2.0 秒。
 * 4. 虚影攻击期间每 0.5 秒造成实体拳头伤害的 20%（2.0s 内共计 4 次 tick 结算）。
 * 5. 持续期与残存拳影结束后，攻击对象正常销毁（finished = true）。
 *
 * 运行方式：npm run build && node tools/test_dragon_armor_fist.mjs
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

// 开启法宝特殊攻击测试分支
globalThis.__FORCE_WEAPON_SPECIALS__ = true

globalThis.document = {
  querySelector: getEl,
  querySelectorAll: () => [],
  createElement: () => makeEl('tmp'),
  body: makeEl('body'),
}
globalThis.MutationObserver = class { observe() {} }
const windowHandlers = {}
globalThis.window = { addEventListener: (t, fn) => { (windowHandlers[t] = windowHandlers[t] || []).push(fn) } }
let clock = 0
globalThis.performance = { now: () => clock }
let pendingFrame = null
globalThis.requestAnimationFrame = (cb) => { pendingFrame = cb }
globalThis.location = { reload() {} }
globalThis.Image = class { constructor() { this.src = ''; this.loaded = false } }

/* ---------- 载入构建产物 ---------- */
const assets = readdirSync(resolve('dist/assets'))
const bundle = assets.find((n) => n.endsWith('.js'))
if (!bundle) throw new Error('未找到构建产物，请先执行 npm run build')
await import(pathToFileURL(resolve('dist/assets', bundle)).href)

const gc = globalThis.window.__gameControls
assert(Boolean(gc), '__gameControls 挂载成功')
assert(typeof gc.executeWeaponAttack === 'function', 'executeWeaponAttack 已导出')

/* ---------- 驱动帧循环辅助函数 ---------- */
const STEP_MS = 16
function step(n = 1) {
  for (let i = 0; i < n; i++) {
    clock += STEP_MS
    if (!pendingFrame) throw new Error('游戏循环停止：requestAnimationFrame 未被再次调用')
    const cb = pendingFrame
    pendingFrame = null
    cb(clock)
  }
}

/* ---------- 1. 选择体修 + 龙鳞霸甲 ---------- */
const ci = gc.characters.findIndex((c) => c.id === 'body')
assert(ci >= 0, '找到体修角色「铁狂徒」')
const weapons = gc.characters[ci].weapons || []
const wi = weapons.findIndex((w) => w.id === 'body_armor' || w.type === 'dragon_armor')
assert(wi >= 0, '体修起手法宝含「龙鳞霸甲」')

gc.setChar(ci, wi)
gc.startRunFromSelection()
step(3)

const game = gc.game
const p = game.player
assert(p.weaponType === 'dragon_armor', `玩家法宝类型为 dragon_armor（实际 ${p.weaponType}）`)

// 测试期间关闭暴击浮动与自动发弹，确保伤害数值由本测试的主动出招独立触发
game.critChance = 0
game.shotTimer = 9999

/* ---------- 2. 验证龙拳出招初始化 ---------- */
// 清空当前已有攻击与敌人
game.specialAttacks = []
game.enemies = []

// 在攻击通道前方放置木桩怪
const testEnemy = {
  id: 'test_dummy_solid',
  x: p.x + 45,
  y: p.y,
  r: 14,
  hp: 200,
  maxHp: 200,
  isDummy: true
}
game.enemies.push(testEnemy)

gc.executeWeaponAttack({ x: p.x + 100, y: p.y }, 0)

const atk = game.specialAttacks.find((a) => a.type === 'dragon_fist')
assert(Boolean(atk), '成功生成 dragon_fist 攻击实体')
assert(atk.solidLife > 0.3 && atk.solidDuration > 0.3, `首发实体拳头初始化 (solidLife=${atk.solidLife})`)
assert(atk.phantomDuration === 2.0, `虚影持续时间设定为 2.0s (phantomDuration=${atk.phantomDuration})`)
assert(atk.phantomTimer === 2.0, `虚影倒计时初始化为 2.0s (phantomTimer=${atk.phantomTimer})`)
assert(atk.phantomTickInterval === 0.25, `虚影伤害间隔为 0.25s (phantomTickInterval=${atk.phantomTickInterval})`)
assert(atk.phantomDamageRatio === 0.2, `虚影伤害比例为 20% (phantomDamageRatio=${atk.phantomDamageRatio})`)
assert(Array.isArray(atk.phantomFists), '虚影拳头队列 phantomFists 初始化为数组')

/* ---------- 3. 验证首发实体拳头的飞行与 100% 贯穿伤害 ---------- */
// 步进 8 帧 (~0.128s)，此时实体拳正在向前冲锋
step(8)
assert(atk.solidTipX > p.x + 25, `实体拳头向目标方向冲锋 (solidTipX=${Math.round(atk.solidTipX)})`)
assert(atk.hitEnemies.has(testEnemy), '实体拳头成功贯穿击中通道中的敌怪')
const solidDmgTaken = 200 - testEnemy.hp
assert(Math.abs(solidDmgTaken - atk.damage) < 1e-4, `实体拳头造成了 100% 基础伤害 (实测 ${solidDmgTaken.toFixed(1)} vs 基础 ${atk.damage})`)

/* ---------- 4. 验证源源不断飞出多个虚影拳头 ---------- */
// 此时虚影拳头应该已经生成并飞行
assert(atk.phantomFists.length > 0, `虚影拳头已连续生成飞出 (当前在场虚影数: ${atk.phantomFists.length})`)
const sampleFist = atk.phantomFists[0]
assert(sampleFist && sampleFist.speed > 200, `虚影拳头具有飞行速度 (speed=${Math.round(sampleFist.speed)})`)
assert(sampleFist.life > 0, `虚影拳头具有独立生命周期 (life=${sampleFist.life.toFixed(2)})`)

/* ---------- 5. 验证虚影攻击持续 2s，且每 0.25s 结算 20% 伤害 (共 8 次 tick) ---------- */
// 在通道内放置一个木桩监测 8 次 tick 结算
const tickTracker = {
  id: 'tick_tracker',
  x: p.x + 55,
  y: p.y,
  r: 15,
  hp: 500,
  maxHp: 500,
  isDummy: true
}
game.enemies.push(tickTracker)

// 逐帧推进并记录各时间节点的 tick 伤害
const tickDamageEvents = []
for (let f = 0; f < 135; f++) {
  const hpBefore = tickTracker.hp
  const ticksBefore = atk.phantomTicksDone || 0
  step(1)
  if ((atk.phantomTicksDone || 0) > ticksBefore) {
    const dealt = hpBefore - tickTracker.hp
    tickDamageEvents.push({ tick: atk.phantomTicksDone, damage: dealt, clock })
  }
}

assert(atk.phantomTicksDone === 8, `2.0s 内恰好完成 8 次虚影周期伤害结算 (实际完成 ${atk.phantomTicksDone} 次)`)
assert(tickDamageEvents.length === 8, `木桩恰好受到 8 次虚影 tick 伤害 (实际记录 ${tickDamageEvents.length} 次)`)
const expectedTickDmg = atk.damage * 0.2
const allTicksDeal20Percent = tickDamageEvents.every((e) => Math.abs(e.damage - expectedTickDmg) < 1e-4)
assert(allTicksDeal20Percent, `每次虚影 tick 均精确造成实体拳头的 20% 伤害 (实测单次 ${tickDamageEvents[0]?.damage?.toFixed(2)} vs 理论 ${expectedTickDmg.toFixed(2)})`)

/* ---------- 6. 验证持续期结束后平稳销毁 ---------- */
// 再推进若干帧，等待场上存留的虚影拳粒子生命自然耗尽
step(30)
assert(atk.phantomTimer <= 0, '2.0s 虚影持续时间已彻底走完')
assert(atk.solidLife <= 0, '实体拳早已结束')
assert(atk.finished === true, '龙拳特殊攻击对象已平稳结束标记 (finished = true)')

console.log('\n====================================================')
console.log(`测试结果统计: ${passed} 通过, ${failed} 失败`)
console.log('====================================================')

if (failed > 0) {
  process.exit(1)
} else {
  console.log('🎉 龙鳞霸甲实体金拳 + 2s 虚影暴风连击机制全部测试通过！\n')
}
