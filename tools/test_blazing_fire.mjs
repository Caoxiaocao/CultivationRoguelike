import { existsSync, statSync, readdirSync } from 'node:fs'
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

// 1. 验证美术资源
const iconPath = resolve('public/skill_blazing_fire.png')
const fxPath = resolve('public/effect_fire_burst.png')
assert(existsSync(iconPath) && statSync(iconPath).size > 10000, '离火焚原技能卡贴图 public/skill_blazing_fire.png 存在且有效')
assert(existsSync(fxPath) && statSync(fxPath).size > 10000, '离火焚原真火爆裂特效贴图 public/effect_fire_burst.png 存在且有效')

// 2. 模拟 DOM
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
assert(typeof gc.applyBlazingFireBrand === 'function', 'applyBlazingFireBrand 方法已导出')
assert(typeof gc.triggerBlazingDetonation === 'function', 'triggerBlazingDetonation 方法已导出')
assert(typeof gc.getBlazingFireParams === 'function', 'getBlazingFireParams 方法已导出')
assert(typeof gc.updateBlazingFire === 'function', 'updateBlazingFire 方法已导出')

// 3. 验证图鉴注册
const codexCards = gc.CODEX_DATA && gc.CODEX_DATA.cards
const blazingCardCodex = codexCards && codexCards.find(c => c.id === 'blazing_fire')
assert(!!blazingCardCodex, '图鉴 CODEX_DATA.cards 中已注册 blazing_fire')
assert(blazingCardCodex && blazingCardCodex.image === './skill_blazing_fire.png', '图鉴中离火焚原贴图引用正确')
assert(blazingCardCodex && blazingCardCodex.name === '离火焚原', '图鉴中名称为离火焚原')

// 4. 验证不占用进攻槽位
assert(gc.isOffensiveItem('blazing_fire') === false, '离火焚原属于神通绝技，不占用武器槽位')

// 5. 验证数值与进阶阶梯
gc.game.blazingFireLevel = 1
const p1 = gc.getBlazingFireParams()
assert(p1.burnDmgPct === 10, '1 级每秒持续灼烧 10%')
assert(p1.burstDamagePct === 20, '1 级引爆范围伤害 20%')
assert(p1.burstRadius === 105, '1 级引爆范围 105px')
assert(p1.motesCount === 3, '1 级溅射 3 颗飞火流星')

gc.game.blazingFireLevel = 2
const p2 = gc.getBlazingFireParams()
assert(p2.burnDmgPct === 15, '2 级每秒持续灼烧 15%')
assert(p2.burstDamagePct === 25, '2 级引爆范围伤害 25%')
assert(p2.burstRadius === 125, '2 级引爆范围 125px')
assert(p2.motesCount === 5, '2 级溅射 5 颗飞火流星')

gc.game.blazingFireLevel = 3
const p3 = gc.getBlazingFireParams()
assert(p3.burnDmgPct === 20, '3 级每秒持续灼烧 20%')
assert(p3.burstDamagePct === 30, '3 级引爆范围伤害 30%')
assert(p3.burstRadius === 145, '3 级引爆范围 145px')
assert(p3.motesCount === 7, '3 级溅射 7 颗飞火流星')

// 验证选卡界面的动态文案生成与数值显示
const blazingCard = { id: 'blazing_fire', icon: '🔥', name: '离火焚原', type: '神通 · 绝技', copy: '' }
gc.game.settlement = { cards: [blazingCard], chosen: null, loot: [] }

gc.game.blazingFireLevel = 0
gc.renderSettlement()
assert(blazingCard.copy.includes('持续灼烧 10%/s') && blazingCard.copy.includes('20%') && blazingCard.copy.includes('3 颗飞火流星'), '未习得时选卡文案显示持续灼烧 10%/s、引爆 20% 与 3 颗流星')

gc.game.blazingFireLevel = 1
gc.renderSettlement()
assert(blazingCard.copy.includes('升级至 2 重') && blazingCard.copy.includes('持续灼烧 15%/s') && blazingCard.copy.includes('25%') && blazingCard.copy.includes('迸射 5 颗飞火流星'), '1 重升级至 2 重选卡文案显示持续灼烧 15%/s、引爆 25% 与迸射 5 颗流星')

gc.game.blazingFireLevel = 2
gc.renderSettlement()
assert(blazingCard.copy.includes('升级至 3 重') && blazingCard.copy.includes('持续灼烧 20%/s') && blazingCard.copy.includes('30%') && blazingCard.copy.includes('迸射 7 颗飞火流星'), '2 重升级至 3 重选卡文案显示持续灼烧 20%/s、引爆 30% 与迸射 7 颗流星')

// 6. 验证离火烙印挂载
gc.game.blazingFireLevel = 1
gc.game.attack = 30
const enemyA = { x: 300, y: 300, hp: 100, maxHp: 100, r: 14 }
gc.applyBlazingFireBrand(enemyA, 30)
assert(enemyA.flameBrand === true, '命中敌怪成功施加离火烙印')
assert(enemyA.flameBrandTimer > 3.0, '离火烙印持续时间大于 3 秒')
assert(enemyA.flameHits === 1, '命中计数为 1')

// 7. 验证持续灼烧掉血
gc.game.enemies = [enemyA]
gc.updateBlazingFire(0.35) // 推进时间超过 0.3 秒，触发一次灼烧
assert(enemyA.hp < 100, `持续灼烧掉血生效 (当前生命: ${enemyA.hp}/100)`)

// 8. 验证连续命中 3 次提前引爆 (应对高血量大怪与领主)
enemyA.flameHits = 2
gc.applyBlazingFireBrand(enemyA, 30)
assert(gc.game.blazingBursts && gc.game.blazingBursts.length > 0, '连续命中 3 次成功触发离火大爆裂')
assert(gc.game.blazingMotes && gc.game.blazingMotes.length === 3, '爆裂瞬间向四周溅射 3 颗飞火流星')

// 9. 验证飞火流星追踪并点燃其他敌怪 (连锁传火)
const enemyB = { x: 340, y: 300, hp: 80, maxHp: 80, r: 14 }
gc.game.enemies = [enemyB]
gc.game.blazingMotes = [{
  x: 335, y: 300, vx: 50, vy: 0, damage: 15, life: 0.5, maxLife: 0.5, target: enemyB
}]
gc.updateBlazingFire(0.1) // 飞火撞击敌怪 B
assert(enemyB.flameBrand === true, '飞火流星成功命中敌怪 B 并为其施加离火烙印')
assert(enemyB.hp < 80, `敌怪 B 受到飞火撞击伤害 (当前生命: ${enemyB.hp}/80)`)

// 10. 验证被点燃敌怪阵亡时引发大范围爆裂
const centerEnemy = { x: 400, y: 300, hp: 0, flameBrand: true, flameBrandDmg: 40 }
const neighbor1 = { x: 430, y: 300, hp: 100, maxHp: 100, r: 14 }
const neighborFar = { x: 650, y: 300, hp: 100, maxHp: 100, r: 14 }
gc.game.enemies = [centerEnemy, neighbor1, neighborFar]
gc.game.blazingBursts = []
gc.defeat(centerEnemy)
assert(neighbor1.hp < 100, `邻近范围内的敌怪受到爆炸波及 (当前生命: ${neighbor1.hp}/100)`)
assert(neighborFar.hp === 100, '超出爆炸半径的远端敌怪不受伤害')

// 11. 验证新开局重置
gc.startRunFromSelection()
assert(gc.game.blazingFireLevel === 0, '新一轮开局 blazingFireLevel 重置为 0')
assert(gc.game.blazingBursts.length === 0, '新一轮开局 blazingBursts 列表清空')
assert(gc.game.blazingMotes.length === 0, '新一轮开局 blazingMotes 列表清空')

console.log(`\n离火焚原技能卡测试汇总: ${passed} 项通过, ${failed} 项失败\n`)
if (failed > 0) process.exit(1)
