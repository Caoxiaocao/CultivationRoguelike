import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

console.log('====================================================');
console.log('幽冥白骨尸皇 · 分散多部位领主与序列帧全机制测试');
console.log('====================================================');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS  ${message}`);
    passCount++;
  } else {
    console.error(`FAIL  ${message}`);
    failCount++;
  }
}

// 1. 验证 6 大贴图物理文件存在且有效
const skullSheetPath = path.resolve('public/boss_corpse_skull_sheet.png');
const triSkullSheetPath = path.resolve('public/boss_corpse_tri_skull_sheet.png');
const armSheetPath = path.resolve('public/boss_corpse_arm_sheet.png');
const knucklePath = path.resolve('public/effect_corpse_knuckle.png');
const ghostFirePath = path.resolve('public/effect_corpse_ghost_fire.png');
const poisonPoolPath = path.resolve('public/effect_corpse_poison_pool.png');

assert(fs.existsSync(skullSheetPath), '白骨神颅序列帧贴图 public/boss_corpse_skull_sheet.png 存在');
assert(fs.existsSync(triSkullSheetPath), '三首融合狂骨序列帧贴图 public/boss_corpse_tri_skull_sheet.png 存在');
assert(fs.existsSync(armSheetPath), '巨型骨臂序列帧贴图 public/boss_corpse_arm_sheet.png 存在');
assert(fs.existsSync(knucklePath), '骷髅指节弹幕贴图 public/effect_corpse_knuckle.png 存在');
assert(fs.existsSync(ghostFirePath), '追踪幽冥鬼火贴图 public/effect_corpse_ghost_fire.png 存在');
assert(fs.existsSync(poisonPoolPath), '幽冥毒沼贴图 public/effect_corpse_poison_pool.png 存在');

const skullStat = fs.statSync(skullSheetPath);
const triSkullStat = fs.statSync(triSkullSheetPath);
const armStat = fs.statSync(armSheetPath);
const knuckleStat = fs.statSync(knucklePath);
const ghostFireStat = fs.statSync(ghostFirePath);
const poisonPoolStat = fs.statSync(poisonPoolPath);

assert(skullStat.size > 50000, `白骨神颅贴图体积饱满且有效 (${skullStat.size} bytes > 50KB)`);
assert(triSkullStat.size > 50000, `三首融合狂骨贴图体积饱满且有效 (${triSkullStat.size} bytes > 50KB)`);
assert(armStat.size > 50000, `巨型骨臂贴图体积饱满且有效 (${armStat.size} bytes > 50KB)`);
assert(knuckleStat.size > 20000, `骷髅指节贴图体积有效 (${knuckleStat.size} bytes > 20KB)`);
assert(ghostFireStat.size > 20000, `幽冥鬼火贴图体积有效 (${ghostFireStat.size} bytes > 20KB)`);
assert(poisonPoolStat.size > 50000, `幽冥毒沼贴图体积有效 (${poisonPoolStat.size} bytes > 50KB)`);

// 2. 验证 PNG 签名头与图像分辨率 (IHDR)
function checkPngHeader(filePath, expectedW, expectedH) {
  const buf = fs.readFileSync(filePath);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { isPng, w, h };
}

const skullInfo = checkPngHeader(skullSheetPath, 720, 360);
assert(skullInfo.isPng, '白骨神颅序列帧为合法 PNG 格式');
assert(skullInfo.w === 720 && skullInfo.h === 360, `白骨神颅规格为 720x360 8帧 (实际: ${skullInfo.w}x${skullInfo.h})`);

const triSkullInfo = checkPngHeader(triSkullSheetPath, 720, 360);
assert(triSkullInfo.isPng, '三首融合狂骨序列帧为合法 PNG 格式');
assert(triSkullInfo.w === 720 && triSkullInfo.h === 360, `三首融合狂骨规格为 720x360 8帧 (实际: ${triSkullInfo.w}x${triSkullInfo.h})`);

const armInfo = checkPngHeader(armSheetPath, 720, 360);
assert(armInfo.isPng, '巨型骨臂序列帧为合法 PNG 格式');
assert(armInfo.w === 720 && armInfo.h === 360, `巨型骨臂规格为 720x360 8帧 (实际: ${armInfo.w}x${armInfo.h})`);

const knuckleInfo = checkPngHeader(knucklePath, 256, 256);
assert(knuckleInfo.isPng, '骷髅指节贴图为合法 PNG 格式');
assert(knuckleInfo.w === 256 && knuckleInfo.h === 256, `骷髅指节规格为 256x256 (实际: ${knuckleInfo.w}x${knuckleInfo.h})`);

const ghostFireInfo = checkPngHeader(ghostFirePath, 256, 256);
assert(ghostFireInfo.isPng, '幽冥鬼火贴图为合法 PNG 格式');
assert(ghostFireInfo.w === 256 && ghostFireInfo.h === 256, `幽冥鬼火规格为 256x256 (实际: ${ghostFireInfo.w}x${ghostFireInfo.h})`);

const poisonPoolInfo = checkPngHeader(poisonPoolPath, 512, 512);
assert(poisonPoolInfo.isPng, '幽冥毒沼贴图为合法 PNG 格式');
assert(poisonPoolInfo.w === 512 && poisonPoolInfo.h === 512, `幽冥毒沼规格为 512x512 (实际: ${poisonPoolInfo.w}x${poisonPoolInfo.h})`);

// 3. 模拟浏览器环境加载 dist 产物执行功能测试
const elements = new Map();
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
  };
  el.classList = {
    add: (c) => el._classes.add(c),
    remove: (c) => el._classes.delete(c),
    contains: (c) => el._classes.has(c),
    toggle: (c, force) => {
      const on = force === undefined ? !el._classes.has(c) : force;
      if (on) el._classes.add(c); else el._classes.delete(c);
      return on;
    }
  };
  Object.defineProperty(el, 'textContent', {
    get() { return this._text; },
    set(v) { this._text = String(v); }
  });
  Object.defineProperty(el, 'innerHTML', {
    get() { return this._html; },
    set(v) { this._html = String(v); }
  });
  el.addEventListener = (evt, fn) => {
    if (!el._handlers[evt]) el._handlers[evt] = [];
    el._handlers[evt].push(fn);
  };
  el.querySelector = (sel) => {
    if (sel.startsWith('#')) return elements.get(sel.slice(1)) || null;
    return null;
  };
  const dummyCtx = {
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    fill() {},
    stroke() {},
    fillRect() {},
    strokeRect() {},
    clearRect() {},
    drawImage() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    createLinearGradient: () => ({ addColorStop() {} }),
    setLineDash() {},
    measureText: () => ({ width: 40 }),
    fillText() {}
  };
  el.getContext = () => dummyCtx;
  el.width = 960;
  el.height = 540;
  elements.set(id, el);
  return el;
}

const mockDoc = {
  getElementById: (id) => elements.get(id) || makeEl(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return mockDoc.getElementById(sel.slice(1));
    return makeEl('mock-' + Math.random().toString(36).slice(2));
  },
  querySelectorAll: (sel) => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: (tag) => makeEl('tag-' + Math.random().toString(36).slice(2))
};

class MockImage {
  constructor() {
    this._src = '';
    this.onload = null;
    this.complete = true;
    this.naturalWidth = 256;
    this.naturalHeight = 256;
  }
  set src(v) {
    this._src = v;
    if (this.onload) setTimeout(this.onload, 1);
  }
  get src() {
    return this._src;
  }
}

globalThis.MutationObserver = class {
  observe() {}
  disconnect() {}
};
globalThis.window = { addEventListener() {} };
globalThis.document = mockDoc;
globalThis.Image = MockImage;
globalThis.localStorage = {
  _store: new Map(),
  getItem(k) { return this._store.get(k) || null; },
  setItem(k, v) { this._store.set(k, String(v)); },
  removeItem(k) { this._store.delete(k); },
  clear() { this._store.clear(); }
};
globalThis.location = { reload() {} };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
globalThis.performance = { now: () => Date.now() };
globalThis.AudioContext = class {
  createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
  createGain() { return { connect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
  get destination() { return {}; }
  get currentTime() { return 0; }
};

// 预先建立 DOM 节点
['boss-hud-bar', 'boss-hud-title', 'boss-hud-phase', 'boss-hp-fill', 'boss-hp-lag', 'boss-hp-val', 'hud', 'hp-bar', 'game-hud', 'game-container'].forEach(makeEl);

const distAssets = path.resolve('dist/assets');
const jsFiles = fs.readdirSync(distAssets).filter(f => f.endsWith('.js'));
if (jsFiles.length === 0) {
  console.error('FAIL  未找到 dist/assets/*.js，请先执行 npm run build');
  process.exit(1);
}
const bundleUrl = pathToFileURL(path.join(distAssets, jsFiles[0])).href;
await import(bundleUrl);

const gc = globalThis.window.__gameControls || globalThis.__gameControls;
assert(gc && gc.game, '全局游戏控制句柄 __gameControls 挂载成功');

// 4. 验证白骨尸皇 BOSS 配置
const corpseCfg = gc.BOSS_CONFIGS.corpse_emperor;
assert(corpseCfg, 'BOSS_CONFIGS.corpse_emperor 配置存在');
assert(corpseCfg.phases && corpseCfg.phases.length === 2, '白骨尸皇具备完整双阶段设计');
assert(corpseCfg.phases[0].armCount === 2, '一阶段配置 2 只巨型骨臂');
assert(corpseCfg.phases[0].defenseRatio === 0.10, '一阶段未击杀骨臂时神颅享有 90% 巨量减伤');
assert(corpseCfg.phases[0].vulnerabilityRatio === 1.25, '一阶段击杀骨臂后神颅处于 125% 易伤状态');
assert(corpseCfg.phases[1].armCount === 6, '二阶段配置 6 只巨型骨臂');

// 5. 验证贴图提取接口
const textures = gc.getCorpseEmperorTextures();
assert(textures, 'getCorpseEmperorTextures 接口有效');
assert(textures.skullSheetImg && textures.skullSheetImg.src.includes('boss_corpse_skull_sheet.png'), '白骨神颅贴图正确引用相对路径');
assert(textures.triSkullSheetImg && textures.triSkullSheetImg.src.includes('boss_corpse_tri_skull_sheet.png'), '三首融合狂骨贴图正确引用相对路径');
assert(textures.armSheetImg && textures.armSheetImg.src.includes('boss_corpse_arm_sheet.png'), '巨型骨臂贴图正确引用相对路径');
assert(textures.knuckleImg && textures.knuckleImg.src.includes('effect_corpse_knuckle.png'), '指节弹幕贴图正确引用相对路径');
assert(textures.ghostFireImg && textures.ghostFireImg.src.includes('effect_corpse_ghost_fire.png'), '幽冥鬼火贴图正确引用相对路径');
assert(textures.poisonPoolImg && textures.poisonPoolImg.src.includes('effect_corpse_poison_pool.png'), '幽冥毒沼贴图正确引用相对路径');

// 6. 验证一阶段生成与多部位血条、防御结界机制
gc.game.player = { x: 300, y: 500, r: 16, invuln: 0 };
gc.game.maxHp = 100;
gc.game.hp = 100;
gc.game.enemies = [];
gc.game.bossProjectiles = [];
gc.game.bossAoEs = [];

const boss = gc.spawnBoss(corpseCfg);
assert(boss && boss.id === 'corpse_emperor', '白骨尸皇生成成功');
assert(boss.phaseIndex === 0, '初始处于第 1 阶段（幽冥白骨神颅）');
assert(boss.arms && boss.arms.length === 2, '一阶段成功生成 2 只白骨手臂');

// 验证骨臂在 game.enemies 中独立注册
const armEnemies = gc.game.enemies.filter(e => e.isBossPart);
assert(armEnemies.length === 2, '2 只骨臂已独立注册为 targetable 敌怪实体供武器索敌');
assert(armEnemies[0].hp > 0 && armEnemies[1].hp > 0, '双臂拥有独立血条');

// 验证头部 90% 减伤防御结界
const initialHeadHp = boss.hp;
gc.damageBoss(100);
const dmgDealtWithArms = initialHeadHp - boss.hp;
assert(dmgDealtWithArms === 10, `双臂存活时神颅受九幽骨盾保护，受到伤害仅 10% (理论: 10, 实际: ${dmgDealtWithArms})`);

// 验证骨臂受击与独立击杀
const arm0 = boss.arms[0];
const initialArmHp = arm0.hp;
gc.damageEnemy(arm0.enemyRef, 10);
assert(arm0.hp === initialArmHp - 10, '骨臂受击正常扣除独立血量');

// 击杀双臂
gc.onCorpseEmperorArmDestroyed(boss.arms[0]);
gc.onCorpseEmperorArmDestroyed(boss.arms[1]);
assert(boss.arms.filter(a => a.hp > 0 && !a.destroyed).length === 0, '双臂全部被击破');

// 验证双臂毁灭后骨盾破碎，神颅防御大幅衰减（125% 易伤）
const hpBeforeVulnerableHit = boss.hp;
gc.damageBoss(40);
const dmgDealtVulnerable = hpBeforeVulnerableHit - boss.hp;
assert(dmgDealtVulnerable === 50, `双臂破碎后九幽骨盾瓦解，神颅承受 125% 易伤打击 (理论: 50, 实际: ${dmgDealtVulnerable})`);

// 7. 验证一阶段神颅击杀后转入二阶段
boss.hp = 0;
gc.damageBoss(1);
assert(boss.phaseIndex === 1, '神颅血量归零后突破进入二阶段');
assert(boss.r === 52, '二阶段体型扩大为三首融合狂骨');
assert(boss.arms && boss.arms.length === 6, '二阶段成功生成 6 只悬浮骨臂');

const armRoles = boss.arms.map(a => a.type);
const knuckleArms = armRoles.filter(t => t === 'knuckle').length;
const slamArms = armRoles.filter(t => t === 'slam').length;
const ghostFireArms = armRoles.filter(t => t === 'ghost_fire').length;
assert(knuckleArms === 2, `二阶段包含 2 只指节弹幕骨臂 (实际: ${knuckleArms})`);
assert(slamArms === 2, `二阶段包含 2 只飞出拍击骨臂 (实际: ${slamArms})`);
assert(ghostFireArms === 2, `二阶段包含 2 只追踪鬼火骨臂 (实际: ${ghostFireArms})`);

// 8. 验证弹幕发射机制
gc.game.bossProjectiles = [];
// 指节弹幕测试：每只手臂发射5枚，双臂共10枚
gc.fireCorpseKnuckleBarrage(boss.arms[0]);
assert(gc.game.bossProjectiles.length === 5, '指节骨臂默认单次发射 5 枚骷髅指节弹幕');
assert(gc.game.bossProjectiles[0].type === 'corpse_knuckle', '弹幕类型为 corpse_knuckle');

// 双臂齐射测试
gc.game.bossProjectiles = [];
gc.fireCorpseKnuckleBarrage(boss.arms[0], 5);
gc.fireCorpseKnuckleBarrage(boss.arms[1], 5);
assert(gc.game.bossProjectiles.length === 10, '双臂各发射 5 枚，合计 10 枚骷髅指节弹幕');

// 一阶段骷髅神颅主动反击技能测试
gc.game.bossProjectiles = [];
gc.fireCorpseSkullBreath(boss);
assert(gc.game.bossProjectiles.length === 3, '一阶段神颅释放幽冥吐息喷射 3 枚魂火扇形弹');
assert(gc.game.bossProjectiles.every(p => p.type === 'corpse_ghost_fire'), '幽冥吐息弹幕类型为 corpse_ghost_fire');

gc.game.bossProjectiles = [];
gc.fireCorpseSkullSpikeBurst(boss);
assert(gc.game.bossProjectiles.length === 8, '一阶段神颅断臂狂怒爆发 8 荒骨刺弹幕');
assert(gc.game.bossProjectiles.every(p => p.type === 'corpse_knuckle'), '骨刺弹幕类型为 corpse_knuckle');

// 追踪鬼火测试
gc.game.bossProjectiles = [];
gc.fireCorpseGhostFire(boss.arms[4]);
assert(gc.game.bossProjectiles.length === 1, '幽火骨臂成功发射追踪型鬼火');
assert(gc.game.bossProjectiles[0].type === 'corpse_ghost_fire', '弹幕类型为 corpse_ghost_fire');
assert(gc.game.bossProjectiles[0].homing === true, '鬼火具备向玩家索敌追踪特性');

// 9. 验证鬼火临近引爆并在地面残留持续伤害毒沼
gc.game.bossAoEs = [];
const ghostFireProj = gc.game.bossProjectiles[0];
ghostFireProj.x = gc.game.player.x + 20; // 贴近玩家
ghostFireProj.y = gc.game.player.y + 20;
gc.updateBossProjectiles(0.016);
assert(gc.game.bossAoEs.some(a => a.isHazardPool), '鬼火靠近玩家贴身轰爆，在地面留下持续伤害的幽冥毒沼 (hazard pool)');

// 10. 验证二阶段击杀全部 6 只骨臂后三头骷髅狂暴绝境机制
for (const arm of boss.arms) {
  gc.onCorpseEmperorArmDestroyed(arm);
}
assert(boss.isBerserk === true, '六臂全部毁灭后三首融合巨颅彻底暴走进入【狂暴绝境】(isBerserk = true)');

// 狂暴技能 1：周期发射九枚巨型鬼火 (三首各喷吐3枚，合计9枚)
gc.game.bossProjectiles = [];
gc.fireTriSkullGiantGhostFire(boss);
assert(gc.game.bossProjectiles.length === 9, '三首融合巨颅一次喷吐 9 枚巨型鬼火弹幕 (三首各吐3枚)');
assert(gc.game.bossProjectiles.every(p => p.type === 'corpse_giant_ghost_fire' && p.r >= 18), '9 枚弹幕皆为大型鬼火弹');

// 狂暴技能 2：周期冲撞玩家造成接触伤害
boss.state = 'rushing';
boss.rushDir = { x: 1, y: 0 };
boss.x = gc.game.player.x;
boss.y = gc.game.player.y;
gc.game.player.invuln = 0; // 重置无敌帧以测试碰撞接触伤害
const playerHpBeforeRam = gc.game.hp;
gc.updateCorpseEmperor(boss, 0.016);
assert(gc.game.hp < playerHpBeforeRam, '冲撞命中玩家造成重击接触伤害');

// 11. 验证击败三头骷髅后 boss 关结束
boss.invuln = false; // 结束转阶段霸体
boss.state = 'idle';
boss.hp = 0;
gc.damageBoss(10);
assert(boss.defeated === true, '三首巨颅击灭后领主伏诛 (defeated = true)');
assert(gc.game.enemies.filter(e => e.isBoss || e.isBossPart).length === 0, '全场领主本体与骨臂部位已全部清理移除');

console.log('\n====================================================');
console.log(`测试结果统计: ${passCount} 通过, ${failCount} 失败`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 幽冥白骨尸皇全机制自动化测试全部通过！\n');
}
