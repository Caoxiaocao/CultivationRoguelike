/**
 * 无头冒烟测试：用最小 DOM 桩加载构建产物，驱动游戏循环，
 * 验证「关卡倒计时 → 结算 → 择卡 → 清点物品 → 下一关」整条链路。
 *
 * 运行： npm run build && node tools/smoke-test.mjs
 */
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

/* ---------- 可复现随机 ---------- */
let seed = 20240917
Math.random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

/* ---------- DOM 桩 ---------- */
const elements = new Map()

function makeButton(attrs) {
  const el = makeEl('button')
  Object.assign(el.dataset, attrs)
  return el
}

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
  el._buildChildren = () => {
    const kids = []
    const cardRe = /data-card="(\d+)"/g
    let m
    while ((m = cardRe.exec(el._html))) kids.push(makeButton({ card: m[1] }))
    const lootRe = /data-loot="(\d+)" data-keep="([01])"/g
    while ((m = lootRe.exec(el._html))) kids.push(makeButton({ loot: m[1], keep: m[2] }))
    el._children = kids
  }
  Object.defineProperty(el, 'textContent', { get: () => el._text, set: (v) => { el._text = String(v) } })
  Object.defineProperty(el, 'innerHTML', { get: () => el._html, set: (v) => { el._html = String(v); el._buildChildren() } })
  return el
}

function getEl(selector) {
  if (!elements.has(selector)) elements.set(selector, makeEl(selector))
  return elements.get(selector)
}

const ctxStub = new Proxy({}, {
  get(target, prop) {
    if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => ({ addColorStop() {} })
    if (prop in target) return target[prop]
    return () => {}
  },
  set(target, prop, value) { target[prop] = value; return true },
})

const canvasEl = getEl('#game')
canvasEl.width = 960
canvasEl.height = 540
canvasEl.getContext = () => ctxStub

globalThis.document = {
  querySelector: getEl,
  querySelectorAll: () => [],
  createElement: () => ({ relList: { supports: () => true } }),
}
globalThis.MutationObserver = class { observe() {} }
globalThis.window = { addEventListener: (type, fn) => { (windowHandlers[type] = windowHandlers[type] || []).push(fn) } }
const windowHandlers = {}
let clock = 0
globalThis.performance = { now: () => clock }
let pendingFrame = null
globalThis.requestAnimationFrame = (cb) => { pendingFrame = cb }
globalThis.location = { reload() {} }

/* ---------- 载入构建产物 ---------- */
const assets = readdirSync(resolve('dist/assets'))
const bundle = assets.find(name => name.endsWith('.js'))
if (!bundle) throw new Error('未找到构建产物，请先执行 npm run build')
await import(pathToFileURL(resolve('dist/assets', bundle)).href)

const ui = {
  timer: getEl('#timer'), arena: getEl('#arena-realm'), overlay: getEl('#stage-overlay'),
  title: getEl('#stage-title'), desc: getEl('#stage-desc'), choices: getEl('#stage-choices'),
  loot: getEl('#stage-loot'), lootSummary: getEl('#stage-loot-summary'),
  lootAll: getEl('#stage-loot-all'), cont: getEl('#stage-continue'),
  realm: getEl('#realm-name'), realmLevel: getEl('#realm-level'), realmBaseHp: getEl('#realm-base-hp'),
  xp: getEl('#xp-value'), hp: getEl('#hp-value'), build: getEl('#build-list'),
}

/* ---------- 驱动 ---------- */
const key = (k) => { for (const fn of windowHandlers.keydown || []) fn({ key: k, preventDefault() {} }) }
let held = null
function setKey(k) {
  if (held) for (const fn of windowHandlers.keyup || []) fn({ key: held })
  held = k
  if (k) key(k)
}

/**
 * 势场风筝 AI：对每个威胁施加距离平方反比的斥力（不再只看最近一只，
 * 否则同时靠近的敌人会把它夹死），再叠加边界斥力与中心弱吸引，逼近真人绕场跑法。
 */
const pressed = new Set()
function steer() {
  const g = G()
  if (!g) return
  let dx = 0, dy = 0
  for (const e of g.enemies) {
    const ox = g.player.x - e.x
    const oy = g.player.y - e.y
    const d = Math.hypot(ox, oy)
    if (d < 1 || d > 260) continue
    const w = 1 - d / 260
    dx += (ox / d) * w * w * 4
    dy += (oy / d) * w * w * 4
  }
  const margin = 120
  if (g.player.x < margin) dx += (margin - g.player.x) / margin * 1.6
  if (g.player.x > 960 - margin) dx -= (g.player.x - (960 - margin)) / margin * 1.6
  if (g.player.y < margin) dy += (margin - g.player.y) / margin * 1.6
  if (g.player.y > 540 - margin) dy -= (g.player.y - (540 - margin)) / margin * 1.6
  dx -= (g.player.x - 480) / 480 * .35
  dy -= (g.player.y - 270) / 270 * .35

  const len = Math.hypot(dx, dy)
  const next = new Set()
  if (len > .08) {
    const ux = dx / len, uy = dy / len
    if (uy < -.38) next.add('w')
    if (uy > .38) next.add('s')
    if (ux < -.38) next.add('a')
    if (ux > .38) next.add('d')
  }
  for (const k of pressed) if (!next.has(k)) for (const fn of windowHandlers.keyup || []) fn({ key: k })
  for (const k of next) if (!pressed.has(k)) key(k)
  pressed.clear()
  for (const k of next) pressed.add(k)
}

const results = []
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  → ' + extra : ''}`)
}

function releaseAll() {
  for (const k of pressed) for (const fn of windowHandlers.keyup || []) fn({ key: k })
  pressed.clear()
  held = null
}

function advance(seconds, onFrame, still = false) {
  if (still) releaseAll()
  const step = 33
  const frames = Math.round(seconds * 1000 / step)
  for (let i = 0; i < frames; i++) {
    clock += step
    if (!still) steer()
    if (!pendingFrame) throw new Error('游戏循环停止：requestAnimationFrame 未被再次调用')
    const cb = pendingFrame
    pendingFrame = null
    cb(clock)
    if (onFrame) onFrame()
  }
}

const G = () => globalThis.window.__game

/** 每件物品会渲染「保留 / 放弃」两个按钮，必须按索引去重后才是个数 */
const lootCount = () => new Set(
  ui.loot._children.filter(c => 'loot' in c.dataset).map(c => c.dataset.loot)
).size

/** 像真人一样优先拿输出牌，否则清怪速度会被小怪血量成长甩开 */
function pickBestCard() {
  const buttons = ui.choices._children.filter(x => 'card' in x.dataset)
  const parsed = [...ui.choices._html.matchAll(/data-card="(\d+)"[\s\S]*?class="choice-name">([^<]+)</g)]
    .map(m => ({ index: Number(m[1]), name: m[2] }))
  for (const want of ['流云飞剑', '回风阵', '赤炎葫芦', '青羽灵狐', '御风行', '玄木灵体']) {
    const hit = parsed.find(p => p.name === want)
    if (hit) return buttons.find(b => Number(b.dataset.card) === hit.index)
  }
  return buttons[0]
}

console.log('--- 第 1 关 ---')
check('初始关卡标题', ui.arena._text.includes('第 1 关'), ui.arena._text)
check('倒计时从 01:00 开始', ui.timer._text === '01:00', ui.timer._text)
check('炼气初期需求 100 灵气', ui.xp._text === '0 / 100', ui.xp._text)
check('初始基础生命 100', ui.realmBaseHp._text === '100', ui.realmBaseHp._text)

/* ---- 敌人生成方式与境界成长的逐帧采样 ---- */
const seenEnemies = new WeakSet()
const spawnSamples = []
let markerPeak = 0
let enemyPeak = 0
let capViolations = 0
const realmTrace = []
const sample = () => {
  const g = G()
  if (!g) return
  markerPeak = Math.max(markerPeak, g.markers.length)
  enemyPeak = Math.max(enemyPeak, g.enemies.length)
  if (g.enemies.length + g.markers.length > 1000) capViolations++
  for (const e of g.enemies) {
    if (seenEnemies.has(e)) continue
    seenEnemies.add(e)
    spawnSamples.push({ x: e.x, y: e.y, d: Math.hypot(e.x - g.player.x, e.y - g.player.y) })
  }
  const last = realmTrace[realmTrace.length - 1]
  if (!last || last.realm !== g.realm || last.sub !== g.subStage || last.need !== g.xpNeed || last.base !== g.baseHp) {
    realmTrace.push({ realm: g.realm, sub: g.subStage, need: g.xpNeed, base: g.baseHp, hp: g.maxHp })
  }
}

advance(21, sample)
check('存在现身预兆特效', markerPeak > 0, `同时在场预兆峰值 ${markerPeak}`)

const sampleCount = spawnSamples.length
const inBounds = spawnSamples.filter(s => s.x >= 0 && s.x <= 960 && s.y >= 0 && s.y <= 540).length
check('敌人出现在地图内部而非边缘', sampleCount > 5 && inBounds === sampleCount,
  `${inBounds}/${sampleCount} 个落在画面内`)

const dists = spawnSamples.map(s => s.d)
const spread = Math.max(...dists) - Math.min(...dists)
check('预兆落在随机方位与随机距离', dists.every(d => d >= 140 && d <= 480) && spread > 100,
  `距玩家 ${Math.min(...dists).toFixed(0)} ~ ${Math.max(...dists).toFixed(0)} px（配置 170~440），跨度 ${spread.toFixed(0)}px`)

const illegal = spawnSamples.filter(s => s.d < 100).length
check('现身瞬间保留安全距离', illegal === 0,
  `低于 100px 的有 ${illegal} 个，最近 ${Math.min(...spawnSamples.map(s => s.d)).toFixed(0)}px`)

check('30 秒内倒计时递减', ui.timer._text !== '01:00', ui.timer._text)

advance(40, sample)
check('60 秒后进入结算', !ui.overlay._classes.has('hidden'), ui.title._text)
check('结算固定三张卡片', ui.choices._children.filter(c => 'card' in c.dataset).length === 3,
  String(ui.choices._children.length))
check('未选卡时无法继续', ui.cont.disabled === true, ui.cont._text)

const lootRows = lootCount()
console.log(`      本关拾得物品 ${lootRows} 件：${ui.lootSummary._text}`)
check('结算面板物品数与列表一致', ui.lootSummary._text === `${lootRows} 件`, `${lootRows} vs ${ui.lootSummary._text}`)

const cards = ui.choices._children.filter(c => 'card' in c.dataset)
cards[0].click()
check('选择卡片后可继续', ui.cont.disabled === false, ui.cont._text)

// 先全部放弃验证灵气合计，再把前两件改回保留验证保留分支
const buildBefore = (ui.build._html.match(/build-item/g) || []).length
const sumAll = ui.lootAll._text
ui.lootAll.click()
check('全部放弃显示灵气合计', /全部放弃（\+\d+ 灵气）/.test(ui.lootAll._text), ui.lootAll._text)

const keepButtons = ui.loot._children.filter(b => 'loot' in b.dataset && b.dataset.keep === '1')
const toKeep = Math.min(2, keepButtons.length)
keepButtons.slice(0, toKeep).forEach(b => b.click())
check('可逐件改回保留', toKeep > 0, `保留 ${toKeep} 件 · 放弃前合计 ${sumAll}`)

ui.cont.click()
const buildAfter = (ui.build._html.match(/build-item/g) || []).length
check('保留的物品进入构筑面板', buildAfter >= buildBefore + toKeep, `${buildBefore} → ${buildAfter} 条`)
check('结算后进入第 2 关', ui.arena._text.includes('第 2 关'), ui.arena._text)
check('第 2 关角色居中出生', G().player.x === 480 && G().player.y === 270, `坐标 (${G().player.x}, ${G().player.y})`)
check('倒计时重置', ui.timer._text === '01:00', ui.timer._text)
check('结算面板关闭', ui.overlay._classes.has('hidden'), '')

console.log('--- 连续推进多关 ---')
let cleared = 1
let totalLoot = lootRows
const stageWindows = []
let mark = { stage: G().stage, t: clock, spawns: spawnSamples.length }

for (let i = 0; i < 8; i++) {
  advance(61, sample)
  const cardButtons = ui.choices._children.filter(x => 'card' in x.dataset)
  if (cardButtons.length === 0) {
    console.log(`      玩家于第 ${cleared + 1} 关阵亡（死亡结算路径）：${ui.title._text}`)
    check('死亡结算提供重开入口', ui.cont._text === '重新入世', ui.cont._text)
    break
  }
  stageWindows.push({ stage: mark.stage, seconds: (clock - mark.t) / 1000, spawns: spawnSamples.length - mark.spawns })
  pickBestCard().click()
  totalLoot += lootCount()
  if (ui.loot._children.length) ui.lootAll.click()
  ui.cont.click()
  cleared++
  mark = { stage: G().stage, t: clock, spawns: spawnSamples.length }

  if (cleared === 4) {
    console.log('--- 站桩压力测试（第 5 关，静止 25 秒） ---')
    const hpBefore = G().hp
    const fieldBefore = G().enemies.length
    let fieldPeak = fieldBefore
    advance(25, () => { fieldPeak = Math.max(fieldPeak, G().enemies.length) }, true)
    const lost = hpBefore - G().hp
    check('站桩时敌人会堆积并形成压制',
      G().gameOver || lost > 20 || fieldPeak - fieldBefore >= 12,
      G().gameOver
        ? '站桩 25 秒内阵亡'
        : `损失 ${lost.toFixed(0)} 点生命（${hpBefore.toFixed(0)} → ${G().hp.toFixed(0)}），场面敌人 ${fieldBefore} → 峰值 ${fieldPeak}`)
    mark = { stage: G().stage, t: clock, spawns: spawnSamples.length }
  }
}
check('多次结算与开新关无异常', cleared >= 3, `通过 ${cleared} 关（难度已上调，仅供参考）`)
check('关卡掉落物品生效', totalLoot > 0, `累计清点 ${totalLoot} 件`)

/* ---- 压力与掉落率 ---- */
console.log(`      同屏敌人峰值 ${enemyPeak} 只（清怪越快场面越空，仅供参考）`)

// 与调整前的刷新公式对比同一关卡的实际刷新速率
const oldRateAt = (stage) => 1 / Math.max(.45, 1.05 - (stage - 1) * .045 - 30 * .004)
const measured = stageWindows.filter(w => w.seconds > 50).map(w => ({
  stage: w.stage, rate: w.spawns / w.seconds, old: oldRateAt(w.stage),
}))
const gain = measured.length ? measured.reduce((s, m) => s + m.rate / m.old, 0) / measured.length : 0
check('小怪刷新频率高于调整前', gain > 1.08,
  measured.map(m => `第${m.stage}关 ${m.rate.toFixed(2)}/s vs 原 ${m.old.toFixed(2)}/s`).join(' · ') || '样本不足')

const totalKills = G().kills
const dropRatio = totalLoot / totalKills
check('物品掉落率已下调', totalKills >= 150 ? dropRatio < .06 : true,
  `${totalLoot}/${totalKills} = ${(dropRatio * 100).toFixed(1)}%（原 9%，样本${totalKills >= 150 ? '充足' : '偏小仅供参考'}）`)

if (!G().gameOver) {
  console.log('--- 站桩压力测试（后续关卡） ---')
  const hpBefore = G().hp
  advance(15, null, true)
  const dead = G().gameOver
  const lost = hpBefore - G().hp
  check('站桩会被持续压制', dead || lost > 20,
    dead ? '站桩 15 秒内阵亡' : `站桩 15 秒损失 ${lost.toFixed(0)} 点生命（${hpBefore.toFixed(0)} → ${G().hp.toFixed(0)}）`)
}

/* ---- 境界小阶段与基础生命规则 ---- */
const needs = realmTrace.map(t => t.need)
const pow2 = needs.every(n => Number.isInteger(Math.log2(n / 100)))
check('灵气需求按 2 倍逐段递增', pow2, needs.slice(0, 9).join(' → '))

const labels = realmTrace.map(t => `${['炼气','筑基','结丹','元婴','化神'][t.realm] ?? t.realm}${['初期','中期','后期'][t.sub]} 血${t.base}`)
console.log(`      境界轨迹：${labels.join('  →  ')}`)

let subRuleOk = true
let majorRuleOk = true
let majorSteps = 0
for (let i = 1; i < realmTrace.length; i++) {
  const a = realmTrace[i - 1], b = realmTrace[i]
  if (b.realm === a.realm && b.sub > a.sub && b.base !== a.base) subRuleOk = false
  if (b.realm === a.realm + 1) { majorSteps++; if (b.base !== a.base * 2) majorRuleOk = false }
}
check('小阶段晋升不提升基础生命', subRuleOk, `采样 ${realmTrace.length} 个境界节点`)
check('大境界进阶基础生命翻倍', majorRuleOk && majorSteps > 0,
  `发生 ${majorSteps} 次大境界进阶，基础生命 ${realmTrace[0].base} → ${realmTrace[realmTrace.length - 1].base}`)
check('生命上限始终不低于基础生命', realmTrace.every(t => t.hp >= t.base),
  `当前 ${ui.hp._text} · 基础 ${ui.realmBaseHp._text}`)
check('境界与灵气仍在推进', ui.xp._text.length > 0 && ui.realm._text.length > 0,
  `${ui.realm._text}${ui.realmLevel._text} · 灵气 ${ui.xp._text} · 生命 ${ui.hp._text}`)

/* ---- 角色武器数值平衡验证 ---- */
const controls = globalThis.window.__gameControls
if (controls && controls.characters) {
  const cList = controls.characters
  check('八位可选角色配置完整', cList.length === 8, cList.map(c => c.name).join(' / '))
  const swordDef = controls.getWeaponDef('sword')
  const hammerDef = controls.getWeaponDef('hammer')
  const dingDef = controls.getWeaponDef('ding')
  const dragonDef = controls.getWeaponDef('dragon_armor')
  const baguaDef = controls.getWeaponDef('bagua')
  const fuchenDef = controls.getWeaponDef('fuchen')
  const baozhuDef = controls.getWeaponDef('baozhu')

  const swordDmg = swordDef.stats.dmg
  const hammerDmg = hammerDef.stats.dmg
  const dingDmg = dingDef.stats.dmg
  const dragonDmg = dragonDef.stats.dmg
  const baguaDmg = baguaDef.stats.dmg
  const fuchenDmg = fuchenDef.stats.dmg
  const baozhuDmg = baozhuDef.stats.dmg

  const aoeLowerThanSingle = (
    hammerDmg < swordDmg &&
    dingDmg < swordDmg &&
    dragonDmg < swordDmg &&
    baguaDmg < swordDmg &&
    fuchenDmg < swordDmg &&
    baozhuDmg < swordDmg
  )
  check('范围武器基础数值均低于单点武器', aoeLowerThanSingle,
    `飞剑(单点) ${swordDmg} vs 锤 ${hammerDmg}, 鼎 ${dingDmg}, 拳 ${dragonDmg}, 卦 ${baguaDmg}, 拂尘 ${fuchenDmg}, 珠 ${baozhuDmg}`)
}

const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} 项通过`)
process.exit(failed.length ? 1 : 0)
