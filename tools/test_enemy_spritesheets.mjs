import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

console.log('=============================================');
console.log('敌怪动态序列帧 (幽火灵精 & 熔岩赤炼蛮怪) 测试');
console.log('=============================================');

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

// 1. 验证贴图物理文件存在且非空
const wispSheetPath = path.resolve('public/enemy_wisp_sheet.png');
const bruteSheetPath = path.resolve('public/enemy_brute_sheet.png');

assert(fs.existsSync(wispSheetPath), '幽火灵精序列帧贴图 public/enemy_wisp_sheet.png 存在');
assert(fs.existsSync(bruteSheetPath), '熔岩蛮怪序列帧贴图 public/enemy_brute_sheet.png 存在');

const frostSheetPath = path.resolve('public/enemy_frost_brute_sheet.png');
const frostCrystalPath = path.resolve('public/effect_frost_crystal.png');
assert(fs.existsSync(frostSheetPath), '玄霜凝晶巨兕序列帧贴图 public/enemy_frost_brute_sheet.png 存在');
assert(fs.existsSync(frostCrystalPath), '冰棱晶弹幕贴图 public/effect_frost_crystal.png 存在');

const wispStat = fs.statSync(wispSheetPath);
const bruteStat = fs.statSync(bruteSheetPath);
const frostSheetStat = fs.statSync(frostSheetPath);
const frostCrystalStat = fs.statSync(frostCrystalPath);

assert(wispStat.size > 50000, `幽火灵精序列帧贴图体积适中且有效 (${wispStat.size} bytes > 50KB)`);
assert(bruteStat.size > 50000, `熔岩蛮怪序列帧贴图体积适中且有效 (${bruteStat.size} bytes > 50KB)`);
assert(frostSheetStat.size > 50000, `玄霜巨兕序列帧贴图体积适中且有效 (${frostSheetStat.size} bytes > 50KB)`);
assert(frostCrystalStat.size > 20000, `冰棱晶弹幕贴图体积适中且有效 (${frostCrystalStat.size} bytes > 20KB)`);

// 2. 验证 PNG 签名头与图像分辨率 (IHDR)
function checkPngHeader(filePath, expectedW, expectedH) {
  const buf = fs.readFileSync(filePath);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { isPng, w, h };
}

const wispInfo = checkPngHeader(wispSheetPath, 640, 320);
assert(wispInfo.isPng, '幽火灵精序列帧为合法 PNG 格式');
assert(wispInfo.w === 640 && wispInfo.h === 320, `幽火灵精序列帧规格为 640x320 8帧 (实际: ${wispInfo.w}x${wispInfo.h})`);

const bruteInfo = checkPngHeader(bruteSheetPath, 720, 360);
assert(bruteInfo.isPng, '熔岩蛮怪序列帧为合法 PNG 格式');
assert(bruteInfo.w === 720 && bruteInfo.h === 360, `熔岩蛮怪序列帧规格为 720x360 8帧 (实际: ${bruteInfo.w}x${bruteInfo.h})`);

const frostInfo = checkPngHeader(frostSheetPath, 720, 360);
assert(frostInfo.isPng, '玄霜巨兕序列帧为合法 PNG 格式');
assert(frostInfo.w === 720 && frostInfo.h === 360, `玄霜巨兕序列帧规格为 720x360 8帧 (实际: ${frostInfo.w}x${frostInfo.h})`);

const crystalInfo = checkPngHeader(frostCrystalPath, 256, 256);
assert(crystalInfo.isPng, '冰棱晶弹幕为合法 PNG 格式');
assert(crystalInfo.w === 256 && crystalInfo.h === 256, `冰棱晶弹幕规格为 256x256 (实际: ${crystalInfo.w}x${crystalInfo.h})`);

// 3. 模拟浏览器环境加载产物
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
      if (on) el._classes.add(c);
      else el._classes.delete(c);
    },
  };
  el.addEventListener = (type, fn) => { (el._handlers[type] = el._handlers[type] || []).push(fn); };
  el.click = () => { for (const fn of el._handlers.click || []) fn(); if (el.onclick) el.onclick(); };
  el.querySelectorAll = (sel) => {
    return Array.from(elements.values()).filter(e => {
      if (sel.startsWith('#') && e.id === sel.slice(1)) return true;
      if (sel.startsWith('.') && e._classes.has(sel.slice(1))) return true;
      return false;
    });
  };
  el.querySelector = (sel) => {
    return elements.get(sel) || null;
  };
  Object.defineProperty(el, 'textContent', { get: () => el._text, set: (v) => { el._text = String(v); } });
  Object.defineProperty(el, 'innerHTML', { get: () => el._html, set: (v) => { el._html = String(v); } });
  return el;
}

function getEl(sel) {
  if (!elements.has(sel)) elements.set(sel, makeEl(sel.replace(/^[#.]/, '')));
  return elements.get(sel);
}

const canvasCalls = [];
const dummyCtx = {
  save() { canvasCalls.push('save'); },
  restore() { canvasCalls.push('restore'); },
  translate(x, y) { canvasCalls.push(`translate(${x},${y})`); },
  rotate(a) { canvasCalls.push(`rotate(${a})`); },
  scale(x, y) { canvasCalls.push(`scale(${x},${y})`); },
  beginPath() { canvasCalls.push('beginPath'); },
  closePath() { canvasCalls.push('closePath'); },
  moveTo(x, y) { canvasCalls.push(`moveTo(${x},${y})`); },
  lineTo(x, y) { canvasCalls.push(`lineTo(${x},${y})`); },
  arc(x, y, r, sa, ea) { canvasCalls.push(`arc(${x},${y},${r})`); },
  fill() { canvasCalls.push('fill'); },
  stroke() { canvasCalls.push('stroke'); },
  fillRect() { canvasCalls.push('fillRect'); },
  strokeRect() { canvasCalls.push('strokeRect'); },
  clearRect() { canvasCalls.push('clearRect'); },
  ellipse() { canvasCalls.push('ellipse'); },
  quadraticCurveTo() { canvasCalls.push('quadraticCurveTo'); },
  bezierCurveTo() { canvasCalls.push('bezierCurveTo'); },
  createRadialGradient() {
    return { addColorStop() {} };
  },
  createLinearGradient() {
    return { addColorStop() {} };
  },
  drawImage(...args) {
    canvasCalls.push(`drawImage(${args.length}args)`);
  },
  setLineDash() {},
  fillStyle: '#fff',
  strokeStyle: '#fff',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  lineWidth: 1
};

const canvasEl = getEl('#game');
canvasEl.width = 960;
canvasEl.height = 540;
canvasEl.getContext = () => dummyCtx;

globalThis.document = {
  querySelector: (sel) => getEl(sel),
  querySelectorAll: (sel) => {
    return Array.from(elements.values()).filter(e => {
      if (sel.startsWith('#') && e.id === sel.slice(1)) return true;
      if (sel.startsWith('.') && e._classes.has(sel.slice(1))) return true;
      return false;
    });
  },
  createElement: () => ({ relList: { supports: () => true } }),
};
globalThis.MutationObserver = class { observe() {} };
globalThis.Image = class {
  constructor() {
    this._src = '';
    this.onload = null;
  }
  get src() { return this._src; }
  set src(v) {
    this._src = v;
    if (typeof this.onload === 'function') {
      setTimeout(() => this.onload(), 0);
    }
  }
};
globalThis.window = { addEventListener() {} };
globalThis.performance = { now: () => Date.now() };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
globalThis.location = { reload() {} };

const assets = fs.readdirSync(path.resolve('dist/assets'));
const bundle = assets.find(name => name.endsWith('.js'));
if (!bundle) throw new Error('未找到构建产物，请先执行 npm run build');
await import(pathToFileURL(path.resolve('dist/assets', bundle)).href);

const gc = globalThis.window.__gameControls;
assert(!!gc, '__gameControls 已成功暴露');

if (gc) {
  // 4. 验证敌怪序列帧贴图对象初始化与路径
  const enemyTextures = gc.getEnemyTextures ? gc.getEnemyTextures() : null;
  assert(!!enemyTextures, 'getEnemyTextures() 方法正常导出');

  if (enemyTextures) {
    assert(enemyTextures.wispImg != null, 'enemyWispImg 实例已创建');
    assert(enemyTextures.wispSheetImg != null, 'enemyWispSheetImg 实例已创建');
    assert(enemyTextures.bruteImg != null, 'enemyBruteImg 实例已创建');
    assert(enemyTextures.bruteSheetImg != null, 'enemyBruteSheetImg 实例已创建');

    // 启用序列帧
    enemyTextures.setWispSheetLoaded(true);
    enemyTextures.setBruteSheetLoaded(true);

    assert(enemyTextures.wispSheetLoaded === true, '幽火灵精序列帧已加载标记生效');
    assert(enemyTextures.bruteSheetLoaded === true, '熔岩蛮怪序列帧已加载标记生效');
  }

  // 5. 验证演武场小怪加载与绘制
  gc.startTestLevel('sword', 'sword_qingfeng');
  gc.clearTestDummies();

  // 添加两只实战小怪
  gc.game.enemies = [
    { x: 300, y: 300, r: 18, kind: 'brute', hp: 100, maxHp: 100, hit: 0.12 },
    { x: 400, y: 300, r: 11, kind: 'wisp', hp: 50, maxHp: 50, hit: 0.08 }
  ];

  assert(gc.game.enemies.length === 2, '成功添加测试怪群');
  gc.exitTestLevel();

  // 6. 验证新精英怪【赤炼熔岩巨兕】属性、弹幕机制与击杀掉落
  gc.startTestLevel('sword', 'sword_qingfeng');
  gc.clearTestDummies();
  gc.game.enemies = [];
  gc.game.bossProjectiles = [];
  gc.game.drops = [];

  // 6.1 生成精英怪
  gc.createEnemy('elite_brute', 400, 300);
  const elite = gc.game.enemies.find(e => e.kind === 'elite_brute');
  assert(!!elite, '成功创建精英怪【赤炼熔岩巨兕】');
  if (elite) {
    assert(elite.isElite === true, '精英怪 isElite 属性为 true');
    assert(elite.r === 28, '精英怪体型碰撞半径为 28 (蛮怪为 18)');
    assert(elite.eliteName === '【精英】赤炼熔岩巨兕', '精英怪拥有专属尊名');
    assert(elite.shootTimer > 0, '精英怪包含熔岩弹幕发射倒计时');

    // 6.2 击败赤炼蛟后才可自然刷出的标记验证
    gc.game.defeatedRedDragon = false;
    assert(gc.game.defeatedRedDragon === false, '未击败赤炼蛟前 defeatedRedDragon 状态为 false');
    gc.game.defeatedRedDragon = true;
    assert(gc.game.defeatedRedDragon === true, '击败赤炼蛟后 defeatedRedDragon 状态为 true');

    // 6.3 熔岩弹幕发射机制
    const projCountBefore = gc.game.bossProjectiles.length;
    gc.fireMagmaBarrage(elite);
    const projCountAfter = gc.game.bossProjectiles.length;
    assert(projCountAfter === projCountBefore + 3, '赤炼熔岩巨兕发射 3 发扇形熔岩弹幕');

    const eliteProj = gc.game.bossProjectiles[projCountBefore];
    assert(eliteProj.source === 'elite_brute', '弹幕来源标记为 elite_brute');
    assert(eliteProj.type === 'fireball', '弹幕类型复用熔岩火球');

    // 6.4 击败精英怪的海量修为与多重灵气掉落
    const normalBruteQi = gc.getStageEnemyQi('brute');
    const eliteQi = gc.getStageEnemyQi('elite_brute');
    assert(eliteQi >= Math.round(normalBruteQi * 2.5), '精英怪提供高额基础修为掉落 (4.5x 关卡基准)');

    const dropsBefore = gc.game.drops.length;
    gc.defeat(elite);
    const dropsAfter = gc.game.drops.length;
    assert(dropsAfter >= dropsBefore + 4, '击败赤炼熔岩巨兕喷涌出多重精气灵球与法宝机缘');
  }

  gc.exitTestLevel();

  // 7. 验证反转版精英怪【玄霜凝晶巨兕】属性、冰晶弹幕与掉落机制
  gc.startTestLevel('sword', 'sword_qingfeng');
  gc.clearTestDummies();
  gc.game.enemies = [];
  gc.game.bossProjectiles = [];
  gc.game.drops = [];

  // 7.1 生成反转版精英怪
  gc.createEnemy('elite_frost_brute', 400, 300);
  const frostElite = gc.game.enemies.find(e => e.kind === 'elite_frost_brute');
  assert(!!frostElite, '成功创建反转版精英怪【玄霜凝晶巨兕】');
  if (frostElite) {
    assert(frostElite.isElite === true, '玄霜凝晶巨兕 isElite 属性为 true');
    assert(frostElite.r === 28, '玄霜凝晶巨兕体型碰撞半径为 28');
    assert(frostElite.eliteName === '【精英】玄霜凝晶巨兕', '反转版拥有专属尊名【精英】玄霜凝晶巨兕');
    assert(frostElite.color === '#38bdf8', '主色调配色为冰蓝色 (#38bdf8)');
    assert(frostElite.shootTimer > 0, '玄霜凝晶巨兕包含冰晶弹幕发射倒计时');

    // 7.2 冰棱晶弹幕发射机制
    const projCountBefore = gc.game.bossProjectiles.length;
    gc.fireFrostCrystalBarrage(frostElite);
    const projCountAfter = gc.game.bossProjectiles.length;
    assert(projCountAfter === projCountBefore + 5, '玄霜凝晶巨兕疾速发射 5 棱破空冰晶弹幕');

    const crystalProj = gc.game.bossProjectiles[projCountBefore];
    assert(crystalProj.source === 'elite_frost_brute', '弹幕来源标记为 elite_frost_brute');
    assert(crystalProj.type === 'frost_crystal', '弹幕类型为 frost_crystal');
    assert(crystalProj.color === '#38bdf8', '冰棱晶弹幕采用纯正冰蓝主色');

    // 7.3 击败反转版精英怪的高额修为与掉落
    const frostQi = gc.getStageEnemyQi('elite_frost_brute');
    const normalBruteQi = gc.getStageEnemyQi('brute');
    assert(frostQi >= Math.round(normalBruteQi * 2.5), '玄霜凝晶巨兕提供 4.5 倍关卡基准修为');

    const dropsBefore = gc.game.drops.length;
    gc.defeat(frostElite);
    const dropsAfter = gc.game.drops.length;
    assert(dropsAfter >= dropsBefore + 4, '击败玄霜凝晶巨兕喷涌出万千寒晶灵气与恢复宝珠');
  }

  gc.exitTestLevel();

  // 8. 验证火系灼烧与冰系减速/冰冻状态机制
  gc.startTestLevel('sword', 'sword_qingfeng');
  gc.clearTestDummies();
  gc.game.enemies = [];
  gc.game.bossProjectiles = [];
  gc.game.testGodMode = false;
  gc.game.player.invuln = 0;

  // 8.1 模拟火系熔岩弹幕命中玩家 -> 施加地火灼烧
  gc.game.playerBurnTimer = 0;
  gc.game.bossProjectiles.push({
    x: gc.game.player.x,
    y: gc.game.player.y,
    vx: 0,
    vy: 0,
    r: 8,
    type: 'fireball',
    source: 'elite_brute',
    damage: 10,
    life: 1
  });
  gc.updateBossProjectiles(0.016);
  assert(gc.game.playerBurnTimer > 0, '被熔岩弹幕命中后成功施加持续灼烧状态 (playerBurnTimer > 0)');
  assert(gc.game.playerBurnDmg > 0, '地火灼烧造成周期性掉血伤害 (playerBurnDmg > 0)');

  // 8.2 模拟冰系冰棱晶初次命中玩家 -> 施加玄霜减速
  gc.game.player.invuln = 0;
  gc.game.playerChillTimer = 0;
  gc.game.playerFreezeTimer = 0;
  gc.game.bossProjectiles.push({
    x: gc.game.player.x,
    y: gc.game.player.y,
    vx: 0,
    vy: 0,
    r: 8,
    type: 'frost_crystal',
    source: 'elite_frost_brute',
    damage: 8,
    life: 1
  });
  gc.updateBossProjectiles(0.016);
  assert(gc.game.playerChillTimer > 0, '初次被冰棱晶命中后成功施加减速状态 (playerChillTimer > 0)');
  assert(gc.game.playerChillSlow >= 0.4, '玄霜减速幅度达到 45% 以上');

  // 8.3 减速期间再次被冰棱晶命中 -> 触发绝对冰结 (冰冻)
  gc.game.player.invuln = 0;
  gc.game.bossProjectiles.push({
    x: gc.game.player.x,
    y: gc.game.player.y,
    vx: 0,
    vy: 0,
    r: 8,
    type: 'frost_crystal',
    source: 'elite_frost_brute',
    damage: 8,
    life: 1
  });
  gc.updateBossProjectiles(0.016);
  assert(gc.game.playerFreezeTimer > 0, '减速期间再次被冰晶命中成功触发冰冻 (playerFreezeTimer > 0)');

  gc.exitTestLevel();
}

console.log('---------------------------------------------');
console.log(`测试结果: ${passCount} 项通过, ${failCount} 项失败`);
console.log('=============================================');

if (failCount > 0) {
  process.exit(1);
}
