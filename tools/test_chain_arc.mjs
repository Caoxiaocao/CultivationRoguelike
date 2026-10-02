/**
 * 连锁电弧 (Chain Arc) 功能与机制完整性测试
 *
 * 验证：
 * 1. 资源文件存在性 (skill_chain_lightning.png, effect_chain_arc.png)
 * 2. 图鉴配置 (CODEX_DATA.cards 中的 chain_arc)
 * 3. 动态倍率计算 (getChainArcN: 20 + (level - 1) * 10)
 * 4. 连锁电弧伤害机制 (主武器攻击命中传递 n 个目标，造成 n% 伤害)
 * 5. 技能升级成长验证
 * 6. 开局重置逻辑 (startRunFromSelection)
 */
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

// 1. 验证图片资源文件
const iconPath = resolve('public/skill_chain_lightning.png')
const effectPath = resolve('public/effect_chain_arc.png')
assert(existsSync(iconPath) && statSync(iconPath).size > 1000, '连锁电弧技能贴图 public/skill_chain_lightning.png 存在且有效')
assert(existsSync(effectPath) && statSync(effectPath).size > 1000, '连锁电弧特效贴图 public/effect_chain_arc.png 存在且有效')

// 2. 模拟无头环境载入产物
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
  el.querySelectorAll = () => []
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
  createElement: () => ({ relList: { supports: () => true } }),
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
assert(typeof gc.triggerChainArc === 'function', 'triggerChainArc 方法已导出')
assert(typeof gc.getChainArcN === 'function', 'getChainArcN 方法已导出')

// 3. 检查图鉴数据
const codexCards = gc.CODEX_DATA.cards
const chainArcCodex = codexCards.find(c => c.id === 'chain_arc')
assert(!!chainArcCodex, '图鉴 CODEX_DATA.cards 中已注册 chain_arc')
assert(chainArcCodex.image === './skill_chain_lightning.png', '图鉴中 chain_arc 贴图引用正确')
assert(chainArcCodex.name === '连锁电弧', '图鉴中名称为连锁电弧')

// 4. 验证 getChainArcN 数值公式
gc.game.chainArcLevel = 1
gc.game.chainArcN = null
assert(gc.getChainArcN() === 10, '1 级连锁电弧传递与伤害倍率 n = 10')

gc.game.chainArcLevel = 2
assert(gc.getChainArcN() === 15, '2 级连锁电弧传递与伤害倍率 n = 15')

gc.game.chainArcLevel = 3
assert(gc.getChainArcN() === 20, '3 级连锁电弧传递与伤害倍率 n = 20')

gc.game.chainArcN = 75
assert(gc.getChainArcN() === 75, '支持 chainArcN 自定义覆盖倍率 (75)')
gc.game.chainArcN = null

// 验证选卡界面的动态文案生成
const chainCard = { id: 'chain_arc', icon: '⚡', name: '连锁电弧', type: '神通 · 绝技', copy: '' }
gc.game.settlement = { cards: [chainCard], chosen: null, loot: [] }

gc.game.chainArcLevel = 0
gc.renderSettlement()
assert(chainCard.copy.includes('10 个敌怪') && chainCard.copy.includes('10%'), '未习得时选卡文案为初重 10 个敌怪与 10% 伤害')

gc.game.chainArcLevel = 1
gc.renderSettlement()
assert(chainCard.copy.includes('升级至 2 重') && chainCard.copy.includes('15 怪') && chainCard.copy.includes('15%'), '1 重升级至 2 重选卡文案为 15 怪与 15% 伤害')

gc.game.chainArcLevel = 2
gc.renderSettlement()
assert(chainCard.copy.includes('升级至 3 重') && chainCard.copy.includes('20 怪') && chainCard.copy.includes('20%'), '2 重升级至 3 重选卡文案为 20 怪与 20% 伤害')

// 5. 验证触发与伤害机制
// 创建 4 个相邻敌怪
const enemy1 = { x: 100, y: 100, r: 15, hp: 100, maxHp: 100, hit: 0 }
const enemy2 = { x: 160, y: 100, r: 15, hp: 100, maxHp: 100, hit: 0 }
const enemy3 = { x: 220, y: 100, r: 15, hp: 100, maxHp: 100, hit: 0 }
const enemy4 = { x: 280, y: 100, r: 15, hp: 100, maxHp: 100, hit: 0 }
gc.game.enemies = [enemy1, enemy2, enemy3, enemy4]

// 设定 1 级连锁电弧 (n = 10), 主武器伤害 50
// 每个敌怪收到主武器伤害的 10% = 50 * 0.10 = 5 点伤害
gc.game.chainArcLevel = 1
gc.game.chainArcCooldown = 0
gc.game._currentAttackIsPrimary = true

gc.triggerChainArc(enemy1, 50)

assert(enemy1.hp === 95, `起始敌怪受到 5 点电弧伤害 (剩余 ${enemy1.hp}/95)`)
assert(enemy2.hp === 95, `传递第 2 敌怪受到 5 点电弧伤害 (剩余 ${enemy2.hp}/95)`)
assert(enemy3.hp === 95, `传递第 3 敌怪受到 5 点电弧伤害 (剩余 ${enemy3.hp}/95)`)
assert(enemy4.hp === 95, `传递第 4 敌怪受到 5 点电弧伤害 (剩余 ${enemy4.hp}/95)`)

// 6. 验证升级为 2 级 (n = 15)
// 主武器伤害 60，每个敌怪受到 60 * 15% = 9 点伤害
gc.game.chainArcLevel = 2
gc.game.chainArcCooldown = 0
gc.triggerChainArc(enemy1, 60)

assert(enemy1.hp === 86, `2 级电弧造成 9 点电弧伤害 (剩余 ${enemy1.hp}/86)`)
assert(enemy2.hp === 86, `2 级电弧连续传递至第 2 敌怪 (剩余 ${enemy2.hp}/86)`)

// 7. 验证开局重置
gc.startRunFromSelection()
assert(gc.game.chainArcLevel === 0, '新一轮开局 chainArcLevel 重置为 0')
assert(gc.game.chainArcs.length === 0, '新一轮开局 chainArcs 队列清空')

console.log(`\n测试汇总: ${passed} 项通过, ${failed} 项失败\n`)
if (failed > 0) process.exit(1)
