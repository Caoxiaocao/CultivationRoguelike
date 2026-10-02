import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

console.log('=============================================');
console.log('千年赤炼蛟 · 赤炼火弹与地脉火煞贴图及渲染测试');
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
const fireballPath = path.resolve('public/effect_dragon_fireball.png');
const lavaPath = path.resolve('public/effect_dragon_lava.png');

assert(fs.existsSync(fireballPath), '赤炼火弹贴图 public/effect_dragon_fireball.png 存在');
assert(fs.existsSync(lavaPath), '地脉火煞贴图 public/effect_dragon_lava.png 存在');

const sheetPath = path.resolve('public/boss_red_dragon_sheet.png');
assert(fs.existsSync(sheetPath), '赤炼蛟序列帧贴图 public/boss_red_dragon_sheet.png 存在');

const fbStat = fs.statSync(fireballPath);
const lavaStat = fs.statSync(lavaPath);
const sheetStat = fs.statSync(sheetPath);

assert(fbStat.size > 20000, `赤炼火弹贴图体积适中且有效 (${fbStat.size} bytes > 20KB)`);
assert(lavaStat.size > 100000, `地脉火煞高清贴图体积饱满且有效 (${lavaStat.size} bytes > 100KB)`);
assert(sheetStat.size > 100000, `赤炼蛟序列帧贴图体积饱满且有效 (${sheetStat.size} bytes > 100KB)`);

// 2. 验证 PNG 签名头与图像分辨率 (IHDR)
function checkPngHeader(filePath, expectedW, expectedH) {
  const buf = fs.readFileSync(filePath);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { isPng, w, h };
}

const fbInfo = checkPngHeader(fireballPath, 256, 256);
assert(fbInfo.isPng, '赤炼火弹贴图为合法 PNG 格式');
assert(fbInfo.w === 256 && fbInfo.h === 256, `赤炼火弹规格为 256x256 (实际: ${fbInfo.w}x${fbInfo.h})`);

const lavaInfo = checkPngHeader(lavaPath, 512, 512);
assert(lavaInfo.isPng, '地脉火煞贴图为合法 PNG 格式');
assert(lavaInfo.w === 512 && lavaInfo.h === 512, `地脉火煞规格为 512x512 高清大阵 (实际: ${lavaInfo.w}x${lavaInfo.h})`);

const sheetInfo = checkPngHeader(sheetPath, 720, 360);
assert(sheetInfo.isPng, '赤炼蛟序列帧贴图为合法 PNG 格式');
assert(sheetInfo.w === 720 && sheetInfo.h === 360, `赤炼蛟序列帧规格为 720x360 8帧 (实际: ${sheetInfo.w}x${sheetInfo.h})`);

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
  fillRect(x, y, w, h) { canvasCalls.push(`fillRect(${w},${h})`); },
  strokeRect(x, y, w, h) { canvasCalls.push(`strokeRect(${w},${h})`); },
  clearRect(x, y, w, h) { canvasCalls.push(`clearRect(${w},${h})`); },
  drawImage(...args) { canvasCalls.push('drawImage'); },
  createRadialGradient: () => ({ addColorStop() {} }),
  createLinearGradient: () => ({ addColorStop() {} }),
  setLineDash() {},
  measureText: () => ({ width: 40 }),
  fillText() {}
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
  // 4. 验证赤炼蛟龙贴图对象初始化与路径
  const textures = gc.getDragonTextures ? gc.getDragonTextures() : null;
  assert(!!textures, 'getDragonTextures() 方法正常导出');
  if (textures) {
    assert(textures.fireballImg && textures.fireballImg.src.includes('effect_dragon_fireball.png'), '赤炼火弹贴图引用指向 ./effect_dragon_fireball.png');
    assert(textures.lavaImg && textures.lavaImg.src.includes('effect_dragon_lava.png'), '地脉火煞贴图引用指向 ./effect_dragon_lava.png');
  }

  // 5. 模拟千年赤炼蛟发动「赤炼火弹」弹幕齐射
  const boss = {
    id: 'red_dragon',
    name: '千年赤炼蛟',
    x: 480,
    y: 120,
    damage: 28,
    currentPhase: { barrageCount: 7 }
  };
  gc.game.player = { x: 480, y: 400, r: 16 };
  gc.game.bossProjectiles = [];

  gc.executeBarrageAttack(boss);
  assert(gc.game.bossProjectiles.length === 7, `赤炼火弹扇形射出 7 颗火弹 (实际: ${gc.game.bossProjectiles.length})`);
  
  const firstProj = gc.game.bossProjectiles[0];
  assert(firstProj.bossId === 'red_dragon', '火弹标记有专属领主标识 bossId = red_dragon');
  assert(firstProj.type === 'fireball', '火弹类型为 fireball');
  assert(firstProj.r >= 7, '火弹半径尺寸充足');
  assert(firstProj.spin !== undefined, '火弹包含随机动态旋转自旋角');

  // 模拟火弹 Canvas 渲染
  canvasCalls.length = 0;
  gc.drawBossProjectiles(dummyCtx);
  assert(canvasCalls.length > 0, 'drawBossProjectiles 成功执行绘制调用');

  // 6. 模拟千年赤炼蛟发动「地脉火煞」范围法阵
  boss.currentPhase = { aoeCount: 4, aoeRadius: 55 };
  gc.game.bossAoEs = [];
  gc.executeAoEAttack(boss);

  assert(gc.game.bossAoEs.length === 4, `地脉火煞生成 4 处地火法阵 (实际: ${gc.game.bossAoEs.length})`);
  const firstAoE = gc.game.bossAoEs[0];
  assert(firstAoE.bossId === 'red_dragon', '地脉火煞标记有专属领主标识 bossId = red_dragon');
  assert(firstAoE.r === 55, '地脉火煞作用半径匹配配置 (55px)');
  assert(firstAoE.telegraphTimer > 0, '初始为预警阶段 (telegraphTimer > 0)');

  // 模拟预警阶段渲染
  canvasCalls.length = 0;
  gc.drawBossAoEs(dummyCtx);
  assert(canvasCalls.length > 0, 'drawBossAoEs 预警阶段成功执行');

  // 模拟爆发阶段渲染
  firstAoE.telegraphTimer = 0;
  firstAoE.activeTimer = 0.45;
  firstAoE.exploded = true;
  canvasCalls.length = 0;
  gc.drawBossAoEs(dummyCtx);
  assert(canvasCalls.length > 0, 'drawBossAoEs 爆发阶段成功执行');

  // 7. 贴图加载后贴图渲染逻辑分支覆盖
  if (textures && textures.setFireballLoaded && textures.setLavaLoaded) {
    textures.setFireballLoaded(true);
    textures.setLavaLoaded(true);
    if (textures.setSheetLoaded) textures.setSheetLoaded(true);
    assert(textures.sheetLoaded === true, '赤炼蛟序列帧贴图已加载标记生效');

    canvasCalls.length = 0;
    gc.drawBossProjectiles(dummyCtx);
    assert(canvasCalls.some(c => c.includes('drawImage')), '已加载贴图后，赤炼火弹成功调用 drawImage 绘制专属贴图');

    canvasCalls.length = 0;
    gc.drawBossAoEs(dummyCtx);
    assert(canvasCalls.some(c => c.includes('drawImage')), '已加载贴图后，地脉火煞成功调用 drawImage 绘制专属贴图');
  }
}

console.log('---------------------------------------------');
console.log(`测试结果: ${passCount} 项通过, ${failCount} 项失败`);
console.log('=============================================');

if (failCount > 0) {
  process.exit(1);
}
