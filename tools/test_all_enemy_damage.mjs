import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// 1. Setup mock browser environment
const elements = new Map();
function makeEl(id) {
  const el = {
    id, style: {}, dataset: {}, onclick: null, _classes: new Set(),
    _text: '', _html: '', _handlers: {}, _children: [],
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
  Object.defineProperty(el, 'textContent', { get() { return this._text; }, set(v) { this._text = String(v); } });
  Object.defineProperty(el, 'innerHTML', { get() { return this._html; }, set(v) { this._html = String(v); } });
  el.addEventListener = (evt, fn) => { if (!el._handlers[evt]) el._handlers[evt] = []; el._handlers[evt].push(fn); };
  el.querySelector = (sel) => sel.startsWith('#') ? elements.get(sel.slice(1)) || null : null;
  const dummyCtx = {
    save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
    quadraticCurveTo() {}, bezierCurveTo() {}, arc() {}, fill() {},
    stroke() {}, fillRect() {}, strokeRect() {}, clearRect() {},
    drawImage() {}, createRadialGradient: () => ({ addColorStop() {} }),
    createLinearGradient: () => ({ addColorStop() {} }), setLineDash() {},
    measureText: () => ({ width: 40 }), fillText() {}
  };
  el.getContext = () => dummyCtx;
  el.width = 960; el.height = 540;
  elements.set(id, el);
  return el;
}

const mockDoc = {
  getElementById: (id) => elements.get(id) || makeEl(id),
  querySelector: (sel) => sel.startsWith('#') ? mockDoc.getElementById(sel.slice(1)) : makeEl('mock-' + Math.random().toString(36).slice(2)),
  querySelectorAll: (sel) => [], addEventListener: () => {}, removeEventListener: () => {},
  createElement: (tag) => makeEl('tag-' + Math.random().toString(36).slice(2))
};

class MockImage {
  constructor() { this._src = ''; this.onload = null; this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; }
  set src(v) { this._src = v; if (this.onload) setTimeout(this.onload, 1); }
  get src() { return this._src; }
}

globalThis.MutationObserver = class { observe() {} disconnect() {} };
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

['boss-hud-bar', 'boss-hud-title', 'boss-hud-phase', 'boss-hp-fill', 'boss-hp-lag', 'boss-hp-val', 'hud', 'hp-bar', 'game-hud', 'game-container'].forEach(makeEl);

const distAssets = path.resolve('dist/assets');
const jsFiles = fs.readdirSync(distAssets).filter(f => f.endsWith('.js'));
const bundleUrl = pathToFileURL(path.join(distAssets, jsFiles[0])).href;
await import(bundleUrl);

const gc = globalThis.window.__gameControls || globalThis.__gameControls;
const { game } = gc;

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

function resetPlayer() {
  game.player = {
    x: 480,
    y: 270,
    r: 13,
    invuln: 0,
    attackTimer: 0,
    attackAngle: 0,
    charId: 'sword',
    weaponType: 'sword',
    charName: '凌虚子'
  };
  game.hp = 100;
  game.maxHp = 100;
  game.baseHp = 100;
  game.bonusHp = 0;
  game.testGodMode = false;
  game.isTestLevel = false;
  game.playerBurnTimer = 0;
  game.playerChillTimer = 0;
  game.playerFreezeTimer = 0;
  game.playerBlackholeSlowTimer = 0;
  game.playerProjectileGrace = 0;
  game.bossProjectiles = [];
  game.bossAoEs = [];
  game.enemies = [];
}

console.log('--- 1. 测试精英怪弹幕伤害 ---');

// 1.1 精英赤炼熔岩巨兕
resetPlayer();
const eliteFire = { x: 480, y: 150, r: 28, damage: 15, kind: 'elite_brute' };
gc.fireMagmaBarrage(eliteFire);
assert(game.bossProjectiles.length === 3, `赤炼巨兕发射 3 枚火弹 (实际: ${game.bossProjectiles.length})`);
// 让第一枚火弹撞击玩家，其余两枚远离
game.bossProjectiles[0].x = game.player.x;
game.bossProjectiles[0].y = game.player.y;
game.bossProjectiles[1].x = 100;
game.bossProjectiles[2].x = 800;
let hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `赤炼火弹命中造成伤害 (HP: ${hpBefore} -> ${game.hp})`);
assert(game.playerBurnTimer > 0, `赤炼火弹命中施加地火灼烧 (burnTimer: ${game.playerBurnTimer})`);
assert(game.bossProjectiles.length === 2, `击中后该弹幕销毁 (剩余未命中弹幕: ${game.bossProjectiles.length})`);

// 1.2 精英玄霜凝晶巨兕
resetPlayer();
const eliteFrost = { x: 480, y: 150, r: 28, damage: 15, kind: 'elite_frost_brute' };
gc.fireFrostCrystalBarrage(eliteFrost);
assert(game.bossProjectiles.length === 5, `玄霜巨兕发射 5 枚冰棱晶 (实际: ${game.bossProjectiles.length})`);
game.bossProjectiles[0].x = game.player.x;
game.bossProjectiles[0].y = game.player.y;
game.bossProjectiles[1].x = 100;
game.bossProjectiles[2].x = 200;
game.bossProjectiles[3].x = 700;
game.bossProjectiles[4].x = 800;
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `冰棱晶命中造成伤害 (HP: ${hpBefore} -> ${game.hp})`);
assert(game.playerChillTimer > 0, `冰棱晶命中施加寒霜迟滞 (chillTimer: ${game.playerChillTimer})`);

console.log('--- 2. 测试五大领主弹幕伤害 ---');

// 2.1 千年赤炼蛟 fireball
resetPlayer();
gc.spawnBoss('red_dragon');
game.player.invuln = 0;
gc.executeBarrageAttack(game.boss);
assert(game.bossProjectiles.length === 5, `赤炼蛟一阶段发射 5 枚火弹 (实际: ${game.bossProjectiles.length})`);
game.bossProjectiles[0].x = game.player.x;
game.bossProjectiles[0].y = game.player.y;
for (let k = 1; k < game.bossProjectiles.length; k++) game.bossProjectiles[k].x = 50 + k * 10;
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `赤炼蛟火弹命中造成伤害 (HP: ${hpBefore} -> ${game.hp})`);

// 2.2 巡天金翅大鹏 feather
resetPlayer();
gc.spawnBoss('celestial_peng');
game.player.invuln = 0;
gc.executeBarrageAttack(game.boss);
assert(game.bossProjectiles.length === 15, `金翅大鹏发射 15 枚太乙金羽 (实际: ${game.bossProjectiles.length})`);
game.bossProjectiles[0].x = game.player.x;
game.bossProjectiles[0].y = game.player.y;
for (let k = 1; k < game.bossProjectiles.length; k++) game.bossProjectiles[k].x = 50 + k * 10;
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `金羽剑雨命中造成伤害 (HP: ${hpBefore} -> ${game.hp})`);

// 2.3 混沌太虚道祖 cosmic_blade & yin_yang_orb
resetPlayer();
gc.spawnBoss('primordial_god');
game.player.invuln = 0;
gc.executeBarrageAttack(game.boss);
assert(game.bossProjectiles.length === 16, `太虚道祖一阶段发射 16 枚星辰弹与诛仙剑 (实际: ${game.bossProjectiles.length})`);
game.bossProjectiles[0].x = game.player.x;
game.bossProjectiles[0].y = game.player.y;
for (let k = 1; k < game.bossProjectiles.length; k++) game.bossProjectiles[k].x = 50 + k * 10;
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `太虚道祖弹幕命中造成伤害 (HP: ${hpBefore} -> ${game.hp})`);

// 2.4 九天噬魂魔尊 asura_soul
resetPlayer();
gc.spawnBoss('asura_demon');
game.player.invuln = 0;
gc.fireAsuraSoulBarrage(game.boss);
assert(game.bossProjectiles.length === 10, `噬魂魔尊一阶段发射 10 枚噬魂魔魂 (实际: ${game.bossProjectiles.length})`);
game.bossProjectiles[0].x = game.player.x;
game.bossProjectiles[0].y = game.player.y;
for (let k = 1; k < game.bossProjectiles.length; k++) game.bossProjectiles[k].x = 50 + k * 10;
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `噬魂魔魂命中造成伤害 (HP: ${hpBefore} -> ${game.hp})`);
assert(hpBefore - game.hp === 9, `魔尊噬魂按 9% 精准扣除 9 点生命 (实际扣除: ${hpBefore - game.hp})`);

// 2.5 幽冥白骨尸皇 knuckles
resetPlayer();
gc.spawnBoss('corpse_emperor');
game.player.invuln = 0;
game.bossProjectiles = [{
  x: game.player.x,
  y: game.player.y,
  vx: 0,
  vy: 0,
  r: 8,
  damage: 10,
  life: 2.5,
  maxLife: 2.5,
  type: 'corpse_knuckle'
}];
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `尸皇指节弹幕命中造成伤害 (HP: ${hpBefore} -> ${game.hp})`);

// 2.6 幽冥白骨尸皇 corpse_ghost_fire
resetPlayer();
gc.spawnBoss('corpse_emperor');
game.player.invuln = 0;
game.bossProjectiles = [{
  x: game.player.x,
  y: game.player.y,
  vx: 0,
  vy: 0,
  r: 12,
  damage: 16,
  life: 3.6,
  maxLife: 3.6,
  type: 'corpse_ghost_fire'
}];
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `尸皇幽冥鬼火贴身引爆造成伤害 (HP: ${hpBefore} -> ${game.hp})`);

// 2.7 幽冥白骨尸皇 corpse_giant_ghost_fire
resetPlayer();
gc.spawnBoss('corpse_emperor');
game.player.invuln = 0;
game.bossProjectiles = [{
  x: game.player.x,
  y: game.player.y,
  vx: 0,
  vy: 0,
  r: 18,
  damage: 22,
  life: 3.6,
  maxLife: 3.6,
  type: 'corpse_giant_ghost_fire'
}];
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `尸皇九幽巨型鬼火引爆造成伤害 (HP: ${hpBefore} -> ${game.hp})`);

console.log('--- 3. 核心机制漏洞修复验证 (Fixed Mechanics Verification) ---');

// 3.1: 散弹同波次齐射命中：不再幽灵穿体，全部被吸收且触发散射伤害与特效
resetPlayer();
gc.spawnBoss('celestial_peng');
game.player.invuln = 0;
game.bossProjectiles = [];
for (let i = 0; i < 5; i++) {
  game.bossProjectiles.push({
    x: game.player.x,
    y: game.player.y,
    vx: 100,
    vy: 0,
    r: 6,
    damage: 18,
    life: 2.0,
    type: 'feather'
  });
}
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
const totalScatterDamage = hpBefore - game.hp;
assert(game.bossProjectiles.length === 0, `所有 5 枚重叠弹幕均被实体碰撞阻挡销毁，绝无幽灵穿身残留 (剩余弹幕: ${game.bossProjectiles.length})`);
assert(totalScatterDamage >= 8, `正面吃满散弹造成了合理的穿透震荡伤害 (HP减少: ${totalScatterDamage})`);

// 3.2: 角色胸口/上半身受击判定 (胶囊体垂直判定)
resetPlayer();
gc.spawnBoss('celestial_peng');
game.player.invuln = 0;
// 弹幕穿过玩家胸口 (y - 12)，离脚底距离为 12，旧逻辑由于半径较小易失判
game.bossProjectiles = [{
  x: game.player.x,
  y: game.player.y - 12,
  vx: 0,
  vy: 0,
  r: 6,
  damage: 18,
  life: 2.0,
  type: 'feather'
}];
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `弹幕命中胸膛上半身精准判定有效受击 (HP: ${hpBefore} -> ${game.hp})`);
assert(game.bossProjectiles.length === 0, `胸膛受击弹幕成功销毁`);

// 3.3: 极速弹幕掉帧防穿模 (CCD Continuous Collision Detection)
resetPlayer();
gc.spawnBoss('celestial_peng');
game.player.invuln = 0;
// 极速羽剑 (spd = 310)，帧开始在玩家前方 25 像素，帧结束跳到玩家后方 25 像素 (模拟单帧跨越 50 像素严重掉帧)
game.bossProjectiles = [{
  x: game.player.x - 25,
  y: game.player.y - 8,
  vx: 3125, // dt = 0.016 时单帧前进 50 像素
  vy: 0,
  r: 6,
  damage: 18,
  life: 2.0,
  type: 'feather'
}];
hpBefore = game.hp;
gc.updateBossProjectiles(0.016);
assert(game.hp < hpBefore, `极速弹幕线段扫掠 CCD 成功捕获并造成伤害，彻底杜绝掉帧穿模！(HP: ${hpBefore} -> ${game.hp})`);

// 3.4: 噬魂黑洞终极爆炸不再被自身 tick 吞掉
resetPlayer();
gc.spawnBoss('asura_demon');
game.player.invuln = 0.15; // 模拟刚受过黑洞腐蚀轻微撕扯
game.bossAoEs = [{
  type: 'asura_blackhole',
  x: game.player.x,
  y: game.player.y,
  r: 105,
  suctionRadius: 175,
  timer: 0.005,
  exploded: false
}];
hpBefore = game.hp;
gc.updateBossAoEs(0.016);
assert(game.hp < hpBefore, `黑洞终极爆炸伤害无视微小撕扯无敌帧，成功造成毁灭伤害 (HP: ${hpBefore} -> ${game.hp})`);
assert(hpBefore - game.hp === 38, `黑洞殉爆精确扣除 38% 最大生命 (扣除: ${hpBefore - game.hp})`);

// 3.5: 地面 AoE 火柱在持续爆发期内持续有效 (不再单帧判定即丢失)
resetPlayer();
gc.spawnBoss('red_dragon');
game.player.invuln = 0.08; // 预警结束瞬间玩家有一丝受击无敌
game.bossAoEs = [{
  bossId: 'red_dragon',
  x: game.player.x,
  y: game.player.y,
  r: 52,
  telegraphTimer: 0.005, // 0.005s 后爆发
  activeTimer: 0.55,
  damage: 25,
  color: '#e63946',
  secondaryColor: '#ffbe0b',
  exploded: false
}];
// 第 1 帧：telegraph 结束，火柱冲天，但玩家在 0.08s 无敌中
gc.updateBossAoEs(0.016);
assert(game.bossAoEs[0].exploded === true, `法阵已引爆冲天`);
// 第 5 帧：0.08s 无敌时间走完，玩家依然站在火柱中心
game.player.invuln = 0;
hpBefore = game.hp;
gc.updateBossAoEs(0.016);
assert(game.hp < hpBefore, `无敌帧结束后身处火柱中心依然精准结算爆发伤害！(HP: ${hpBefore} -> ${game.hp})`);
assert(game.bossAoEs[0].hitPlayer === true, `法阵标记 hitPlayer，避免同一火柱重复二次扣血`);

console.log(`====================================================`);
console.log(`测试完成: ${passCount} 通过, ${failCount} 失败`);
console.log(`====================================================`);
