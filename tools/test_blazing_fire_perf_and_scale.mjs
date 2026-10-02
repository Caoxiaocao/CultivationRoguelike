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

// 模拟 DOM
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
    toggle: (c) => { if (el._classes.has(c)) el._classes.delete(c); else el._classes.add(c) }
  }
  el.addEventListener = (t, f) => { (el._handlers[t] = el._handlers[t] || []).push(f) }
  el.querySelector = (s) => (s.startsWith('#') ? getEl(s) : makeEl(s))
  el.querySelectorAll = () => []
  el.appendChild = (c) => { el._children.push(c); return c }
  el.remove = () => {}
  el.getAttribute = (a) => el[a] || null
  el.setAttribute = (a, v) => { el[a] = v }
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
  drawImage() {}, setLineDash() {}, translate() {}, rotate() {}, scale() {}
})

globalThis.__FORCE_BROWSER_MODE__ = true
globalThis.document = {
  querySelector: getEl,
  querySelectorAll: () => [],
  createElement: (t) => makeEl(t)
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

// 1. 验证火莲爆裂光图尺寸调小与适中收拢
gc.game.blazingFireLevel = 1
const p1 = gc.getBlazingFireParams()
const maxLvl1DrawSize = p1.burstRadius * (0.35 + 1.0 * 0.75) // b.scale 峰值为 1.0
assert(maxLvl1DrawSize <= 125, `1 级火莲爆裂光图最大尺寸为 ${maxLvl1DrawSize.toFixed(1)}px (≤ 125px，原为 462px，大幅收拢聚拢)`)

gc.game.blazingFireLevel = 3
const p3 = gc.getBlazingFireParams()
const maxLvl3DrawSize = p3.burstRadius * (0.35 + 1.0 * 0.75)
assert(maxLvl3DrawSize <= 165, `3 级火莲爆裂光图最大尺寸为 ${maxLvl3DrawSize.toFixed(1)}px (≤ 165px，原为 638px，告别全屏遮挡)`)

// 2. 验证多怪连锁反应微延迟分帧队列 (解耦递归，多米诺波浪引爆)
gc.game.blazingFireLevel = 1
gc.game._isDetonating = true // 模拟正处于当前引爆冲击波遍历中
const cascadeEnemy = { x: 350, y: 300, hp: 0, flameBrand: true, flameBrandDmg: 30 }
gc.defeat(cascadeEnemy)
assert(cascadeEnemy._blazingQueued === true, '连锁引爆中的次生阵亡敌怪被标记为 _blazingQueued')
assert(gc.game.pendingDetonations && gc.game.pendingDetonations.length === 1, '次生爆裂被推入 pendingDetonations 分帧微延迟队列，避免单帧递归卡死')
assert(gc.game.pendingDetonations[0].timer > 0, '次生爆裂包含波浪微延迟计时器')

// 推进时间让次生爆裂触发
gc.game._isDetonating = false
gc.game.enemies = [{ x: 360, y: 300, hp: 100, maxHp: 100, r: 14 }]
gc.updateBlazingFire(0.06) // 消耗微延迟
assert(gc.game.pendingDetonations.length === 0, '分帧微延迟队列中的爆裂在随后的帧中平滑平摊执行完毕')

// 3. 验证飞火流星与火星粒子总数封顶 (防超高怪量时的几何级膨胀)
gc.game.blazingMotes = new Array(24).fill(0).map(() => ({ x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1 }))
const testEnemy = { x: 200, y: 200, hp: 0, flameBrand: true, flameBrandDmg: 30 }
gc.game.enemies = [testEnemy]
gc.triggerBlazingDetonation(testEnemy, 30)
assert(gc.game.blazingMotes.length <= 24, `飞火流星总数封顶生效 (当前数量: ${gc.game.blazingMotes.length} ≤ 24)`)

gc.game.blazingEmberParticles = new Array(36).fill(0).map(() => ({ x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1 }))
const testEnemy2 = { x: 220, y: 200, hp: 0, flameBrand: true, flameBrandDmg: 30 }
gc.triggerBlazingDetonation(testEnemy2, 30)
assert(gc.game.blazingEmberParticles.length <= 36, `火星环境粒子总数封顶生效 (当前数量: ${gc.game.blazingEmberParticles.length} ≤ 36)`)

console.log(`\n性能优化与尺寸调优专项测试汇总: ${passed} 项通过, ${failed} 项失败\n`)
if (failed > 0) process.exit(1)
