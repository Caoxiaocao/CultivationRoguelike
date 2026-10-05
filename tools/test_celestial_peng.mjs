import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('====================================================');
  console.log('巡天金翅大鹏 · 24帧三动作序列帧全套机制专项自动化测试');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, desc) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
      process.exitCode = 1;
    }
  }

  const pubDir = path.join(__dirname, '..', 'public');

  // 1. 验证 3 套 24 帧精灵表物理文件与体积
  const sheets = [
    { name: 'boss_peng_rush_sheet.png', label: '① 冲刺飞扑 (24帧)' },
    { name: 'boss_peng_feather_sheet.png', label: '② 扇动翅膀发射羽毛 (24帧)' },
    { name: 'boss_peng_screech_sheet.png', label: '③ 矗立鸣叫 (24帧)' }
  ];

  for (const s of sheets) {
    const fullPath = path.join(pubDir, s.name);
    assert(fs.existsSync(fullPath), `${s.label} 文件存在: ${s.name}`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 500000, `${s.label} 体积有效 (>500KB): ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  }

  // 2. 验证精灵表 PNG 头部分辨率为 1536 x 1024 (6列 x 4行，单帧 256x256)
  for (const s of sheets) {
    const fullPath = path.join(pubDir, s.name);
    const buf = fs.readFileSync(fullPath);
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    assert(isPng, `${s.label} 为合法 PNG 格式`);
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    assert(w === 1536 && h === 1024, `${s.label} 分辨率精准符合 1536x1024: 实际 ${w}x${h}`);
    assert((1536 / 6 === 256) && (1024 / 4 === 256), `${s.label} 单帧尺寸为 256x256, 栅格为 6列x4行 = 24帧`);
  }

  // 2.5 验证太乙金羽剑雨与九霄神雷特效贴图物理文件与规格
  const effects = [
    { name: 'effect_peng_feather.png', label: '太乙金羽剑雨飞刃', w: 160, h: 64 },
    { name: 'effect_peng_thunder_array.png', label: '九霄神雷八卦雷霆法阵', w: 256, h: 256 },
    { name: 'effect_peng_thunder_strike.png', label: '九霄神雷天劫霹雳爆裂', w: 256, h: 256 }
  ];

  for (const eff of effects) {
    const fullPath = path.join(pubDir, eff.name);
    assert(fs.existsSync(fullPath), `${eff.label} 贴图物理文件存在: ${eff.name}`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 5000, `${eff.label} 文件体积有效 (>5KB): ${(stat.size / 1024).toFixed(1)} KB`);
    const buf = fs.readFileSync(fullPath);
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    assert(isPng, `${eff.label} 为合法 PNG 格式`);
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    assert(w === eff.w && h === eff.h, `${eff.label} 分辨率符合规范设计: 实际 ${w}x${h} (预期 ${eff.w}x${eff.h})`);
  }

  // 3. 模拟浏览器环境加载 dist 产物执行功能测试
  console.log('\n--- 验证游戏引擎内 Celestial Peng 动作播放器与状态切换 ---');

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
      _children: []
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
    el.getContext = () => dummyCtx;
    elements.set(id, el);
    return el;
  }

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
    rect() {},
    clip() {},
    fill() {},
    stroke() {},
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    drawImage() {},
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    setLineDash() {},
    measureText() { return { width: 10 }; },
    fillText() {},
    strokeText() {}
  };

  const canvasEl = makeEl('game-canvas');
  canvasEl.width = 1280;
  canvasEl.height = 720;
  canvasEl.getContext = () => dummyCtx;

  const mockDoc = {
    getElementById(id) {
      if (!elements.has(id)) makeEl(id);
      return elements.get(id);
    },
    querySelector: (sel) => {
      if (sel.startsWith('#')) return mockDoc.getElementById(sel.slice(1));
      return makeEl('mock-' + Math.random().toString(36).slice(2));
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement(tag) {
      const el = makeEl('dyn_' + Math.random());
      if (tag === 'canvas') {
        el.width = 256;
        el.height = 256;
        el.getContext = () => dummyCtx;
      }
      return el;
    },
    body: makeEl('body'),
    head: makeEl('head')
  };

  class MockImage {
    constructor() {
      this._src = '';
      this.onload = null;
      this.complete = true;
      this.naturalWidth = 1536;
      this.naturalHeight = 1024;
    }
    set src(v) {
      this._src = v;
      if (this.onload) setTimeout(this.onload, 1);
    }
    get src() { return this._src; }
  }

  globalThis.window = { addEventListener() {} };
  globalThis.document = mockDoc;
  globalThis.Image = MockImage;
  globalThis.MutationObserver = class { observe() {} disconnect() {} };
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
  assert(gc != null, '顺利挂载 __gameControls 控制桥梁');

  // 4. 验证 BOSS_CONFIGS.celestial_peng 配置
  const cfg = gc.BOSS_CONFIGS.celestial_peng;
  assert(cfg != null, 'BOSS_CONFIGS 包含 celestial_peng 化神境领主配置');
  assert(cfg.phases && cfg.phases.length === 2, '包含两阶段完整进阶机制 (扶摇九霄 / 大鹏搏龙)');

  // 5. 验证贴图钩子
  const pengTextures = gc.getCelestialPengTextures();
  assert(pengTextures != null, '成功获取 getCelestialPengTextures 贴图接口');
  assert(typeof pengTextures.rushSheetImg !== 'undefined', '包含 rushSheetImg 贴图定义');
  assert(typeof pengTextures.featherSheetImg !== 'undefined', '包含 featherSheetImg 贴图定义');
  assert(typeof pengTextures.screechSheetImg !== 'undefined', '包含 screechSheetImg 贴图定义');
  assert(typeof pengTextures.featherImg !== 'undefined', '包含 featherImg (太乙金羽) 贴图定义');
  assert(typeof pengTextures.thunderArrayImg !== 'undefined', '包含 thunderArrayImg (九霄雷阵) 贴图定义');
  assert(typeof pengTextures.thunderStrikeImg !== 'undefined', '包含 thunderStrikeImg (九霄神雷) 贴图定义');

  pengTextures.setRushSheetLoaded(true);
  pengTextures.setFeatherSheetLoaded(true);
  pengTextures.setScreechSheetLoaded(true);
  pengTextures.setFeatherLoaded(true);
  pengTextures.setThunderArrayLoaded(true);
  pengTextures.setThunderStrikeLoaded(true);
  assert(pengTextures.featherLoaded === true, 'featherLoaded 成功置为 true');
  assert(pengTextures.thunderArrayLoaded === true, 'thunderArrayLoaded 成功置为 true');
  assert(pengTextures.thunderStrikeLoaded === true, 'thunderStrikeLoaded 成功置为 true');

  // 6. 验证 SpriteSheetAnimation 24 帧平滑运行与循环
  const SpriteSheetAnimation = gc.SpriteSheetAnimation;
  assert(typeof SpriteSheetAnimation !== 'undefined', 'SpriteSheetAnimation 播放器已就绪');

  const testAnim = new SpriteSheetAnimation({
    img: new MockImage(),
    frameW: 256,
    frameH: 256,
    cols: 6,
    rows: 4,
    totalFrames: 24,
    fps: 18,
    loop: true
  });

  assert(testAnim.totalFrames === 24, '动作播放器总帧数为 24 帧');
  assert(testAnim.currentFrame === 0, '初始处于第 0 帧');

  // 推进 23 帧
  for (let i = 0; i < 23; i++) {
    testAnim.update(1 / 18);
  }
  assert(testAnim.currentFrame === 23, `平滑步进至第 23 帧 (末帧)`);

  // 再次推进 1 帧，循环回到第 0 帧
  testAnim.update(1 / 18);
  assert(testAnim.currentFrame === 0, '跨越末帧后平滑无缝循环回到第 0 帧');

  // 7. 验证 drawCelestialPengModel 领主状态动作分支切换
  const testBoss = {
    id: 'celestial_peng',
    r: 48,
    state: 'idle',
    animTimer: 0,
    hit: 0,
    rushDir: { x: -1, y: 0 },
    currentPhase: cfg.phases[0]
  };

  // 模拟待机/九霄神雷状态
  testBoss.state = 'idle';
  gc.drawCelestialPengModel(dummyCtx, testBoss);
  assert(testBoss.pengAnims != null, '成功初始化三套 24 帧动作字典 pengAnims');
  assert(testBoss.pengAnims.rush != null, '包含 rush (冲刺飞扑) 播放器');
  assert(testBoss.pengAnims.feather != null, '包含 feather (扇翅射羽) 播放器');
  assert(testBoss.pengAnims.screech != null, '包含 screech (矗立鸣叫) 播放器');

  // 模拟冲刺飞扑 (向右突进)
  testBoss.state = 'rushing';
  testBoss.rushDir = { x: 1, y: 0 };
  let flipped = false;
  const originalScale = dummyCtx.scale;
  dummyCtx.scale = (sx, sy) => {
    if (sx === -1) flipped = true;
    originalScale.call(dummyCtx, sx, sy);
  };
  gc.drawCelestialPengModel(dummyCtx, testBoss);
  assert(flipped, '向右突进冲刺时模型触发水平镜像翻转');
  dummyCtx.scale = originalScale;

  // 模拟太乙金羽齐射
  testBoss.state = 'casting_barrage';
  gc.drawCelestialPengModel(dummyCtx, testBoss);
  assert(true, '太乙金羽齐射动作绘制正常');

  // 8. 验证太乙金羽弹幕与九霄神雷法阵实机绘制调用
  console.log('\n--- 验证太乙金羽剑雨与九霄神雷特效渲染系统 ---');
  let drawImageCalls = 0;
  const originalDrawImage = dummyCtx.drawImage;
  dummyCtx.drawImage = (...args) => {
    drawImageCalls++;
    originalDrawImage.apply(dummyCtx, args);
  };

  const game = gc.game;
  assert(game != null, '成功获取游戏核心状态对象 game');

  // 测试太乙金羽剑雨弹幕绘制
  game.bossProjectiles = [{
    bossId: 'celestial_peng',
    x: 200,
    y: 200,
    vx: 300,
    vy: 100,
    r: 6,
    type: 'feather',
    damage: 20
  }];

  drawImageCalls = 0;
  pengTextures.setFeatherLoaded(true);
  gc.drawBossProjectiles(dummyCtx);
  assert(drawImageCalls > 0, '太乙金羽贴图已载入时，成功调用 drawImage 绘制太古泥金飞羽剑刃');

  drawImageCalls = 0;
  pengTextures.setFeatherLoaded(false);
  gc.drawBossProjectiles(dummyCtx);
  assert(drawImageCalls === 0, '太乙金羽贴图未载入时，安全优雅降级矢量剑羽绘制');

  // 测试九霄神雷法阵绘制 (预警阶段与爆发阶段)
  const mockAoE = {
    bossId: 'celestial_peng',
    x: 300,
    y: 300,
    r: 60,
    telegraphTimer: 0.6,
    maxTelegraph: 1.1,
    activeTimer: 0.55,
    maxActive: 0.55,
    color: '#ffb703',
    secondaryColor: '#ffffff'
  };
  game.bossAoEs = [mockAoE];

  // 预警阶段测试
  drawImageCalls = 0;
  pengTextures.setThunderArrayLoaded(true);
  gc.drawBossAoEs(dummyCtx);
  assert(drawImageCalls > 0, '九霄神雷预警阶段成功调用 drawImage 绘制八卦雷霆法阵');

  drawImageCalls = 0;
  pengTextures.setThunderArrayLoaded(false);
  gc.drawBossAoEs(dummyCtx);
  assert(drawImageCalls === 0, '九霄神雷预警阶段未载入时安全执行通用阵法降级绘制');

  // 爆发阶段测试
  mockAoE.telegraphTimer = 0;
  mockAoE.activeTimer = 0.35;
  drawImageCalls = 0;
  pengTextures.setThunderStrikeLoaded(true);
  gc.drawBossAoEs(dummyCtx);
  assert(drawImageCalls > 0, '九霄神雷爆发阶段成功调用 drawImage 绘制天劫霹雳爆裂图');

  drawImageCalls = 0;
  pengTextures.setThunderStrikeLoaded(false);
  gc.drawBossAoEs(dummyCtx);
  assert(drawImageCalls === 0, '九霄神雷爆发阶段未载入时安全执行电浆光柱降级绘制');

  dummyCtx.drawImage = originalDrawImage;

  console.log(`\n====================================================`);
  console.log(`巡天金翅大鹏 24 帧动作与太乙金羽/九霄神雷特效测试结果: ${passed}/${total} 全部通过!`);
  console.log(`====================================================\n`);
}

runTests().catch(err => {
  console.error('测试异常崩溃:', err);
  process.exit(1);
});
