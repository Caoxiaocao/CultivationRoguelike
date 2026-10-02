import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

let passed = 0
let failed = 0
function assert(cond, msg) {
  if (cond) {
    passed++
    console.log(`PASS  ${msg}`)
  } else {
    failed++
    console.error(`FAIL  ${msg}`)
  }
}

// 模拟 DOM 环境加载产物
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
    return Array.from(elements.values()).filter(e => {
      if (sel.startsWith('#') && e.id === sel.slice(1)) return true
      if (sel.startsWith('.') && e._classes.has(sel.slice(1))) return true
      return false
    })
  }
  el.querySelector = (sel) => {
    return elements.get(sel) || null
  }
  Object.defineProperty(el, 'textContent', { get: () => el._text, set: (v) => { el._text = String(v) } })
  Object.defineProperty(el, 'innerHTML', { get: () => el._html, set: (v) => { el._html = String(v) } })
  return el
}

function getEl(sel) {
  if (!elements.has(sel)) elements.set(sel, makeEl(sel.replace(/^[#.]/, '')))
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
  drawImage() {}, setLineDash() {}, translate() {}, rotate() {}, scale() {},
  ellipse() {}, roundRect() {}, rect() {}, measureText: () => ({ width: 50 }),
  fillText() {}
})

globalThis.document = {
  querySelector: (sel) => getEl(sel),
  querySelectorAll: (sel) => {
    return Array.from(elements.values()).filter(e => {
      if (sel.startsWith('#') && e.id === sel.slice(1)) return true
      if (sel.startsWith('.') && e._classes.has(sel.slice(1))) return true
      return false
    })
  },
  createElement: () => ({ relList: { supports: () => true } }),
}
globalThis.MutationObserver = class { observe() {} }
globalThis.window = { addEventListener() {}, devicePixelRatio: 1 }
globalThis.performance = { now: () => Date.now() }
globalThis.requestAnimationFrame = () => {}

const assets = readdirSync(resolve('dist/assets'))
const bundle = assets.find(name => name.endsWith('.js'))
if (!bundle) throw new Error('Build bundle not found')
await import(pathToFileURL(resolve('dist/assets', bundle)).href)

const gc = globalThis.window.__gameControls
assert(!!gc, '__gameControls exported')

console.log('\n--- 验证 24 把门派神兵在关卡结算时的升级卡文案与对象隔离 ---')

const origBaseCards = gc.cards
const origSwordCardName = origBaseCards.find(c => c.id === 'sword')?.name

let verifiedWeapons = 0
for (const char of gc.characters) {
  for (const weapon of char.weapons) {
    // 模拟玩家装备该武器
    gc.game.player.weaponId = weapon.id
    gc.game.player.weaponType = weapon.type
    gc.game.weapons[0] = { id: weapon.id, name: weapon.name, count: 1 }

    // 模拟关卡结算卡片
    const settlementCards = [
      { id: 'sword', icon: '✧', name: '流云飞剑', type: '法宝 · 强化', copy: '基础描述' }
    ]
    gc.game.settlement = {
      cards: settlementCards,
      chosen: null,
      loot: []
    }

    gc.renderSettlement()

    const card = gc.game.settlement.cards[0]
    
    // 验证卡片名称与武器匹配
    const isSwordType = ['sword', 'sword_qingfeng', 'qingfeng'].includes(weapon.type)
    if (isSwordType) {
      assert(card.name.includes('飞剑'), `[${char.name} · ${weapon.name}] 卡片显示飞剑专属强化: ${card.name}`)
    } else {
      assert(
        card.name.includes(weapon.name) || card.copy.includes(weapon.name.slice(0, 2)),
        `[${char.name} · ${weapon.name}] 结算卡文案包含神兵专属标识: ${card.name} (${card.copy})`
      )
    }

    // 验证全局原始卡片对象未被脏写
    const currentBaseSwordCardName = origBaseCards.find(c => c.id === 'sword')?.name
    assert(
      currentBaseSwordCardName === origSwordCardName,
      `全局卡池对象未受污染 (保持: ${currentBaseSwordCardName})`
    )

    verifiedWeapons++
  }
}

assert(verifiedWeapons === 24, `全部 24 把神兵升级文案与隔离性验证通过 (${verifiedWeapons}/24)`)

console.log(`\n测试汇总: ${passed} 项通过, ${failed} 项失败\n`)
if (failed > 0) process.exit(1)
