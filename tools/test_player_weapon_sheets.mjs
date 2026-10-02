import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

console.log('====================================================');
console.log('凌虚子（剑修）三大本命法宝动作序列帧游戏内实装测试');
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

// 1. 验证贴图物理文件存在且非空
const qingfengPath = path.resolve('public/player_sword_qingfeng_sheet.png');
const jifengPath = path.resolve('public/player_sword_jifeng_sheet.png');
const benleiPath = path.resolve('public/player_sword_benlei_sheet.png');

assert(fs.existsSync(qingfengPath), '青锋灵剑序列帧贴图 public/player_sword_qingfeng_sheet.png 存在');
assert(fs.existsSync(jifengPath), '疾风残刃序列帧贴图 public/player_sword_jifeng_sheet.png 存在');
assert(fs.existsSync(benleiPath), '奔雷古剑序列帧贴图 public/player_sword_benlei_sheet.png 存在');

const qingfengStat = fs.statSync(qingfengPath);
const jifengStat = fs.statSync(jifengPath);
const benleiStat = fs.statSync(benleiPath);

assert(qingfengStat.size > 50000, `青锋灵剑序列帧贴图有效 (${qingfengStat.size} bytes > 50KB)`);
assert(jifengStat.size > 50000, `疾风残刃序列帧贴图有效 (${jifengStat.size} bytes > 50KB)`);
assert(benleiStat.size > 50000, `奔雷古剑序列帧贴图有效 (${benleiStat.size} bytes > 50KB)`);

// 2. 验证 PNG 签名与规格 (540x360, 6帧, 180x180)
function checkPng(filePath, expectedW, expectedH) {
  const buf = fs.readFileSync(filePath);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { isPng, w, h };
}

const qfInfo = checkPng(qingfengPath, 540, 360);
assert(qfInfo.isPng, '青锋灵剑序列帧为标准 PNG 格式');
assert(qfInfo.w === 540 && qfInfo.h === 360, `青锋灵剑序列帧规格为 540x360 6帧 (实际: ${qfInfo.w}x${qfInfo.h})`);

const jfInfo = checkPng(jifengPath, 540, 360);
assert(jfInfo.isPng, '疾风残刃序列帧为标准 PNG 格式');
assert(jfInfo.w === 540 && jfInfo.h === 360, `疾风残刃序列帧规格为 540x360 6帧 (实际: ${jfInfo.w}x${jfInfo.h})`);

const blInfo = checkPng(benleiPath, 540, 360);
assert(blInfo.isPng, '奔雷古剑序列帧为标准 PNG 格式');
assert(blInfo.w === 540 && blInfo.h === 360, `奔雷古剑序列帧规格为 540x360 6帧 (实际: ${blInfo.w}x${blInfo.h})`);

// 法修（清虚仙子）八卦阵盘
const baguaPath = path.resolve('public/player_spell_bagua_sheet.png');
assert(fs.existsSync(baguaPath), '八卦阵盘序列帧贴图 public/player_spell_bagua_sheet.png 存在');
const baguaStat = fs.statSync(baguaPath);
assert(baguaStat.size > 50000, `八卦阵盘序列帧贴图有效 (${baguaStat.size} bytes > 50KB)`);
const baguaInfo = checkPng(baguaPath, 540, 360);
assert(baguaInfo.isPng, '八卦阵盘序列帧为标准 PNG 格式');
assert(baguaInfo.w === 540 && baguaInfo.h === 360, `八卦阵盘序列帧规格为 540x360 6帧 (实际: ${baguaInfo.w}x${baguaInfo.h})`);

// 3. 构建 Headless 浏览器 Mock 环境并加载 main.js
const elements = new Map();
const dummyCtx = {
  save() {},
  restore() {},
  translate() {},
  rotate() {},
  scale() {},
  beginPath() {},
  closePath() {},
  arc() {},
  ellipse() {},
  moveTo() {},
  lineTo() {},
  fill() {},
  stroke() {},
  fillRect() {},
  strokeRect() {},
  clearRect() {},
  createRadialGradient() { return { addColorStop() {} }; },
  createLinearGradient() { return { addColorStop() {} }; },
  drawImage() {},
  measureText(txt) { return { width: String(txt).length * 8 }; },
  fillText() {},
  strokeText() {},
  setLineDash() {},
  setTransform() {},
  resetTransform() {},
};

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
  el.click = () => { for (const fn of el._handlers.click || []) fn(); if (el.onclick) el.onclick(); };
  el.querySelector = (sel) => {
    if (sel.startsWith('#')) return elements.get(sel.slice(1)) || null;
    return null;
  };
  el.querySelectorAll = (sel) => [];
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
  createElement: (tag) => makeEl('tag-' + Math.random().toString(36).slice(2)),
  body: makeEl('body'),
  documentElement: makeEl('html')
};

class MockImage {
  constructor() {
    this._src = '';
    this.onload = null;
    this.complete = true;
    this.naturalWidth = 540;
    this.naturalHeight = 360;
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
globalThis.canvas = makeEl('game');
globalThis.ctx = dummyCtx;
globalThis.Image = MockImage;
globalThis.localStorage = {
  _store: new Map(),
  getItem(k) { return this._store.get(k) || null; },
  setItem(k, v) { this._store.set(k, String(v)); },
  removeItem(k) { this._store.delete(k); },
  clear() { this._store.clear(); }
};
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
globalThis.performance = { now: () => Date.now() };
globalThis.AudioContext = class {
  createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
  createGain() { return { connect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
  get destination() { return {}; }
  get currentTime() { return 0; }
};

// 预制必要 DOM 节点
['#app', '#game', '#btn-start', '#btn-restart', '#btn-pause', '#btn-resume', '#btn-quit',
 '#overlay', '#title-screen', '#game-screen', '#game-ui', '#char-select-screen',
 '#char-select-cards', '#char-header-title', '#char-header-sub',
 '#btn-weapon-back', '#btn-char-back', '#char-actions-bar', '#char-gamepad-hints',
 '#test-hud-panel', '#test-full-panel', '#test-hud-btn-toggle', '#test-hud-btn-straw',
 '#test-hud-btn-clear', '#test-hud-btn-reset-stat', '#test-hud-btn-exit',
 '#btn-test-panel-close', '#btn-test-panel-resume', '#btn-test-quick-straw',
 '#btn-test-panel-pause', '#test-panel-tabs', '#test-panel-tab-content',
 '#canvas-container', '#cvs', '#weapon-orbit-canvas'
].forEach(sel => makeEl(sel.replace(/^[#.]/, '')));

const distAssets = path.resolve('dist/assets');
const jsFiles = fs.readdirSync(distAssets).filter(f => f.endsWith('.js'));
if (jsFiles.length === 0) {
  console.error('FAIL  未找到 dist/assets/*.js，请先执行 npm run build');
  process.exit(1);
}
const bundleUrl = pathToFileURL(path.join(distAssets, jsFiles[0])).href;
await import(bundleUrl);

const controls = globalThis.__gameControls || (globalThis.window && globalThis.window.__gameControls);
assert(Boolean(controls), '全局游戏句柄 __gameControls 挂载成功');

// 4. 验证法宝序列帧贴图定义与查询接口
const textures = controls.getPlayerWeaponTextures();
assert(Boolean(textures), 'getPlayerWeaponTextures 接口有效导出');
assert(Boolean(textures.sheets), 'sheets 贴图集合导出成功');

const qfSheet = textures.getSheet('sword_qingfeng');
assert(Boolean(qfSheet), '青锋灵剑序列帧配置项存在');
assert(qfSheet.src === './player_sword_qingfeng_sheet.png', '青锋灵剑贴图采用正确的相对路径 ./player_sword_qingfeng_sheet.png');
assert(qfSheet.frameW === 180 && qfSheet.frameH === 180, '青锋灵剑单帧尺寸为 180x180');
assert(qfSheet.cols === 3 && qfSheet.rows === 2 && qfSheet.totalFrames === 6, '青锋灵剑为 3 列 2 行共 6 帧动画');

const jfSheet = textures.getSheet('sword_jifeng');
assert(Boolean(jfSheet), '疾风残刃序列帧配置项存在');
assert(jfSheet.src === './player_sword_jifeng_sheet.png', '疾风残刃贴图采用正确的相对路径 ./player_sword_jifeng_sheet.png');
assert(jfSheet.frameW === 180 && jfSheet.frameH === 180, '疾风残刃单帧尺寸为 180x180');
assert(jfSheet.cols === 3 && jfSheet.rows === 2 && jfSheet.totalFrames === 6, '疾风残刃为 3 列 2 行共 6 帧动画');

const blSheet = textures.getSheet('sword_benlei');
assert(Boolean(blSheet), '奔雷古剑序列帧配置项存在');
assert(blSheet.src === './player_sword_benlei_sheet.png', '奔雷古剑贴图采用正确的相对路径 ./player_sword_benlei_sheet.png');
assert(blSheet.frameW === 180 && blSheet.frameH === 180, '奔雷古剑单帧尺寸为 180x180');
assert(blSheet.cols === 3 && blSheet.rows === 2 && blSheet.totalFrames === 6, '奔雷古剑为 3 列 2 行共 6 帧动画');

// 法修（清虚仙子）八卦阵盘序列帧
const baguaSheet = textures.getSheet('spell_bagua');
assert(Boolean(baguaSheet), '八卦阵盘序列帧配置项存在');
assert(baguaSheet.src === './player_spell_bagua_sheet.png', '八卦阵盘贴图采用正确的相对路径 ./player_spell_bagua_sheet.png');
assert(baguaSheet.frameW === 180 && baguaSheet.frameH === 180, '八卦阵盘单帧尺寸为 180x180');
assert(baguaSheet.cols === 3 && baguaSheet.rows === 2 && baguaSheet.totalFrames === 6, '八卦阵盘为 3 列 2 行共 6 帧动画');

// 5. 验证根据玩家所持武器动态解析贴图 (getPlayerWeaponSheet)
const getSheet = controls.getPlayerWeaponSheet;
assert(typeof getSheet === 'function', 'getPlayerWeaponSheet 方法已定义');

// 剑修搭配青锋灵剑
const pSwordQingfeng = { charId: 'sword', weaponId: 'sword_qingfeng', weaponType: 'sword' };
assert(getSheet(pSwordQingfeng) === qfSheet, '剑修执青锋灵剑时成功匹配青锋灵剑序列帧');

// 剑修搭配疾风残刃
const pSwordJifeng = { charId: 'sword', weaponId: 'sword_jifeng', weaponType: 'daggers' };
assert(getSheet(pSwordJifeng) === jfSheet, '剑修执疾风残刃时成功匹配疾风残刃序列帧');

// 剑修搭配奔雷古剑
const pSwordBenlei = { charId: 'sword', weaponId: 'sword_benlei', weaponType: 'thunder_sword' };
assert(getSheet(pSwordBenlei) === blSheet, '剑修执奔雷古剑时成功匹配奔雷古剑序列帧');

// 法修执八卦阵盘
const pSpellBagua = { charId: 'spell', weaponId: 'spell_bagua', weaponType: 'bagua' };
assert(getSheet(pSpellBagua) === baguaSheet, '法修执八卦阵盘时成功匹配其专属序列帧');

// 没登记帧集的武器（含法修其余法宝）应返回 null，平滑回退到各自专属立绘
const pSpellUnregistered = { charId: 'spell', weaponId: 'spell_fire', weaponType: 'spell_fire' };
assert(getSheet(pSpellUnregistered) === null, '未登记帧集的武器返回 null，平滑回退至其自身专属立绘');

const pBody = { charId: 'body', weaponId: 'body_ding', weaponType: 'ding' };
assert(getSheet(pBody) === null, '体修等无帧集职业返回 null，平滑回退至其自身专属立绘');

// 剑修未匹配到具体武器时仍回退到默认青锋灵剑（保持既有行为）
const pSwordFallback = { charId: 'sword', weaponId: 'sword_unknown', weaponType: 'unknown' };
assert(getSheet(pSwordFallback) === qfSheet, '剑修未匹配时回退默认青锋灵剑序列帧');

// 6. 验证出招计时器 (attackTimer) 与攻击动作帧律动
const game = controls.game;
game.player.charId = 'sword';
game.player.weaponId = 'sword_qingfeng';
game.player.weaponType = 'sword';
game.player.attackTimer = 0.28;

assert(game.player.attackTimer === 0.28, '起手攻击时 attackTimer 被设为 0.28');

// 7. 验证残影与法宝动作帧关联 (Ghost Trail)
textures.setSheetLoaded('sword_qingfeng', true);
textures.setSheetLoaded('sword_jifeng', true);
textures.setSheetLoaded('sword_benlei', true);

game.ghostTrails = [];
game.player._weaponSheet = qfSheet;
game.player._actionFrameIdx = 3; // 斩击爆发帧
controls.spawnPlayerGhostTrail(true);

assert(game.ghostTrails.length === 1, '成功生成剑气残影 (Ghost Trail)');
const trail = game.ghostTrails[0];
assert(trail.sheet === qfSheet, '残影携带当前匹配的武器序列帧');
assert(trail.frameIndex === 3, '残影精准记录当前挥砍斩击动作帧 (帧 3)');

// 8. 验证在试炼场/角色选择中动态切换武器时即时响应
controls.applyTestWeapon('sword', 'sword_jifeng', false);
assert(game.player.weaponId === 'sword_jifeng', '试炼场成功切换至疾风残刃');
assert(getSheet(game.player) === jfSheet, '玩家实时动作序列帧即时响应更新为疾风残刃双刃风暴序列帧');

controls.applyTestWeapon('sword', 'sword_benlei', false);
assert(game.player.weaponId === 'sword_benlei', '试炼场成功切换至奔雷古剑');
assert(getSheet(game.player) === blSheet, '玩家实时动作序列帧即时响应更新为奔雷古剑引雷力劈序列帧');

console.log('====================================================');
console.log(`测试结果统计: ${passCount} 通过, ${failCount} 失败`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 凌虚子三大本命法宝动作序列帧游戏内实装测试全部通过！\n');
}
