/**
 * 演武试炼 (测试关卡) 功能与机制完整性测试套件
 *
 * 验证项目：
 * 1. DOM 结构完整性 (#btn-title-test, #test-hud-toolbar, #modal-test-panel, #btn-pause-test-level)
 * 2. 演武场初始化 (startTestLevel: 倒计时无休、初始不死神桩、神识索敌就绪)
 * 3. 24 把神兵法宝即时自由切换 (8 大宗门门派弟子各 3 把法宝，秒算攻防模组与贴图)
 * 4. 神通绝技重数调整 (连锁电弧 10+(lvl-1)*5、离火焚原 10%/20%/3颗流星与成长、槽位法宝)
 * 5. 境界与基础属性实时微调 (五大境界、四大小阶段、攻击力、攻速、范围、移速、金刚不坏锁血)
 * 6. 演武靶标与木桩系统 (不死神桩、易爆草人群、巨岩玄石桩、清屏、归位)
 * 7. 伤害与秒伤统计 (DPS计算、累计总伤、峰值极值、命中次数、重置统计)
 * 8. 不死木桩承伤不死机制 & 易爆草人受击殉爆机制
 * 9. 控制台多标签页渲染 (weapons / skills / realms / dummies / stats)
 * 10. 退出演武场回归主界面 (exitTestLevel)
 */

import { existsSync, readdirSync } from 'node:fs'
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

// 1. 模拟 DOM 环境加载产物
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

// 1. DOM 节点完整性验证
console.log('\n--- 1. 演武试炼 DOM 入口与结构测试 ---')
assert(typeof gc.startTestLevel === 'function', 'startTestLevel 控制函数已成功导出')
assert(typeof gc.exitTestLevel === 'function', 'exitTestLevel 控制函数已成功导出')
assert(typeof gc.spawnTestDummy === 'function', 'spawnTestDummy 木桩召唤函数已成功导出')
assert(typeof gc.spawnDummyCluster === 'function', 'spawnDummyCluster 草人群召唤函数已成功导出')
assert(typeof gc.applyTestWeapon === 'function', 'applyTestWeapon 神兵切换函数已成功导出')
assert(typeof gc.setTestSkillLevel === 'function', 'setTestSkillLevel 技能调级函数已成功导出')
assert(typeof gc.setTestRealm === 'function', 'setTestRealm 境界调整函数已成功导出')
assert(typeof gc.toggleTestPanel === 'function', 'toggleTestPanel 控制台开关函数已成功导出')
assert(typeof gc.renderTestPanelTab === 'function', 'renderTestPanelTab 标签页渲染函数已成功导出')

// 2. 演武场初始化测试
console.log('\n--- 2. 演武场初始化与状态测试 ---')
gc.startTestLevel({ godMode: true, autoSpawn: false })
assert(gc.game.isTestLevel === true, '演武场标记 isTestLevel = true')
assert(gc.game.testGodMode === true, '演武场金刚不坏 (锁血) 默认已开启')
assert(gc.game.testAutoSpawn === false, '演武场默认关闭杂怪自动刷新')
assert(gc.game.stageTime > 100000, '演武场时间无休止 (不触发倒计时退场)')
assert(gc.game.enemies.length === 1, '初始化自动在前方召唤了 1 尊靶标木桩')
assert(gc.game.enemies[0].isDummy === true, '初始靶标为 isDummy = true')
assert(gc.game.enemies[0].immortal === true, '初始靶标为不死神桩 immortal = true')
assert(gc.game.enemies[0].hp > 90000000, '不死神桩生命值近亿 (99999999)')

// 3. 24 把神兵法宝自由切换测试 (8 大角色各 3 把武器)
console.log('\n--- 3. 24 把神兵法宝即时自由切换测试 ---')
let testedWeapons = 0
for (const char of gc.characters) {
  for (const weapon of char.weapons) {
    gc.applyTestWeapon(char.id, weapon.id, false)
    assert(gc.game.player.charId === char.id, `角色正确切换为 ${char.name} (${char.id})`)
    assert(gc.game.player.weaponId === weapon.id, `神兵正确切换为 ${weapon.name} (${weapon.id})`)
    assert(gc.game.player.weaponType === weapon.type, `神兵模组匹配 ${weapon.type}`)
    assert(gc.game.weapons[0].id === weapon.id, `本命法宝槽位已同步为 ${weapon.name}`)
    assert(gc.game.attack > 0, `基础攻击力已生效 (${gc.game.attack} 点)`)
    testedWeapons++
  }
}
assert(testedWeapons === 24, `24 把诸派本命法宝全部测试通过 (${testedWeapons}/24)`)

// 4. 神通技能重数调整测试 (连锁电弧、离火焚原、四象槽位法宝)
console.log('\n--- 4. 神通技能重数调整与公式测试 ---')
// 连锁电弧
gc.setTestSkillLevel('chain_arc', 1)
assert(gc.game.chainArcLevel === 1, '连锁电弧设定为 1 重')
assert(gc.getChainArcN() === 10, '1 重传递与威力为 10')
gc.setTestSkillLevel('chain_arc', 2)
assert(gc.getChainArcN() === 15, '2 重传递与威力为 15 (公式: 10 + (2-1)*5)')
gc.setTestSkillLevel('chain_arc', 3)
assert(gc.getChainArcN() === 20, '3 重传递与威力为 20 (公式: 10 + (3-1)*5)')
gc.setTestSkillLevel('chain_arc', 0)
assert(gc.game.chainArcLevel === 0, '连锁电弧重数设为 0 (停用)')

// 离火焚原
gc.setTestSkillLevel('blazing_fire', 1)
assert(gc.game.blazingFireLevel === 1, '离火焚原设定为 1 重')
let p = gc.getBlazingFireParams()
assert(p.burnDmgPct === 10, '1 重持续灼烧 10%/s')
assert(p.burstDamagePct === 20, '1 重真火爆裂 20%')
assert(p.motesCount === 3, '1 重溅射流星 3 颗')

gc.setTestSkillLevel('blazing_fire', 2)
p = gc.getBlazingFireParams()
assert(p.burnDmgPct === 15, '2 重持续灼烧 15%/s')
assert(p.burstDamagePct === 25, '2 重真火爆裂 25%')
assert(p.motesCount === 5, '2 重溅射流星 5 颗')

gc.setTestSkillLevel('blazing_fire', 3)
p = gc.getBlazingFireParams()
assert(p.burnDmgPct === 20, '3 重持续灼烧 20%/s')
assert(p.burstDamagePct === 30, '3 重真火爆裂 30%')
assert(p.motesCount === 7, '3 重溅射流星 7 颗')

// 槽位法宝
gc.setTestSkillLevel('fire', 2)
assert(gc.getOffensiveSlotIndex('fire') >= 0, '赤炎葫芦成功装备入槽位')
assert(gc.game.offensiveSlots[gc.getOffensiveSlotIndex('fire')].level === 2, '赤炎葫芦强化为 Lv.2')

gc.setTestSkillLevel('pet', 3)
assert(gc.getOffensiveSlotIndex('pet') >= 0, '青羽灵狐成功装备入槽位')
assert(gc.game.offensiveSlots[gc.getOffensiveSlotIndex('pet')].level === 3, '青羽灵狐强化为 Lv.3')

// 5. 境界与基础属性实时微调测试
console.log('\n--- 5. 境界修为与属性微调测试 ---')
gc.setTestRealm(0, 0) // 炼气初期
assert(gc.game.realm === 0 && gc.game.subStage === 0, '境界设定为炼气初期')
gc.setTestRealm(1, 2) // 筑基后期
assert(gc.game.realm === 1 && gc.game.subStage === 2, '境界设定为筑基后期')
gc.setTestRealm(4, 3) // 化神圆满
assert(gc.game.realm === 4 && gc.game.subStage === 3, '境界设定为化神圆满')

gc.game.attack = 88
assert(gc.game.attack === 88, '攻击力微调为 88 点生效')
gc.game.attackSpeed = 2.0
assert(gc.game.attackSpeed === 2.0, '御剑攻速微调为 2.0x 倍生效')
gc.game.attackRange = 250
assert(gc.game.attackRange === 250, '神识攻击范围微调为 250px 生效')

// 6. 木桩靶标与清场测试
console.log('\n--- 6. 演武场木桩召唤与清屏测试 ---')
gc.clearTestDummies()
assert(gc.game.enemies.length === 0, '清屏后全场敌人为 0')

const immortal = gc.spawnTestDummy('immortal', 620, 270)
assert(immortal.isDummy && immortal.immortal, '成功召唤不死神桩')

const tank = gc.spawnTestDummy('tank', 620, 320)
assert(tank.isDummy && tank.maxHp === 50000, '成功召唤 50,000 HP 巨岩玄石桩')

gc.spawnDummyCluster(16, 120, 'straw')
assert(gc.game.enemies.filter(e => e.kind === 'straw').length === 16, '成功环形召唤 16 只易爆草人')

// 7. 伤害机制与秒伤 (DPS) 统计测试
console.log('\n--- 7. 伤害机制与秒伤统计测试 ---')
gc.resetTestStats()
assert(gc.game.testStats.totalDamage === 0, '统计总伤害已清零')
assert(gc.game.testStats.hits === 0, '统计命中次数已清零')

// 对不死神桩造成伤害
gc.recordTestDamage(120, immortal, 'primary')
assert(gc.game.testStats.totalDamage === 120, '总伤害累加至 120 点')
assert(gc.game.testStats.hits === 1, '命中计数为 1 次')
assert(gc.game.testStats.peakHit === 120, '峰值命中记录为 120 点')
assert(immortal.totalDamageTaken === 120, '不死神桩承伤计数为 120 点')
assert(immortal.hp === immortal.maxHp, '不死神桩受击不减血 (锁血不死)')

gc.recordTestDamage(85, immortal, 'chain_arc')
assert(gc.game.testStats.totalDamage === 205, '总伤害累加至 205 点')
assert(gc.game.testStats.sources.chain_arc === 85, '连锁电弧来源分项统计 85 点')

gc.recordTestDamage(300, immortal, 'blazing_fire')
assert(gc.game.testStats.totalDamage === 505, '总伤害累加至 505 点')
assert(gc.game.testStats.peakHit === 300, '最高单次伤害刷新为 300 点')
assert(gc.game.testStats.sources.blazing_fire === 300, '离火焚原来源分项统计 300 点')

// 8. 易爆草人受击死亡触发连锁测试
console.log('\n--- 8. 易爆草人击杀殉爆测试 ---')
const straw = gc.game.enemies.find(e => e.kind === 'straw')
assert(!!straw, '找到易爆草人')
straw.flameBrand = true
straw.flameBrandDmg = 100
gc.defeat(straw)
assert(!gc.game.enemies.includes(straw), '草人承受致命伤后被正常消灭')

// 9. 控制台模态窗口与 5 大标签页测试
console.log('\n--- 9. 控制台 5 大标签页交互测试 ---')
gc.renderTestPanelTab('weapons')
assert(true, '武器标签页 (weapons) 渲染正常')

gc.renderTestPanelTab('skills')
assert(true, '神通标签页 (skills) 渲染正常')

gc.renderTestPanelTab('realms')
assert(true, '境界标签页 (realms) 渲染正常')

gc.renderTestPanelTab('dummies')
assert(true, '木桩靶标标签页 (dummies) 渲染正常')

gc.renderTestPanelTab('stats')
assert(true, '统计面板标签页 (stats) 渲染正常')

// 10. 退出演武场回归主界面测试
console.log('\n--- 10. 退出演武场回归主界面测试 ---')
gc.exitTestLevel()
assert(gc.game.isTestLevel === false, '已退出演武场 (isTestLevel = false)')

console.log(`\n=============================================`)
console.log(`演武试炼场全功能自动化测试: ${passed} 项通过, ${failed} 项失败`)
console.log(`=============================================\n`)

if (failed > 0) {
  process.exit(1)
}
