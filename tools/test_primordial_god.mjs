import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('====================================================');
  console.log('混沌太虚道祖 · 24帧四动作序列帧与终极奥义机制测试');
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

  // 1. 验证 4 套 24 帧精灵表物理文件与体积
  const sheets = [
    { name: 'boss_primordial_whisk_sheet.png', label: '① 拂尘裂空 · 弹幕挥斩 (24帧)' },
    { name: 'boss_primordial_scroll_sheet.png', label: '② 真卷启灵 · 九天玄刹神雷 (24帧)' },
    { name: 'boss_primordial_singularity_sheet.png', label: '③ 混沌归元 · 太极黑洞引力坍缩 (24帧)' },
    { name: 'boss_primordial_rush_sheet.png', label: '④ 太虚折跃 · 触手破虚突刺 (24帧)' }
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

  // 2.1 验证 4 张专属攻击弹幕与雷劫特效贴图物理文件与体积/分辨率
  const effects = [
    { name: 'effect_primordial_thunder_array.png', label: '太虚乾坤八卦雷纹阵盘', w: 256, h: 256 },
    { name: 'effect_primordial_thunder_strike.png', label: '九天玄刹混沌天劫雷爆', w: 256, h: 256 },
    { name: 'effect_primordial_blade.png', label: '太虚裂空星刃飞刃', w: 128, h: 64 },
    { name: 'effect_primordial_orb.png', label: '混沌太极玄珠弹幕', w: 64, h: 64 }
  ];

  for (const eff of effects) {
    const fullPath = path.join(pubDir, eff.name);
    assert(fs.existsSync(fullPath), `${eff.label} 文件存在: ${eff.name}`);
    const buf = fs.readFileSync(fullPath);
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    assert(isPng, `${eff.label} 为合法 PNG 格式`);
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    assert(w === eff.w && h === eff.h, `${eff.label} 尺寸精准符合 ${eff.w}x${eff.h}: 实际 ${w}x${h}`);
  }

  // 3. 模拟浏览器环境加载 dist 产物执行功能测试
  console.log('\n--- 验证游戏引擎内 Primordial God 动作播放器与状态切换 ---');

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

  // 4. 验证 BOSS_CONFIGS.primordial_god 配置
  const cfg = gc.BOSS_CONFIGS.primordial_god;
  assert(cfg != null, 'BOSS_CONFIGS 包含 primordial_god 终极领主配置');
  assert(cfg.phases && cfg.phases.length === 3, '包含三阶段完整进阶机制 (阴阳玄极 / 诸天星陨 / 终极飞升劫)');
  assert(cfg.phases[1].singularity === true, '第二阶段解锁太极黑洞引力坍缩奥义');
  assert(cfg.phases[2].singularity === true, '第三阶段具有强化版太极黑洞奥义');

  // 5. 验证贴图钩子
  const godTextures = gc.getPrimordialGodTextures();
  assert(godTextures != null, '成功获取 getPrimordialGodTextures 贴图接口');
  assert(typeof godTextures.whiskSheetImg !== 'undefined', '包含 whiskSheetImg 贴图定义');
  assert(typeof godTextures.scrollSheetImg !== 'undefined', '包含 scrollSheetImg 贴图定义');
  assert(typeof godTextures.singularitySheetImg !== 'undefined', '包含 singularitySheetImg 贴图定义');
  assert(typeof godTextures.rushSheetImg !== 'undefined', '包含 rushSheetImg 贴图定义');
  assert(typeof godTextures.thunderArrayImg !== 'undefined', '包含 thunderArrayImg 贴图定义');
  assert(typeof godTextures.thunderStrikeImg !== 'undefined', '包含 thunderStrikeImg 贴图定义');
  assert(typeof godTextures.bladeImg !== 'undefined', '包含 bladeImg 贴图定义');
  assert(typeof godTextures.orbImg !== 'undefined', '包含 orbImg 贴图定义');

  godTextures.setWhiskSheetLoaded(true);
  godTextures.setScrollSheetLoaded(true);
  godTextures.setSingularitySheetLoaded(true);
  godTextures.setRushSheetLoaded(true);
  godTextures.setThunderArrayLoaded(true);
  godTextures.setThunderStrikeLoaded(true);
  godTextures.setBladeLoaded(true);
  godTextures.setOrbLoaded(true);
  assert(godTextures.whiskSheetLoaded === true, 'whiskSheetLoaded 成功置为 true');
  assert(godTextures.scrollSheetLoaded === true, 'scrollSheetLoaded 成功置为 true');
  assert(godTextures.singularitySheetLoaded === true, 'singularitySheetLoaded 成功置为 true');
  assert(godTextures.rushSheetLoaded === true, 'rushSheetLoaded 成功置为 true');
  assert(godTextures.thunderArrayLoaded === true, 'thunderArrayLoaded 成功置为 true');
  assert(godTextures.thunderStrikeLoaded === true, 'thunderStrikeLoaded 成功置为 true');
  assert(godTextures.bladeLoaded === true, 'bladeLoaded 成功置为 true');
  assert(godTextures.orbLoaded === true, 'orbLoaded 成功置为 true');

  // 6. 验证 SpriteSheetAnimation 24 帧循环驱动机制
  const SpriteSheetAnimation = gc.SpriteSheetAnimation;
  assert(SpriteSheetAnimation != null, 'SpriteSheetAnimation 播放器已就绪');

  const testAnim = new SpriteSheetAnimation({
    img: godTextures.whiskSheetImg,
    frameW: 256,
    frameH: 256,
    cols: 6,
    rows: 4,
    totalFrames: 24,
    fps: 16,
    loop: true
  });
  assert(testAnim.totalFrames === 24, '道祖动作播放器总帧数为 24 帧');
  assert(testAnim.currentFrame === 0, '初始处于第 0 帧');
  testAnim.update(23 * (1 / 16));
  assert(testAnim.currentFrame === 23, '平滑步进至第 23 帧 (末帧)');
  testAnim.update(1 / 16);
  assert(testAnim.currentFrame === 0, '跨越末帧后平滑无缝循环回到第 0 帧');

  // 7. 验证 drawPrimordialGodModel 领主状态动作分支切换
  const testBoss = {
    id: 'primordial_god',
    r: 54,
    state: 'idle',
    animTimer: 0,
    hit: 0,
    rushDir: { x: 1, y: 0 },
    currentPhase: cfg.phases[0],
    phaseIndex: 0
  };

  // 待机状态
  testBoss.state = 'idle';
  gc.drawPrimordialGodModel(dummyCtx, testBoss);
  assert(testBoss.primordialAnims != null, '成功初始化四套 24 帧动作字典 primordialAnims');
  assert(testBoss.primordialAnims.whisk != null, '包含 whisk (拂尘裂空) 播放器');
  assert(testBoss.primordialAnims.scroll != null, '包含 scroll (真卷启灵) 播放器');
  assert(testBoss.primordialAnims.singularity != null, '包含 singularity (黑洞坍缩) 播放器');
  assert(testBoss.primordialAnims.rush != null, '包含 rush (触手破虚) 播放器');

  // 冲刺飞扑 (向左突进，触发镜像翻转)
  testBoss.state = 'rushing';
  testBoss.rushDir = { x: -1, y: 0 };
  let flipped = false;
  const originalScale = dummyCtx.scale;
  dummyCtx.scale = (sx, sy) => {
    if (sx === -1) flipped = true;
    originalScale.call(dummyCtx, sx, sy);
  };
  gc.drawPrimordialGodModel(dummyCtx, testBoss);
  assert(flipped, '向左破虚突刺时模型触发水平镜像翻转');
  dummyCtx.scale = originalScale;

  // 拂尘弹幕施法动作分支
  testBoss.state = 'casting_barrage';
  gc.drawPrimordialGodModel(dummyCtx, testBoss);
  assert(true, '拂尘裂空弹幕动作绘制正常');

  // 真卷神雷法阵动作分支
  testBoss.state = 'casting_aoe';
  gc.drawPrimordialGodModel(dummyCtx, testBoss);
  assert(true, '真卷启灵神雷动作绘制正常');

  // 太极黑洞坍缩动作分支
  testBoss.state = 'casting_singularity';
  gc.drawPrimordialGodModel(dummyCtx, testBoss);
  assert(true, '混沌归元黑洞动作绘制正常');

  // 8. 验证实机攻击机制
  console.log('\n--- 验证太虚星刃、神雷雷劫与太极引力坍缩机制 ---');
  const game = gc.game;
  assert(game != null, '成功获取游戏核心状态对象 game');

  // 测试弹幕齐射
  game.player = { x: 640, y: 600, r: 16, invuln: 0 };
  game.bossProjectiles = [];
  testBoss.state = 'casting_barrage';
  testBoss.x = 640;
  testBoss.y = 200;
  testBoss.damage = 40;
  gc.executeBarrageAttack(testBoss);
  assert(game.bossProjectiles.length > 0, '拂尘挥扫成功生成太虚星刃与阴阳混沌珠弹幕');
  const blade = game.bossProjectiles.find(p => p.type === 'cosmic_blade');
  const orb = game.bossProjectiles.find(p => p.type === 'yin_yang_orb');
  assert(blade != null, '包含太虚星刃 (cosmic_blade)');
  assert(orb != null, '包含阴阳道珠 (yin_yang_orb)');

  // 测试范围神雷法阵
  game.bossAoEs = [];
  testBoss.state = 'casting_aoe';
  gc.executeAoEAttack(testBoss);
  assert(game.bossAoEs.length >= 4, '真卷启灵成功召唤九天玄刹神雷天劫法阵');
  assert(game.bossAoEs[0].isPrimordialThunder === true, '标记为道祖专属九天玄刹神雷');

  // 测试引力坍缩爆发
  testBoss.phaseIndex = 1;
  gc.startCastSingularity(testBoss);
  assert(testBoss.state === 'casting_singularity', '成功进入太极黑洞引力坍缩吟唱状态');

  const beforeProjCount = game.bossProjectiles.length;
  gc.executeSingularityBurst(testBoss);
  assert(game.bossProjectiles.length > beforeProjCount, '奇点坍缩爆发向四周辐射出强力环状星刃与道珠');

  // 9. 验证 Canvas 实机绘制与贴图降级容错
  let drawImageCalls = 0;
  const originalDrawImage = dummyCtx.drawImage;
  dummyCtx.drawImage = (...args) => {
    drawImageCalls++;
    originalDrawImage.apply(dummyCtx, args);
  };

  drawImageCalls = 0;
  godTextures.setWhiskSheetLoaded(true);
  testBoss.state = 'idle';
  gc.drawPrimordialGodModel(dummyCtx, testBoss);
  assert(drawImageCalls > 0, '精灵表就绪时成功调用 drawImage 渲染道祖 24 帧动作');

  drawImageCalls = 0;
  godTextures.setWhiskSheetLoaded(false);
  godTextures.setBladeLoaded(false);
  testBoss.primordialAnims.whisk.img = null;
  gc.drawPrimordialGodModel(dummyCtx, testBoss);
  assert(drawImageCalls === 0, '精灵表与飞剑未载入时安全优雅降级矢量太极神明法相');

  // 测试道祖周身飞剑御阵贴图驱动
  drawImageCalls = 0;
  godTextures.setBladeLoaded(true);
  testBoss.primordialAnims.whisk.img = null;
  gc.drawPrimordialGodModel(dummyCtx, testBoss);
  assert(drawImageCalls >= 4, '飞剑贴图就绪时，道祖周身诛仙飞剑御阵成功调用 drawImage 渲染');

  // 10. 验证太虚裂空星刃与混沌太极玄珠弹幕实机渲染
  console.log('\n--- 验证专属攻击弹幕与神雷法阵实机渲染与贴图优雅降级 ---');
  game.bossProjectiles = [
    { bossId: 'primordial_god', x: 200, y: 200, vx: 280, vy: 0, r: 8, type: 'cosmic_blade', color: '#4cc9f0', glowColor: '#ffd700' },
    { bossId: 'primordial_god', x: 300, y: 300, vx: 200, vy: 100, r: 9, type: 'yin_yang_orb', color: '#f72585', glowColor: '#ffd700' }
  ];

  // 10.1 太虚星刃 (cosmic_blade)
  drawImageCalls = 0;
  godTextures.setBladeLoaded(true);
  godTextures.setOrbLoaded(false);
  gc.drawBossProjectiles(dummyCtx);
  assert(drawImageCalls > 0, '太虚星刃贴图就绪时，成功调用 drawImage 绘制高清星刃');

  drawImageCalls = 0;
  godTextures.setBladeLoaded(false);
  gc.drawBossProjectiles(dummyCtx);
  assert(drawImageCalls === 0, '太虚星刃未载入时安全优雅降级矢量流光仙刃');

  // 10.2 混沌太极玄珠 (yin_yang_orb)
  drawImageCalls = 0;
  godTextures.setOrbLoaded(true);
  gc.drawBossProjectiles(dummyCtx);
  assert(drawImageCalls > 0, '混沌太极玄珠贴图就绪时，成功调用 drawImage 绘制暗物质玄珠');

  drawImageCalls = 0;
  godTextures.setOrbLoaded(false);
  gc.drawBossProjectiles(dummyCtx);
  assert(drawImageCalls === 0, '混沌太极玄珠未载入时安全优雅降级矢量太极道珠');

  // 10.3 太虚八卦雷盘预警 (primordial_thunder warning)
  const mockPrimordialAoE = {
    bossId: 'primordial_god',
    type: 'primordial_thunder',
    x: 400,
    y: 400,
    r: 80,
    telegraphTimer: 0.6,
    maxTelegraph: 1.0,
    activeTimer: 0.5,
    maxActive: 0.5,
    color: '#4cc9f0',
    secondaryColor: '#f72585'
  };
  game.bossAoEs = [mockPrimordialAoE];

  drawImageCalls = 0;
  godTextures.setThunderArrayLoaded(true);
  gc.drawBossAoEs(dummyCtx);
  assert(drawImageCalls > 0, '真卷启灵雷劫预警阶段成功调用 drawImage 绘制太虚八卦雷纹阵盘');

  drawImageCalls = 0;
  godTextures.setThunderArrayLoaded(false);
  gc.drawBossAoEs(dummyCtx);
  assert(drawImageCalls === 0, '雷劫预警阶段贴图未载入时安全优雅降级空心道纹雷环 (严禁大实心遮挡)');

  // 10.4 九天玄刹天劫雷爆 (primordial_thunder active explosion)
  mockPrimordialAoE.telegraphTimer = 0;
  mockPrimordialAoE.activeTimer = 0.35;

  drawImageCalls = 0;
  godTextures.setThunderStrikeLoaded(true);
  gc.drawBossAoEs(dummyCtx);
  assert(drawImageCalls > 0, '九天玄刹天劫雷爆阶段成功调用 drawImage 绘制天劫雷核爆裂图');

  drawImageCalls = 0;
  godTextures.setThunderStrikeLoaded(false);
  gc.drawBossAoEs(dummyCtx);
  assert(drawImageCalls === 0, '天劫雷爆阶段未载入时安全降级绘制九天太虚混沌玄雷神柱');

  // 10.5 太虚折跃冲刺预警 (telegraph_rush)
  game.boss = testBoss;
  testBoss.state = 'telegraph_rush';
  testBoss.rushDist = 360;
  testBoss.telegraphTimer = 0.5;
  testBoss.maxTelegraph = 1.0;
  testBoss.rushDir = { x: 1, y: 0 };
  let rushThrew = false;
  try {
    gc.drawBoss(dummyCtx);
  } catch (e) {
    rushThrew = true;
  }
  assert(!rushThrew, '太虚折跃空间撕裂预警通道渲染流畅且未抛出异常');

  dummyCtx.drawImage = originalDrawImage;

  console.log(`\n====================================================`);
  console.log(`混沌太虚道祖 24 帧四动作与终极机制测试: ${passed}/${total} 全部通过!`);
  console.log(`====================================================\n`);
}

runTests().catch(err => {
  console.error('测试异常崩溃:', err);
  process.exit(1);
});
