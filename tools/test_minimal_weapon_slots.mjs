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

// 模拟 DOM 节点
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
    if (sel.includes('badge')) {
      return el._children.filter(c => c._classes && (c._classes.has('slot-badge') || c._classes.has('natal-badge')))
    }
    return []
  }
  el.querySelector = (sel) => {
    if (sel.startsWith('#')) return getEl(sel)
    const findDescendant = (node, predicate) => {
      for (const child of node._children) {
        if (predicate(child)) return child
        const found = findDescendant(child, predicate)
        if (found) return found
      }
      return null
    }
    if (sel.startsWith('.')) {
      const cls = sel.slice(1)
      const found = findDescendant(el, c => c._classes && c._classes.has(cls))
      if (found) return found
      const sub = makeEl(sel)
      sub.classList.add(cls)
      el._children.push(sub)
      return sub
    }
    return makeEl(sel)
  }
  el.appendChild = (child) => { el._children.push(child); return child }
  el.remove = () => {
    el._text = ''
    el._html = ''
  }
  el.getAttribute = (attr) => el[attr] || null
  el.setAttribute = (attr, val) => { el[attr] = val }
  Object.defineProperty(el, 'textContent', { get: () => el._text, set: (v) => { el._text = String(v) } })
  Object.defineProperty(el, 'innerHTML', {
    get: () => el._html,
    set: (v) => {
      el._html = String(v)
      // 若包含 img，解析其 src 与 alt
      if (v.includes('<img')) {
        const srcMatch = v.match(/src="([^"]+)"/)
        const altMatch = v.match(/alt="([^"]+)"/)
        const img = makeEl('img')
        img.classList.add('slot-img')
        if (srcMatch) img.src = srcMatch[1]
        if (altMatch) img.alt = altMatch[1]
        img.getAttribute = (a) => a === 'src' ? img.src : (a === 'alt' ? img.alt : null)
        el._children = [img]
      } else {
        el._children = []
      }
    }
  })
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

globalThis.__FORCE_BROWSER_MODE__ = true
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

// 1. 验证本命法宝贴图展示与无字化
gc.startRunFromSelection()
const natalSlot = getEl('#natal-weapon-slot')
assert(!!natalSlot, '本命法宝槽位元素存在')

// 检查本命法宝上的贴图
const natalImg = natalSlot.querySelector('.slot-img')
assert(!!natalImg && !!natalImg.src, `本命法宝正确挂载贴图: ${natalImg && natalImg.src}`)
assert(natalImg && natalImg.src.includes('weapon_'), '贴图文件名以 weapon_ 开头')

// 检查本命法宝槽位没有任何文字角标
const natalBadges = natalSlot.querySelectorAll('.natal-badge, .slot-badge')
assert(natalBadges.length === 0, '本命法宝槽位上没有任何文字角标 (无“本命”或“Lv.X”)')
assert(!natalSlot.textContent.includes('本命'), '本命法宝文字内容不包含“本命”')

// 2. 验证各个职业切换时本命法宝贴图正确对应
const testTypes = ['sword', 'bagua', 'hammer', 'beast_bell', 'demon_blade', 'ghost_lantern']
for (const t of testTypes) {
  gc.game.player.weaponType = t
  gc.game.weapons = [{ id: t, weaponType: t, type: '本命法宝', name: t, image: `./weapon_${t}.png`, count: 1 }]
  gc.updateWeaponSlotHUD()
  const img = natalSlot.querySelector('.slot-img')
  assert(img && img.src === `./weapon_${t}.png`, `切换武器类型 ${t} 时贴图自动更新为 ./weapon_${t}.png`)
}

// 3. 验证四周进攻槽位在空置状态下没有任何“上/下/左/右”文字标记
for (let i = 0; i < 4; i++) {
  const slotEl = getEl(`#offensive-slot-${i}`)
  assert(!!slotEl, `槽位 ${i} 存在`)
  const inner = slotEl.querySelector('.slot-inner')
  assert(!inner._html.includes('上') && !inner._html.includes('下') && !inner._html.includes('左') && !inner._html.includes('右'), `空槽位 ${i} 不包含方位文字标记`)
  assert(inner._html === '', `空槽位 ${i} innerHTML 完全清空为空白`)
}

// 4. 验证 CSS 文件中武器槽边框已全部移除
import { readFileSync } from 'node:fs'
const cssContent = readFileSync(resolve('src/style.css'), 'utf8')

assert(cssContent.includes('.weapon-slot-hud') && cssContent.includes('background: transparent;'), '.weapon-slot-hud 背景设为 transparent')
assert(cssContent.includes('.slots-header {\n  display: none !important;\n}'), '.slots-header 彻底隐藏不显示')
assert(cssContent.includes('.slot-empty-marker {\n  display: none !important;\n}'), '.slot-empty-marker 方位文字标记彻底隐藏')
assert(cssContent.includes('.slot-badge.natal-badge {\n  display: none !important;\n}'), '.slot-badge.natal-badge 本命文字角标彻底隐藏')

console.log(`\n极简武器槽与本命贴图测试汇总: ${passed} 项通过, ${failed} 项失败\n`)
if (failed > 0) process.exit(1)
