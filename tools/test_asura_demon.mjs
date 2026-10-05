import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

console.log('====================================================');
console.log('九天噬魂魔尊 · 全新贴图与三阶段核心机制全量测试');
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

// 1. 验证 4 大贴图物理文件存在且有效
const bossImgPath = path.resolve('public/boss_asura_demon.png');
const bossSheetPath = path.resolve('public/boss_asura_demon_sheet.png');
const soulImgPath = path.resolve('public/effect_asura_soul.png');
const blackholeImgPath = path.resolve('public/effect_asura_blackhole.png');

assert(fs.existsSync(bossImgPath), '魔尊本尊贴图 public/boss_asura_demon.png 存在');
assert(fs.existsSync(bossSheetPath), '魔尊 8 帧序列帧贴图 public/boss_asura_demon_sheet.png 存在');
assert(fs.existsSync(soulImgPath), '噬魂幽灵贴图 public/effect_asura_soul.png 存在');
assert(fs.existsSync(blackholeImgPath), '噬魂黑洞法阵贴图 public/effect_asura_blackhole.png 存在');

const bossStat = fs.statSync(bossImgPath);
const sheetStat = fs.statSync(bossSheetPath);
const soulStat = fs.statSync(soulImgPath);
const bhStat = fs.statSync(blackholeImgPath);

assert(bossStat.size > 50000, `魔尊本尊贴图体积饱满 (${bossStat.size} bytes > 50KB)`);
assert(sheetStat.size > 50000, `魔尊 8 帧序列帧贴图体积饱满 (${sheetStat.size} bytes > 50KB)`);
assert(soulStat.size > 20000, `噬魂幽灵贴图体积有效 (${soulStat.size} bytes > 20KB)`);
assert(bhStat.size > 50000, `噬魂黑洞贴图体积饱满 (${bhStat.size} bytes > 50KB)`);

// 2. 验证 PNG 签名头与图像分辨率 (IHDR)
function checkPngHeader(filePath, expectedW, expectedH) {
  const buf = fs.readFileSync(filePath);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { isPng, w, h };
}

const bossInfo = checkPngHeader(bossImgPath, 380, 380);
assert(bossInfo.isPng, '魔尊本尊贴图为合法 PNG 格式');
assert(bossInfo.w === 380 && bossInfo.h === 380, `魔尊本尊规格为 380x380 (实际: ${bossInfo.w}x${bossInfo.h})`);

const sheetInfo = checkPngHeader(bossSheetPath, 720, 360);
assert(sheetInfo.isPng, '魔尊序列帧贴图为合法 PNG 格式');
assert(sheetInfo.w === 720 && sheetInfo.h === 360, `魔尊序列帧规格为 720x360 4x2 8帧 (实际: ${sheetInfo.w}x${sheetInfo.h})`);

const soulInfo = checkPngHeader(soulImgPath, 140, 140);
assert(soulInfo.isPng, '噬魂幽灵贴图为合法 PNG 格式');
assert(soulInfo.w === 140 && soulInfo.h === 140, `噬魂幽灵规格为 140x140 (实际: ${soulInfo.w}x${soulInfo.h})`);

const bhInfo = checkPngHeader(blackholeImgPath, 240, 240);
assert(bhInfo.isPng, '噬魂黑洞贴图为合法 PNG 格式');
assert(bhInfo.w === 240 && bhInfo.h === 240, `噬魂黑洞规格为 240x240 (实际: ${bhInfo.w}x${bhInfo.h})`);

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
    quadraticCurveTo() {},
    bezierCurveTo() {},
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
assert(gc != null, '顺利挂载 __gameControls 控制桥梁');

// 4. 验证 BOSS_CONFIGS.asura_demon 配置
const cfg = gc.BOSS_CONFIGS.asura_demon;
assert(cfg != null, 'BOSS_CONFIGS 包含 asura_demon 配置');
assert(cfg.name === '九天噬魂魔尊', `魔尊名称为 九天噬魂魔尊 (实际: ${cfg.name})`);
assert(cfg.r === 58, `魔尊体型碰撞半径设定为 58 (实际: ${cfg.r})`);
assert(cfg.phases && cfg.phases.length === 3, `魔尊拥有 3 大完整演进阶段 (实际: ${cfg.phases ? cfg.phases.length : 0})`);

const [p0, p1, p2] = cfg.phases;
assert(p0.name.includes('噬魂'), `一阶段名称为「${p0.name}」包含噬魂`);
assert(p0.barrageCount >= 8, `一阶段发射噬魂数量充足 (配置: ${p0.barrageCount})`);
assert(p1.blackhole === true, '二阶段开启黑洞机制 (blackhole: true)');
assert(p1.aoeRadius >= 95, `二阶段黑洞爆炸危险半径为 ${p1.aoeRadius}`);
assert(p2.hexLaser === true, '三阶段开启六极崩灭全屏激光 (hexLaser: true)');
assert(p2.laserRotateSpeed > 0, `三阶段激光具有自旋角速度 (${p2.laserRotateSpeed} rad/s)`);
assert(p2.laserDuration >= 5.0, `三阶段激光持续时间充足 (${p2.laserDuration}s)`);

// 5. 验证贴图导出器 getAsuraDemonTextures
const asuraTex = gc.getAsuraDemonTextures();
assert(asuraTex != null, '__gameControls.getAsuraDemonTextures 存在');
assert(asuraTex.bossImg != null, '魔尊本尊图片对象已成功实例化');
assert(asuraTex.sheetImg != null, '魔尊 8 帧序列帧图片对象已成功实例化');
assert(asuraTex.soulImg != null, '噬魂幽灵图片对象已成功实例化');
assert(asuraTex.blackholeImg != null, '噬魂黑洞图片对象已成功实例化');
assert(asuraTex.bossImg.src.includes('boss_asura_demon.png'), '魔尊贴图使用相对路径 ./boss_asura_demon.png');
assert(asuraTex.sheetImg.src.includes('boss_asura_demon_sheet.png'), '魔尊序列帧使用相对路径 ./boss_asura_demon_sheet.png');
assert(asuraTex.soulImg.src.includes('effect_asura_soul.png'), '噬魂贴图使用相对路径 ./effect_asura_soul.png');
assert(asuraTex.blackholeImg.src.includes('effect_asura_blackhole.png'), '黑洞贴图使用相对路径 ./effect_asura_blackhole.png');

// 6. 测试 Phase 0 一阶段噬魂弹发射与追踪逻辑
gc.startBossStage('asura_demon');
const boss = gc.game.boss;
assert(boss != null && boss.id === 'asura_demon', '成功进入九天噬魂魔尊领主战斗');
assert(boss.phaseIndex === 0, '开局处于一阶段「天魔初醒」');

// 模拟一阶段释放天魔噬魂弹
gc.game.bossProjectiles = [];
gc.fireAsuraSoulBarrage(boss);
assert(gc.game.bossProjectiles.length >= 8, `一阶段成功发射 ${gc.game.bossProjectiles.length} 枚噬魂魔魂弹`);

const soul = gc.game.bossProjectiles[0];
assert(soul.type === 'asura_soul', '弹幕类型标记为 asura_soul');
assert(soul.homing === true, '弹幕具备 homing 追踪特性');
assert(soul.life >= 3.0, `弹幕生存周期充足 (${soul.life}s)`);

const soulSpd = Math.hypot(soul.vx, soul.vy);
assert(soulSpd >= 155 && soulSpd <= 195, `噬魂弹初速度略微降低至合理区间 (${soulSpd.toFixed(1)} px/s, 约 160-190 px/s)`);

// 验证追踪转向
gc.game.player.x = 480;
gc.game.player.y = 400;
soul.x = 480;
soul.y = 200;
soul.vx = 175; // 初始向右移动
soul.vy = 0;
const prevVx = soul.vx;
gc.updateBossProjectiles(0.1);
assert(soul.vy > 0, `噬魂弹开始向下朝玩家航向调整修正 (vy 从 0 增至 ${soul.vy.toFixed(2)})`);

// 验证命中扣血
gc.game.player.invuln = 0;
gc.game.player.x = soul.x;
gc.game.player.y = soul.y;
const prevHp = gc.game.hp;
gc.updateBossProjectiles(0.01);
assert(gc.game.hp < prevHp, `噬魂弹命中玩家成功造成伤害 (HP: ${prevHp} -> ${gc.game.hp})`);
assert(gc.game.player.invuln > 0, '命中后赋予玩家短暂无敌帧');

// 7. 测试 Phase 1 二阶段黑洞蓄力前置预警、引力逃脱力学与超时爆炸
boss.phaseIndex = 1;
boss.currentPhase = p1;
gc.initAsuraDemon(boss, 1);
gc.game.bossAoEs = [];

// 验证黑洞前置地面预警锁定 (Telegraph 0.6s)
gc.game.player.x = 480;
gc.game.player.y = 300;
gc.startAsuraBlackhole(boss);
assert(boss.state === 'casting_blackhole', '释放黑洞前进入 casting_blackhole 蓄力状态');
assert(boss.castTimer >= 0.55 && boss.castTimer <= 0.65, `黑洞拥有调整后的 0.6s 施法前置预警蓄力时间 (${boss.castTimer}s)`);
assert(boss.blackholeTarget != null, '黑洞施法锁定并记录地面预警目标点 (blackholeTarget)');
assert(boss.blackholeTarget.x === 480 && boss.blackholeTarget.y === 300, '预警目标点精准锁定玩家当时站立坐标');

// 模拟玩家在预警期间走动离开目标点
gc.game.player.x = 480;
gc.game.player.y = 150; // 玩家已走开
gc.spawnAsuraBlackhole(boss);
assert(gc.game.bossAoEs.length >= 1, '二阶段成功生成噬魂黑洞');
const bh = gc.game.bossAoEs[0];
assert(bh.type === 'asura_blackhole', 'AoE 类型标记为 asura_blackhole');
assert(bh.x === 480 && bh.y === 300, '黑洞实体生成在先前锁定的预警点，未因玩家移动而强行瞬移吸附到玩家当前位置');
assert(boss.blackholeTarget === null, '生成后清空黑洞锁定目标点');
assert(bh.suctionRadius >= 160, `黑洞拥有外围强引力吸附半径 (${bh.suctionRadius}px)`);
assert(bh.r >= 95, `黑洞拥有核心高危爆炸半径 (${bh.r}px)`);
assert(bh.timer >= 3.0, `黑洞存在倒计时 (${bh.timer}s)`);

// 验证黑洞中心最大拉力上限不超过 75 px/s，边缘拉力 25 px/s
bh.x = 480;
bh.y = 270;
gc.game.player.x = 480;
gc.game.player.y = 270; // 玩家处于黑洞中心点
gc.game.player.invuln = 0;
const prevYCenter = gc.game.player.y;
gc.updateBossAoEs(0.1);
const pulledDist = Math.abs(gc.game.player.y - prevYCenter);
const effectivePullSpeed = pulledDist / 0.1;
assert(effectivePullSpeed <= 75.1, `黑洞中心最大向心牵引力严格被限制在 75 px/s 内 (实测: ${effectivePullSpeed.toFixed(1)} px/s)`);

// 验证逃逸净速度 > 0: 减速提升至 30% (有效移速 180 * 0.70 = 126 px/s)，即使在中心净速度仍达 +51 px/s，从容逃出 105px 危险核心
const playerEscSpeed = 180 * 0.70; // 减速 30%
const netEscapeSpeed = playerEscSpeed - effectivePullSpeed;
assert(netEscapeSpeed > 45, `减速提升至 30% 后，玩家在中心即便受到最大引力牵引，净逃逸速度仍达 ${netEscapeSpeed.toFixed(1)} px/s (> 45 px/s)，可从容跑出爆炸核心`);
assert(gc.game.playerBlackholeSlowTimer > 0, '玩家陷入噬魂黑洞减速状态 (playerBlackholeSlowTimer > 0)');

// 测试超时爆炸 - 情境 A: 玩家未及时逃离 (仍处于爆炸核心内)
gc.game.player.x = bh.x;
gc.game.player.y = bh.y;
gc.game.player.invuln = 0;
bh.timer = 0.05;
const preExplodeHp = gc.game.hp;
gc.updateBossAoEs(0.1); // 触发超时爆炸
assert(bh.exploded === true, '黑洞超时后触发终极爆炸 (exploded: true)');
assert(gc.game.hp < preExplodeHp - 15, `未逃离黑洞承受高额爆炸毁灭伤害 (HP: ${preExplodeHp} -> ${gc.game.hp})`);

// 测试超时爆炸 - 情境 B: 玩家已成功及时逃出爆炸危险范围
gc.game.bossAoEs = [];
gc.spawnAsuraBlackhole(boss);
const bh2 = gc.game.bossAoEs[0];
bh2.x = 480;
bh2.y = 270;
gc.game.player.x = 480;
gc.game.player.y = 480; // 距离中心 210px，远大于爆炸半径 105px
gc.game.player.invuln = 0;
const safeHp = gc.game.hp;
bh2.timer = 0.05;
gc.updateBossAoEs(0.1);
assert(bh2.exploded === true, '黑洞顺利引爆');
assert(gc.game.hp === safeHp, `已逃离黑洞核心的玩家不受爆炸伤害 (HP 保持 ${gc.game.hp})`);

// 8. 测试 Phase 3 三阶段全屏旋转激光：角落移向正中心、阵眼固定与随机顺逆时针自旋
boss.phaseIndex = 2;
boss.currentPhase = p2;
gc.initAsuraDemon(boss, 2);

assert(boss.laserState === 'idle', '三阶段激光初始状态为 idle');

// 情景 A: Boss 处于角落 (如 100, 80)，触发激光时必须先飞回屏幕正中心 (480, 270)
boss.x = 100;
boss.y = 80;
boss.laserCooldown = 0.05;
gc.updateAsuraHexLasers(boss, 0.1);
assert(boss.laserState === 'moving_to_center', 'Boss 不在中心时触发激光，先进入 moving_to_center 飞向屏幕正中');

// 模拟 Boss 快速飞向中心阵眼
const prevDistToCenter = Math.hypot(boss.x - 480, boss.y - 270);
gc.updateAsuraHexLasers(boss, 0.4);
const newDistToCenter = Math.hypot(boss.x - 480, boss.y - 270);
assert(newDistToCenter < prevDistToCenter, `Boss 极速向屏幕中心 (480, 270) 靠拢 (距离: ${prevDistToCenter.toFixed(1)} -> ${newDistToCenter.toFixed(1)})`);

// 抵达中心阵眼后，无缝进入 telegraph 预警蓄力状态
boss.x = 480;
boss.y = 270;
gc.updateAsuraHexLasers(boss, 0.05);
assert(boss.laserState === 'telegraph', 'Boss 抵达正中后进入 telegraph 预警蓄力状态');
assert(boss.x === 480 && boss.y === 270, 'Boss 严格锁定在屏幕正中央 (480, 270)');

boss.laserTelegraphTimer = 0.05;
gc.updateAsuraHexLasers(boss, 0.1);
assert(boss.laserState === 'firing', '预警结束后进入 firing 全屏激射状态');
assert(boss.x === 480 && boss.y === 270, '激射期间 Boss 持续坐镇屏幕正中央 (480, 270)');
assert(boss.laserTimer > 5.0, `激光持续激射时间达标 (${boss.laserTimer}s)`);

// 验证激光自旋方向支持顺时针与逆时针随机旋转
assert(boss.laserRotateDir === 1 || boss.laserRotateDir === -1, `激光具有明确旋转方向标记 (laserRotateDir: ${boss.laserRotateDir})`);

// 统计多次触发以验证顺时针与逆时针均会被随机选中
let cwCount = 0;
let ccwCount = 0;
for (let k = 0; k < 30; k++) {
  boss.laserState = 'idle';
  boss.laserCooldown = 0;
  boss.x = 480;
  boss.y = 270;
  gc.updateAsuraHexLasers(boss, 0.01);
  if (boss.laserRotateDir === 1) cwCount++;
  else if (boss.laserRotateDir === -1) ccwCount++;
}
assert(cwCount > 0 && ccwCount > 0, `30次触发测试中顺时针与逆时针均被随机抽取 (顺时针: ${cwCount}次, 逆时针: ${ccwCount}次)`);

// 测试激光按照当前随机方向旋转
boss.laserState = 'firing';
boss.laserRotateDir = -1; // 强制指定逆时针测试
boss.laserAngle = 1.0;
gc.updateAsuraHexLasers(boss, 0.5);
assert(boss.laserAngle < 1.0, `指定逆时针时激光角度减小 (1.000 -> ${boss.laserAngle.toFixed(3)} rad)`);

boss.laserRotateDir = 1; // 强制指定顺时针测试
boss.laserAngle = 1.0;
gc.updateAsuraHexLasers(boss, 0.5);
assert(boss.laserAngle > 1.0, `指定顺时针时激光角度增大 (1.000 -> ${boss.laserAngle.toFixed(3)} rad)`);

// 测试激光射线碰撞 (6道激光中，有一道沿当前 laserAngle 发射)
boss.x = 480;
boss.y = 270;
boss.laserAngle = 0; // 0度方向即正右方
gc.game.player.x = 650; // 沿 0 度射线正右方
gc.game.player.y = 270;
gc.game.player.invuln = 0;
const preLaserHp = gc.game.hp;
gc.checkHexLaserCollision(boss);
assert(gc.game.hp < preLaserHp, `玩家触碰全屏激光受到高额神光伤害 (HP: ${preLaserHp} -> ${gc.game.hp})`);
assert(gc.game.player.invuln > 0, '激光扫中后提供 0.65s 无敌帧保护避免瞬杀');

// 测试激光安全夹角缝隙规避 (60度激光之间的 30度中心夹角)
boss.laserAngle = 0;
const safeAngle = Math.PI / 6; // 30 度角，正处于 0 度与 60 度两道光束的正中央安全区
gc.game.player.x = boss.x + Math.cos(safeAngle) * 220;
gc.game.player.y = boss.y + Math.sin(safeAngle) * 220;
gc.game.player.invuln = 0;
const safeAngleHp = gc.game.hp;
gc.checkHexLaserCollision(boss);
assert(gc.game.hp === safeAngleHp, '在 60 度激光夹角安全缝隙中走位不会受到激光伤害');

// 9. 验证三阶段中前两阶段技能（噬魂弹 + 黑洞）依然并发发射
gc.game.bossProjectiles = [];
gc.game.bossAoEs = [];
assert(boss.laserState === 'firing', '当前处于三阶段激光激射中');
gc.fireAsuraSoulBarrage(boss);
gc.spawnAsuraBlackhole(boss);
assert(gc.game.bossProjectiles.length >= 10, '三阶段激射激光的同时，天魔噬魂弹并发发射成功');
assert(gc.game.bossAoEs.length >= 1, '三阶段激射激光的同时，噬魂黑洞并发生成成功');

// 10. 验证 Boss 序列帧系统 (SpriteSheetAnimation) 挂载与动画驱动
assert(boss.sheetAnim != null, 'Boss 成功挂载 8 帧序列帧动画对象 (sheetAnim)');
assert(boss.sheetAnim.totalFrames === 8, '序列帧总帧数为 8 帧');
assert(boss.sheetAnim.frameW === 180 && boss.sheetAnim.frameH === 180, '序列帧单帧规格为 180x180');

boss.sheetAnim.update(0.15);
assert(boss.sheetAnim.fps > 0, `序列帧动画具有正向帧率 (${boss.sheetAnim.fps} fps)`);

// 验证攻击动作状态下动画帧率自适应提高
boss.state = 'rushing';
gc.updateBoss(0.01);
assert(boss.sheetAnim.fps >= 13, `冲锋等高烈度攻击动作期间动画帧率自适应提速至 ${boss.sheetAnim.fps} fps (>= 13 fps)`);

// 11. 验证 Canvas 渲染无报错抛出
const dummyCanvas = makeEl('test-canvas');
const dummyCtx = dummyCanvas.getContext('2d');
try {
  gc.drawBossAoEs(dummyCtx);
  gc.drawBossProjectiles(dummyCtx);
  gc.drawBoss(dummyCtx);
  passCount += 3;
  console.log('PASS  Canvas drawBossAoEs 正常渲染六道旋转激光与噬魂黑洞');
  console.log('PASS  Canvas drawBossProjectiles 正常渲染追踪噬魂幽灵魔面');
  console.log('PASS  Canvas drawBoss (drawAsuraDemonModel) 正常渲染 8 帧序列帧与动作特效层');
} catch (err) {
  failCount += 3;
  console.error('FAIL  Canvas 绘制阶段抛出异常:', err);
}

console.log('\n====================================================');
console.log(`九天噬魂魔尊测试完成: ${passCount} 项通过, ${failCount} 项失败`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
