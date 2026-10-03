/**
 * 九疑重鼎 · 镇压攻击动画 回归测试
 *
 * 验证动画叙事：上抛旋转放大 -> 滞空蓄势 -> 加速下压 -> 落地范围冲击波
 *
 * 做法：用最小 DOM 桩加载构建产物，用可推进的 rAF/performance 真跑游戏帧循环，
 * 然后触发一次重鼎攻击，逐帧采样 specialAttacks 中的 ding_crush 状态。
 * 即验证的是**真实更新逻辑**，不是复刻一份数学公式。
 *
 * 运行： npm run build && node tools/test_ding_crush.mjs
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

// 关键：main.js 的 executeWeaponAttack 在 isHeadless 下会短路成通用弹道
// （源码注释："Headless mode: keep classic projectile behavior to pass smoke-test.mjs"），
// 所有法宝的特殊攻击动画在 headless 下都不会执行。本测试要验证的正是这套动画，
// 因此打开这个测试开关，让 headless 也走真实法宝分支。
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

/* ---------- 驱动帧循环 ---------- */
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

/* ---------- 以体修 + 九疑重鼎开局 ---------- */
const ci = gc.characters.findIndex((c) => c.id === 'body')
assert(ci >= 0, '找到体修角色「铁狂徒」')
const list = gc.characters[ci].weapons || []
const wi = list.findIndex((w) => w.id === 'body_ding')
assert(wi >= 0, '体修起手法宝含「九疑重鼎」')

gc.setChar(ci, wi)
gc.startRunFromSelection()
step(3)

const game = gc.game
const p = game.player
assert(p.weaponType === 'ding', `玩家法宝类型为 ding（实际 ${p.weaponType}）`)

/* ---------- 触发一次重鼎镇压 ---------- */
gc.executeWeaponAttack({ x: p.x + 120, y: p.y }, 0)
const atk = game.specialAttacks.find((a) => a.type === 'ding_crush')
assert(Boolean(atk), '生成了 ding_crush 攻击对象')
assert(atk.phase === 'rise', `初始阶段为 rise（实际 ${atk.phase}）`)
assert(atk.spin === 0, '初始自转角为 0')
assert(Math.abs(atk.scale - 0.95) < 1e-6, `初始缩放 0.95（实际 ${atk.scale}）`)

/* ---------- 逐帧采样 ---------- */
const phases = []
const trace = []
let prevArcY = atk.arcY
const maxDrop = { rise: 0, hang: 0, slam: 0 }   // 各阶段单帧最大下落量
const maxRise = { rise: 0, hang: 0, slam: 0 }   // 各阶段单帧最大上升量
let shakeAtCrash = 0
let sawCrash = false

for (let f = 0; f < 150 && !atk.finished; f++) {
  step(1)
  const ph = atk.phase
  if (phases[phases.length - 1] !== ph) phases.push(ph)
  const d = atk.arcY - prevArcY
  const bucket = maxDrop[ph] !== undefined ? ph : null
  if (bucket) {
    if (d > 0) maxDrop[bucket] = Math.max(maxDrop[bucket], d)   // arcY 增大 = 下坠
    if (d < 0) maxRise[bucket] = Math.max(maxRise[bucket], -d)  // arcY 减小 = 上升
  }
  if (ph === 'crash') { sawCrash = true; shakeAtCrash = Math.max(shakeAtCrash, game.cameraShake) }
  trace.push({ ph, arcY: atk.arcY, spin: atk.spin, scale: atk.scale, r: atk.crashRadius || 0 })
  prevArcY = atk.arcY
}

const seen = (name) => phases.includes(name)
assert(seen('rise') && seen('hang') && seen('slam') && seen('crash'),
  `阶段齐备 rise/hang/slam/crash（实际 ${phases.join(' → ')}）`)
assert(phases.indexOf('rise') < phases.indexOf('hang') &&
       phases.indexOf('hang') < phases.indexOf('slam') &&
       phases.indexOf('slam') < phases.indexOf('crash'),
  '阶段顺序为 rise → hang → slam → crash')

/* 1. 上抛：确实升空，并达到设计滞空高度 */
const apex = Math.min(...trace.map((t) => t.arcY))
assert(apex < -100, `上抛确实升空，最高点 arcY = ${apex.toFixed(0)}（设计 -130）`)

/* 2. 逐渐变大：飞行三阶段缩放单调不减，落地时最大 */
const fly = trace.filter((t) => t.ph === 'rise' || t.ph === 'hang' || t.ph === 'slam')
let mono = true
for (let i = 1; i < fly.length; i++) if (fly[i].scale < fly[i - 1].scale - 1e-9) mono = false
const maxScale = Math.max(...trace.map((t) => t.scale))
assert(mono, '飞行途中体积单调增大（逐渐变大，无回缩）')
assert(maxScale > 1.7, `落地时体积达到峰值 ${maxScale.toFixed(2)}（初始 0.95，放大约 ${(maxScale / 0.95).toFixed(1)}x）`)

/* 3. 持续旋转：飞行三阶段自转角持续增长 */
const maxSpin = Math.max(...fly.map((t) => t.spin))
assert(maxSpin > Math.PI * 2, `飞行途中持续旋转，累计 ${(maxSpin / Math.PI).toFixed(1)}π（> 1 整圈）`)

/* 4. 重重下压：下压峰值速度显著快于上抛 */
const riseSpeed = Math.max(maxRise.rise, maxRise.hang)
assert(maxDrop.slam > riseSpeed * 2,
  `下压峰值速度为上抛的 ${(maxDrop.slam / Math.max(1e-6, riseSpeed)).toFixed(1)} 倍（> 2 倍才算"重重下压"）`)

/* 5. 落地摆正 */
const crashSpin = trace.find((t) => t.ph === 'crash').spin
assert(Math.abs(crashSpin / (Math.PI * 2) - Math.round(crashSpin / (Math.PI * 2))) < 1e-6,
  '落地瞬间自转角归到整圈（鼎镇地时是正的，不会歪着）')

/* 6. 范围冲击波：半径由 18 扩张到接近 maxRadius */
const rStart = trace.find((t) => t.ph === 'crash').r
const rMax = Math.max(...trace.map((t) => t.r))
assert(Math.abs(rStart - 18) < 1e-6, `冲击波起始半径 18（实际 ${rStart}）`)
assert(rMax > atk.maxRadius * 0.95,
  `冲击波扩张到 ${rMax.toFixed(0)}，接近 maxRadius ${atk.maxRadius}（范围冲击波）`)

/* 7. 落地表现：镜头震动增强
   注意 cameraShake 每帧都会衰减，因此这里采到的是衰减后的值：
   落地瞬间设为 0.34，采样时约 0.26；旧实现是 0.20，采样约 0.15。用 0.24 作阈值可区分。 */
assert(shakeAtCrash > 0.24, `落地镜头震动峰值 ${shakeAtCrash.toFixed(2)}（落地设定 0.34，旧实现 0.20）`)

/* 8. 总时长仍能容纳在攻击间隔内 */
const totalFrames = trace.length
const totalSec = totalFrames * STEP_MS / 1000
assert(totalSec < 1.05, `整段动画约 ${totalSec.toFixed(2)}s，短于 0.8 次/秒 的攻击间隔 1.25s`)

console.log(`\n测试结果统计: ${passed} 通过, ${failed} 失败`)
process.exit(failed ? 1 : 0)
