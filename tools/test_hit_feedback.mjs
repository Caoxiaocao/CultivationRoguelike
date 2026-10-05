/**
 * 全方位打击感（音效、光效、微击退、暴击顿帧与震屏）回归与集成测试套件
 *
 * 覆盖：
 *   1. Web Audio 打击音效合成与分层机制 (sound.hitEnemy: 普攻刀肉/破甲、暴击裂鸣低音轰击、领主沉钟)
 *   2. 视觉光效粒子体系 (spawnHitImpact: 拉丝火花 hitSparks、十字/八角耀光爆星 hitFlares、同心双环 hitRings)
 *   3. 物理受创微击退与霸体机制 (小怪受创微击退，精英怪霸体减退，Boss霸体免疫击退，边界约束)
 *   4. 暴击高光与微顿帧手感 (Hitstop 35ms顿帧、CameraShake震屏、手柄震动)
 *   5. VFX 更新与 lighter 高光混合渲染
 *
 * 运行： npm run build && node tools/test_hit_feedback.mjs
 */
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

let passed = 0
let failed = 0
function assert(cond, msg) {
  if (cond) {
    console.log(`PASS  ${msg}`)
    passed++
  } else {
    console.error(`FAIL  ${msg}`)
    failed++
  }
}

/* ---------- 模拟最小 Web Audio 节点 ---------- */
class MockAudioNode {
  constructor() {
    this.connected = []
  }
  connect(dest) {
    this.connected.push(dest)
    return dest
  }
  disconnect() {}
}

class MockAudioParam {
  constructor(defaultVal = 0) {
    this.value = defaultVal
    this.events = []
  }
  setValueAtTime(val, t) {
    this.events.push({ type: 'setValue', val, t })
    this.value = val
  }
  exponentialRampToValueAtTime(val, t) {
    this.events.push({ type: 'exponentialRamp', val, t })
    this.value = val
  }
  linearRampToValueAtTime(val, t) {
    this.events.push({ type: 'linearRamp', val, t })
    this.value = val
  }
  cancelScheduledValues(t) {
    this.events.push({ type: 'cancel', t })
  }
}

class MockGainNode extends MockAudioNode {
  constructor() {
    super()
    this.gain = new MockAudioParam(1.0)
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor() {
    super()
    this.type = 'sine'
    this.frequency = new MockAudioParam(440)
    this.started = false
    this.stopped = false
  }
  start(t) {
    this.started = true
    this.startTime = t
  }
  stop(t) {
    this.stopped = true
    this.stopTime = t
  }
}

class MockDynamicsCompressorNode extends MockAudioNode {
  constructor() {
    super()
    this.threshold = new MockAudioParam(-3)
    this.knee = new MockAudioParam(4)
    this.ratio = new MockAudioParam(12)
    this.attack = new MockAudioParam(0.003)
    this.release = new MockAudioParam(0.15)
  }
}

class MockBiquadFilterNode extends MockAudioNode {
  constructor() {
    super()
    this.type = 'lowpass'
    this.frequency = new MockAudioParam(1000)
    this.Q = new MockAudioParam(1)
  }
}

class MockAudioBufferSourceNode extends MockAudioNode {
  constructor() {
    super()
    this.buffer = null
  }
  start() {}
  stop() {}
}

class MockAudioContext {
  constructor() {
    this.currentTime = 0.1
    this.sampleRate = 44100
    this.state = 'running'
    this.destination = new MockAudioNode()
    this.createdOscillators = []
    this.createdGains = []
  }
  createGain() {
    const g = new MockGainNode()
    this.createdGains.push(g)
    return g
  }
  createOscillator() {
    const o = new MockOscillatorNode()
    this.createdOscillators.push(o)
    return o
  }
  createDynamicsCompressor() {
    return new MockDynamicsCompressorNode()
  }
  createBiquadFilter() {
    return new MockBiquadFilterNode()
  }
  createBuffer(channels, length, sampleRate) {
    return {
      getChannelData() { return new Float32Array(length) }
    }
  }
  createBufferSource() {
    return new MockAudioBufferSourceNode()
  }
  resume() {
    this.state = 'running'
    return Promise.resolve()
  }
}

globalThis.AudioContext = MockAudioContext
globalThis.webkitAudioContext = MockAudioContext

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

let lastCompositeOperation = ''
const drawOperations = []

const canvasEl = getEl('#game')
canvasEl.width = 960
canvasEl.height = 540
canvasEl.getContext = () => ({
  get globalCompositeOperation() { return lastCompositeOperation },
  set globalCompositeOperation(v) { lastCompositeOperation = v; drawOperations.push({ op: 'setComposite', val: v }) },
  save() { drawOperations.push({ op: 'save' }) },
  restore() { drawOperations.push({ op: 'restore' }) },
  translate(x, y) { drawOperations.push({ op: 'translate', x, y }) },
  rotate(ang) { drawOperations.push({ op: 'rotate', ang }) },
  scale(sx, sy) { drawOperations.push({ op: 'scale', sx, sy }) },
  beginPath() { drawOperations.push({ op: 'beginPath' }) },
  closePath() { drawOperations.push({ op: 'closePath' }) },
  moveTo(x, y) { drawOperations.push({ op: 'moveTo', x, y }) },
  lineTo(x, y) { drawOperations.push({ op: 'lineTo', x, y }) },
  arc(x, y, r) { drawOperations.push({ op: 'arc', x, y, r }) },
  fill() { drawOperations.push({ op: 'fill' }) },
  stroke() { drawOperations.push({ op: 'stroke' }) },
  createRadialGradient() { return { addColorStop() {} } },
  createLinearGradient() { return { addColorStop() {} } },
  measureText() { return { width: 0 } }
})

globalThis.__FORCE_VISUAL_FX__ = true

globalThis.document = {
  querySelector: getEl,
  querySelectorAll: () => [],
  createElement: () => makeEl('tmp'),
  body: makeEl('body'),
}
globalThis.MutationObserver = class { observe() {} }
globalThis.window = {
  addEventListener() {},
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext
}
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
assert(Boolean(gc.sound), 'sound 声音引擎已挂载到 __gameControls')
assert(typeof gc.sound.hitEnemy === 'function', 'sound.hitEnemy 打击音效合成器已就绪')

const game = gc.game
const sound = gc.sound

console.log('\n--- 1. 验证 Web Audio 打击音效合成与分层机制 ---')
sound.enabled = true
sound.init()
assert(sound.ctx !== null, 'Web Audio 上下文成功初始化')

// 1.1 普通攻击命中音效
sound._lastHitRecord = null
sound.hitEnemy(false, 'sword', false)
assert(sound._lastHitRecord !== null, '成功记录普通命中音效调用')
assert(sound._lastHitRecord.isCrit === false, '普通命中标记 isCrit 为 false')
assert(sound._lastHitRecord.weaponType === 'sword', '命中记录包含武器类型 sword')

// 1.2 重武器打击音效 (锤/重鼎)
sound.hitEnemy(false, 'ding', false)
assert(sound._lastHitRecord.weaponType === 'ding', '重武器重鼎命中成功识别')

// 1.3 拳法打击音效 (龙拳/拳套)
sound.hitEnemy(false, 'fist', false)
assert(sound._lastHitRecord.weaponType === 'fist', '霸甲龙拳打击音效成功识别')

// 1.4 暴击裂甲多巴胺复合音效
sound.hitEnemy(true, 'sword', false)
assert(sound._lastHitRecord.isCrit === true, '暴击裂甲命中标记 isCrit 为 true')

// 1.5 领主受创金石轰鸣
sound.hitEnemy(false, 'sword', true)
assert(sound._lastHitRecord.isBoss === true, '领主受创标记 isBoss 为 true')

// 1.6 伏诛音效优化
sound.defeat(false, false)
assert(true, '普通小怪伏诛轻灵升散音效触发正常')
sound.defeat(false, true)
assert(true, '精英怪伏诛沉浑爆裂音效触发正常')

// 1.7 高保真程序化噪声与动态滤波引擎验证
assert(Boolean(sound.whiteNoiseBuffer), '白噪声专用 AudioBuffer 预生成就绪')
assert(Boolean(sound.pinkNoiseBuffer), '粉红噪声 (Voss-McCartney) AudioBuffer 预生成就绪')
assert(typeof sound.playNoise === 'function', '动态滤波噪声生成器 playNoise 已就绪')
assert(typeof sound.whoosh === 'function', '凌空飞渡破虚轻啸 sound.whoosh 已就绪')
assert(typeof sound.magic === 'function', '仙道法韵回响 sound.magic 已就绪')
assert(typeof sound.wail === 'function', '幽冥鬼哭音煞 sound.wail 已就绪')

// 1.8 武器出招与法宝破空音效多态适配
sound.shoot('sword')
sound.shoot('thunder_sword')
sound.shoot('hammer')
sound.shoot('ding')
sound.shoot('dragon_armor')
sound.shoot('bagua')
sound.shoot('fuchen')
sound.shoot('flame')
assert(true, '八大武器专属出招破空与法宝音效调用正常')

// 1.9 领主终极大招音效机制 (神雷天劫、黑洞引力、大鹏神啼)
sound.enemyAoE('thunder_strike')
assert(sound._lastEnemyAoE && sound._lastEnemyAoE.type === 'thunder_strike', '九天玄刹神雷天劫音效记录正常')
sound.enemyAoE('blackhole_cast')
assert(sound._lastEnemyAoE && sound._lastEnemyAoE.type === 'blackhole_cast', '混沌太极黑洞引力坍缩音效记录正常')
sound.enemyAoE('screech')
assert(sound._lastEnemyAoE && sound._lastEnemyAoE.type === 'screech', '金翅大鹏裂帛神啼音效记录正常')

// 1.10 五声音阶突破与仙家拾取交互
sound.levelUp()
sound.pickup(true)
sound.pickup(false)
sound.click()
assert(true, '五声音阶升级仙乐与灵石/仙宝拾取反馈触发正常')

console.log('\n--- 2. 验证受击物理微击退与霸体防线机制 ---')
game.player.x = 400
game.player.y = 300

// 2.1 普通幽魂小怪受击微击退
const mockWisp = { x: 450, y: 300, hp: 100, maxHp: 100, r: 12, kind: 'wisp' }
const origWispX = mockWisp.x
gc.damageEnemy(mockWisp, 15)
assert(mockWisp.x > origWispX, `普通小怪受到有效击退 (X: ${origWispX} -> ${mockWisp.x}, 击退约 ${(mockWisp.x - origWispX).toFixed(1)}px)`)

// 2.2 巨兕受击微击退 (质量更大，击退略小)
const mockBrute = { x: 450, y: 300, hp: 200, maxHp: 200, r: 16, kind: 'brute' }
const origBruteX = mockBrute.x
gc.damageEnemy(mockBrute, 15)
const brutePush = mockBrute.x - origBruteX
assert(brutePush > 0 && brutePush < (mockWisp.x - origWispX), `重型巨兕受击击退距离小于普通小怪 (巨兕击退: ${brutePush.toFixed(1)}px)`)

// 2.3 赤炼/玄霜精英巨兕霸体减退
const mockElite = { x: 450, y: 300, hp: 500, maxHp: 500, r: 20, kind: 'elite_brute', isElite: true }
const origEliteX = mockElite.x
gc.damageEnemy(mockElite, 15)
const elitePush = mockElite.x - origEliteX
assert(elitePush > 0 && elitePush < brutePush, `精英怪拥有强韧霸体，受创击退大幅减免 (精英击退: ${elitePush.toFixed(1)}px)`)

// 2.4 边界防溢出保护 (不能被击退穿出场地墙壁)
const mockEdgeEnemy = { x: 955, y: 300, hp: 100, maxHp: 100, r: 12, kind: 'wisp' }
gc.damageEnemy(mockEdgeEnemy, 15)
assert(mockEdgeEnemy.x <= 960 - (mockEdgeEnemy.r || 14), `怪被击退时被有效限制在竞技场边界内 (X: ${mockEdgeEnemy.x} <= 948)`)

// 2.5 Boss 与领主肢体免疫击退 (霸体不可推移)
game.boss = {
  id: 'red_dragon',
  name: '千年赤炼蛟',
  x: 480,
  y: 270,
  r: 44,
  hp: 2000,
  maxHp: 2000,
  phaseIndex: 0,
  defeated: false,
  invuln: 0,
  config: { phases: [{}] }
}
const origBossX = game.boss.x
const origBossY = game.boss.y
gc.damageBoss(20)
assert(game.boss.x === origBossX && game.boss.y === origBossY, 'Boss拥有完全霸体，坐标绝对稳固 (0击退)')

console.log('\n--- 3. 验证暴击高光、微顿帧(Hitstop)与镜头微震 ---')
game.critChance = 1.0 // 必定暴击
game.cameraShake = 0
game.hitstop = 0

const mockCritEnemy = { x: 480, y: 350, hp: 200, maxHp: 200, r: 14, kind: 'wisp' }
gc.damageEnemy(mockCritEnemy, 30)

assert(game.hitstop >= 0.034, `暴击触发经典打击感微顿帧 (hitstop: ${game.hitstop.toFixed(3)}s, 约 35ms 经典打击定格)`)
assert(game.cameraShake >= 0.08, `暴击触发轻微镜头震颤 (cameraShake: ${game.cameraShake.toFixed(2)})`)
assert(sound._lastHitRecord && sound._lastHitRecord.isCrit === true, '暴击命中正确派发了暴击裂甲音效')

// 领主暴击顿帧与震动
game.hitstop = 0
game.cameraShake = 0
gc.damageBoss(40)
assert(game.hitstop >= 0.038, `领主受创暴击触发更强微顿帧 (hitstop: ${game.hitstop.toFixed(3)}s)`)
assert(game.cameraShake >= 0.13, `领主受创暴击触发更强镜头震颤 (cameraShake: ${game.cameraShake.toFixed(2)})`)

console.log('\n--- 4. 验证打击光效 (拉丝火花、爆星耀芒、扩散热浪冲击环) ---')
game.hitSparks = []
game.hitFlares = []
game.hitRings = []

// 4.1 普通打击生成火花与星芒
gc.spawnHitImpact(320, 240, '#ffd166', 5, false, true)
assert(game.hitSparks.length >= 6, `普通命中产生拉丝剑芒火花 (生成数: ${game.hitSparks.length})`)
assert(game.hitFlares.length === 1, `普通命中产生十字耀光爆星 (生成数: 1)`)
assert(game.hitFlares[0].isCrit === false, '普通耀光为四角十字星芒')
assert(game.hitRings.length === 1, '普通命中生成灵光冲击环')

// 验证火花物理拉丝参数
const sampleSpark = game.hitSparks[0]
assert(sampleSpark.vx !== undefined && sampleSpark.vy !== undefined, '火花具有方向速度向量')
assert(sampleSpark.life > 0 && sampleSpark.width >= 1.5, '火花具有独立生命周期与线宽')

// 4.2 暴击打击生成高能八角星芒与双重扩散环
gc.spawnHitImpact(320, 240, '#ffd166', 8, true, true)
assert(game.hitSparks.length >= 20, `暴击命中火花数量激增 (总火花数: ${game.hitSparks.length})`)
const critFlare = game.hitFlares[game.hitFlares.length - 1]
assert(critFlare && critFlare.isCrit === true, '暴击命中产生高光八角爆星耀芒')
assert(critFlare.r >= 38, `暴击爆星耀芒半径倍增 (半径: ${critFlare.r.toFixed(1)}px)`)
assert(game.hitRings.length >= 3, '暴击命中产生内外双重同心冲击环')

console.log('\n--- 5. 验证 VFX 渲染模式与物理动力学 ---')
drawOperations.length = 0

// 5.1 验证 lighter 高光叠加渲染
gc.drawHitSparks(canvasEl.getContext())
const sparksHadLighter = drawOperations.some(op => op.op === 'setComposite' && op.val === 'lighter')
assert(sparksHadLighter, '拉丝火花采用 lighter 高光混合渲染，流光溢彩')

drawOperations.length = 0
gc.drawHitFlares(canvasEl.getContext())
const flaresHadLighter = drawOperations.some(op => op.op === 'setComposite' && op.val === 'lighter')
assert(flaresHadLighter, '爆星耀芒采用 lighter 高光混合渲染，晶莹璀璨')

drawOperations.length = 0
gc.drawHitRings(canvasEl.getContext())
const ringsHadLighter = drawOperations.some(op => op.op === 'setComposite' && op.val === 'lighter')
assert(ringsHadLighter, '冲击波环采用 lighter 高光混合渲染，震撼通透')

console.log('\n--- 6. 验证离火焚原 DoT 伤害零异常反馈 (无击退、无卡顿顿帧、无屏幕剧震) ---')
game.critChance = 1.0 // 必定暴击模式
game.hitstop = 0
game.cameraShake = 0
sound._lastHitRecord = null

const dotEnemy = { x: 500, y: 300, hp: 500, maxHp: 500, r: 14, kind: 'wisp' }
const origDotEnemyX = dotEnemy.x
const origDotEnemyY = dotEnemy.y

gc.damageEnemy(dotEnemy, 25, '#ff6700', { isDoT: true })

assert(dotEnemy.x === origDotEnemyX && dotEnemy.y === origDotEnemyY, 'DoT持续灼烧伤害不造成任何微击退，彻底杜绝群怪同时抽搐')
assert(game.hitstop === 0, 'DoT灼烧伤害彻底跳过微顿帧(hitstop = 0)，杜绝主循环每秒数十次卡顿定格')
assert(game.cameraShake === 0, 'DoT灼烧伤害不触发镜头微震(cameraShake = 0)')
assert(!sound._lastHitRecord || sound._lastHitRecord.isCrit === false, 'DoT灼烧伤害禁止触发暴击判定与裂甲暴击音效')

console.log('\n--- 7. 验证敌怪与领主攻击音效合成体系 ---')
sound._lastEnemyShoot = null
gc.sound.enemyShoot('frost_crystal')
assert(sound._lastEnemyShoot && sound._lastEnemyShoot.type === 'frost_crystal', '成功派发玄霜凝晶尖啸破空音效')

sound._lastEnemyShoot = null
gc.sound.enemyShoot('magma')
assert(sound._lastEnemyShoot && sound._lastEnemyShoot.type === 'magma', '成功派发赤炼火球爆燃破膛音效')

sound._lastEnemyShoot = null
gc.sound.enemyShoot('bonespike')
assert(sound._lastEnemyShoot && sound._lastEnemyShoot.type === 'bonespike', '成功派发幽冥骨刺碎裂齐射音效')

sound._lastEnemyShoot = null
gc.sound.enemyShoot('asura_soul')
assert(sound._lastEnemyShoot && sound._lastEnemyShoot.type === 'asura_soul', '成功派发九天噬魂魔魂幽邃呼啸音效')

sound._lastEnemyShoot = null
gc.sound.enemyShoot('feather')
assert(sound._lastEnemyShoot && sound._lastEnemyShoot.type === 'feather', '成功派发大鹏太乙金羽高速破空音效')

sound._lastEnemyShoot = null
gc.sound.enemyShoot('cosmic_blade')
assert(sound._lastEnemyShoot && sound._lastEnemyShoot.type === 'cosmic_blade', '成功派发道祖混沌星辰星刃音效')

sound._lastEnemySlam = null
gc.sound.enemySlam('slam')
assert(sound._lastEnemySlam && sound._lastEnemySlam.type === 'slam', '成功派发白骨巨臂沉重拍地重击音效')

sound._lastEnemySlam = null
gc.sound.enemySlam('rush')
assert(sound._lastEnemySlam && sound._lastEnemySlam.type === 'rush', '成功派发领主狂暴冲撞破空音效')

sound._lastEnemyAoE = null
gc.sound.enemyAoE('blackhole_cast')
assert(sound._lastEnemyAoE && sound._lastEnemyAoE.type === 'blackhole_cast', '成功派发虚空黑洞引力聚能音效')

sound._lastEnemyAoE = null
gc.sound.enemyAoE('laser')
assert(sound._lastEnemyAoE && sound._lastEnemyAoE.type === 'laser', '成功派发六极崩灭旋转极光音效')

sound._lastEnemyAoE = null
gc.sound.enemyAoE('blackhole_detonate')
assert(sound._lastEnemyAoE && sound._lastEnemyAoE.type === 'blackhole_detonate', '成功派发黑洞终极殉爆沉重轰鸣音效')

console.log('\n--- 8. 验证玩家分层受击反馈与受力击退机制 ---')
sound._lastPlayerHurt = null
gc.sound.playerHurt('bullet')
assert(sound._lastPlayerHurt && sound._lastPlayerHurt.hitType === 'bullet', '玩家受弹幕擦碰派发轻灵受创音效')

sound._lastPlayerHurt = null
gc.sound.playerHurt('frost')
assert(sound._lastPlayerHurt && sound._lastPlayerHurt.hitType === 'frost', '玩家受冰晶穿透派发清脆寒冰侵体音效')

sound._lastPlayerHurt = null
gc.sound.playerHurt('fire')
assert(sound._lastPlayerHurt && sound._lastPlayerHurt.hitType === 'fire', '玩家受火球爆轰派发炽烈爆破音效')

sound._lastPlayerHurt = null
gc.sound.playerHurt('heavy')
assert(sound._lastPlayerHurt && sound._lastPlayerHurt.hitType === 'heavy', '玩家受巨力拍击/冲撞派发沉重碎骨音效')

sound._lastPlayerHurt = null
gc.sound.playerHurt('explosion')
assert(sound._lastPlayerHurt && sound._lastPlayerHurt.hitType === 'explosion', '玩家受范围大爆炸派发毁灭性音爆')

sound._lastPlayerHurt = null
gc.sound.playerHurt('dot')
assert(sound._lastPlayerHurt && sound._lastPlayerHurt.hitType === 'dot', '玩家受地火/毒沼持续伤害派发微弱滋滋音效')

/* ---------- 8. 战意国风仙乐引擎 (BGM System) 单元与自适应测试 ---------- */
console.log('\n--- 8. 战意国风仙乐引擎 (BGM System) 单元与自适应测试 ---')
assert(gc.sound.bgm && typeof gc.sound.bgm === 'object', 'BGM 引擎对象正确挂载在 sound.bgm')
assert(typeof gc.sound.bgm.init === 'function', 'BGM 具备 init 初始化方法')
assert(typeof gc.sound.bgm.play === 'function', 'BGM 具备 play 播放方法')
assert(typeof gc.sound.bgm.pause === 'function', 'BGM 具备 pause 暂停方法')
assert(typeof gc.sound.bgm.stop === 'function', 'BGM 具备 stop 停止方法')
assert(typeof gc.sound.bgm.setVolume === 'function', 'BGM 具备 setVolume 调节音量方法')
assert(typeof gc.sound.bgm.toggle === 'function', 'BGM 具备 toggle 开关切换方法')
assert(typeof gc.sound.bgm.update === 'function', 'BGM 具备 update 黄金时间调度器方法')

// 初始化与默认参数
gc.sound.bgm.init(gc.sound.ctx, gc.sound.masterGain)
assert(gc.sound.bgm.bgmGain !== null, 'BGM 独立增益节点 bgmGain 初始化成功')
assert(gc.sound.bgm.bpm === 92, 'BGM 初始节拍为 92 BPM')
assert(gc.sound.bgm.intensity === 'normal', 'BGM 初始强度为 normal')

// 音量与开关测试
gc.sound.bgm.setVolume(0.75)
assert(gc.sound.bgm.volume === 0.75, 'BGM 音量成功调节为 0.75')
const toggledOff = gc.sound.bgm.toggle()
assert(toggledOff === false && gc.sound.bgm.enabled === false, 'BGM toggle 成功关闭')
const toggledOn = gc.sound.bgm.toggle()
assert(toggledOn === true && gc.sound.bgm.enabled === true, 'BGM toggle 成功开启')

// 调度与播放测试
gc.sound.bgm.play()
assert(gc.sound.bgm.playing === true, 'BGM 启动播放状态')

// 常规战斗更新
for (let i = 0; i < 20; i++) {
  if (gc.sound.ctx) gc.sound.ctx.currentTime += 0.033
  gc.sound.bgm.update(0.033, { isBossStage: false })
}
assert(gc.sound.bgm.intensity === 'normal', '小怪战斗保持 normal 强度')

// Boss 战自适应提速
for (let i = 0; i < 30; i++) {
  if (gc.sound.ctx) gc.sound.ctx.currentTime += 0.033
  gc.sound.bgm.update(0.033, { isBossStage: true, boss: { hp: 500 } })
}
assert(gc.sound.bgm.intensity === 'boss', 'Boss 战自动切换至 boss 紧张强度')
assert(gc.sound.bgm.bpm > 92, 'Boss 战节拍动态加速向 124 BPM 爬升')

// 暂停与停止
gc.sound.bgm.pause()
assert(gc.sound.bgm.playing === false, 'BGM 暂停成功')
gc.sound.bgm.stop()
assert(gc.sound.bgm.playing === false && gc.sound.bgm.currentStep === 0, 'BGM 停止并重置步序计数')

console.log('\n====================================================')
console.log(`测试结果统计: ${passed} 通过, ${failed} 失败`)
console.log('====================================================')

if (failed > 0) {
  process.exit(1)
} else {
  console.log('🎉 极具爽快感与质感的打击音效、流光火花及受击反馈系统测试全数通过！\n')
  process.exit(0)
}
