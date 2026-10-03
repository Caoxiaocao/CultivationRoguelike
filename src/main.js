const isHeadless = typeof process !== 'undefined' && Boolean(process?.versions?.node) && !Boolean(globalThis.__FORCE_BROWSER_MODE__)
import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `<div class="app-shell">
  <!-- 1. 游戏登录主界面 -->
  <div class="screen screen-title" id="screen-title">
    <div class="title-container">
      <div class="title-badge">☯ 问道 · 凡尘入世篇</div>
      <h1 class="title-main">问道 · 秘境历练</h1>
      <p class="title-sub">斩妖荡魔悟道法 · 气贯长虹证长生</p>
      <div class="title-menu">
        <button class="btn-title" id="btn-title-start">▶ 开始游戏</button>
        <button class="btn-title special" id="btn-title-test">🎯 演武试炼 (测试关卡)</button>
        <button class="btn-title secondary" id="btn-title-codex">📖 秘境图鉴</button>
        <button class="btn-title secondary" id="btn-title-settings">⚙ 系统设置</button>
      </div>
      <div class="title-footer">WASD / 方向键 / 🎮 手柄摇杆移动 · 自动御剑索敌 · 生存 60 秒历练突破</div>
    </div>
  </div>

  <!-- 2. 角色选择及对应武器选择界面 (两段式道号与本命法宝择定) -->
  <div class="screen screen-char-select hidden" id="screen-char-select">
    <div class="char-header">
      <div>
        <h2 class="char-header-title" id="char-header-title">道号择定 · 宗门真传</h2>
        <div class="char-header-sub" id="char-header-sub">挑选入世历练弟子（八派宗门）踏入仙途</div>
      </div>
      <div class="char-header-btns">
        <button class="btn-back hidden" id="btn-weapon-back">‹ 重选道号</button>
        <button class="btn-back" id="btn-char-back">‹ 返回主页</button>
      </div>
    </div>
    
    <div class="char-select-body" id="char-select-cards"></div>

    <div class="char-actions" id="char-actions-bar" style="display:none;">
      <button class="btn-start-run" id="btn-char-confirm">踏入青冥秘境 ➔</button>
      <div class="char-gamepad-hints hidden" id="char-gamepad-hints">🎮 [LB/RB] 切换弟子 · [A] 择定道号 · [B] 返回主页</div>
    </div>
  </div>

  <!-- 2.5 秘境万象图鉴界面 -->
  <div class="screen screen-codex hidden" id="screen-codex">
    <div class="codex-header">
      <div class="codex-header-info">
        <div class="codex-title-row">
          <h2 class="codex-header-title">秘境图鉴 · 万象通玄</h2>
          <span class="codex-badge" id="codex-count-badge">已收录 54 项道法万象</span>
        </div>
        <div class="codex-header-sub">参悟诸天道法玄机 · 遍览神兵妙法与万灵百草</div>
      </div>
      <div class="codex-header-actions">
        <div class="codex-nav-tabs" id="codex-tabs">
          <button class="codex-tab active" data-cat="characters">🥋 角色图鉴</button>
          <button class="codex-tab" data-cat="weapons">⚔️ 法宝神兵</button>
          <button class="codex-tab" data-cat="cards">📜 天道卡片</button>
          <button class="codex-tab" data-cat="items">🧪 秘境遗物</button>
          <button class="codex-tab" data-cat="bosses">👹 秘境领主</button>
        </div>
        <button class="btn-back" id="btn-codex-back">‹ 返回主页</button>
      </div>
      <div class="codex-gamepad-hints hidden" id="codex-gamepad-hints">🎮 [LB/RB] 切换图鉴分类 · [↑/↓] 浏览道法 · [B] 返回主页</div>
    </div>

    <div class="codex-body">
      <!-- 左侧：项目卡片网格列表 -->
      <div class="codex-grid-wrap">
        <div class="codex-grid" id="codex-grid"></div>
      </div>

      <!-- 右侧：详鉴检视面板 -->
      <div class="codex-detail-pane" id="codex-detail"></div>
    </div>
  </div>

  <!-- 3. 全屏战斗界面（无侧边栏与日志） -->
  <div class="screen screen-game hidden" id="screen-game">
    <div class="game-viewport">
      <canvas id="game" width="960" height="540"></canvas>
      
      <!-- 演武试炼顶部专属 HUD 状态与控制栏 -->
      <div class="test-hud-toolbar hidden" id="test-hud-toolbar">
        <div class="test-hud-stat-chip title-chip">
          <span>🎯 演武试炼</span>
        </div>
        <div class="test-hud-stat-chip">
          <span class="chip-lbl">DPS</span>
          <span class="chip-val red" id="test-hud-dps">0</span>
        </div>
        <div class="test-hud-stat-chip">
          <span class="chip-lbl">总伤</span>
          <span class="chip-val gold" id="test-hud-total">0</span>
        </div>
        <div class="test-hud-stat-chip">
          <span class="chip-lbl">极值</span>
          <span class="chip-val" id="test-hud-peak">0</span>
        </div>
        <div class="test-hud-stat-chip">
          <span class="chip-lbl">命中</span>
          <span class="chip-val" id="test-hud-hits">0</span>
        </div>
        <div class="test-hud-actions">
          <button class="test-hud-btn highlight" id="test-hud-btn-panel" title="打开调整控制台 (快捷键 T)">⚙ 调整 (T)</button>
          <button class="test-hud-btn" id="test-hud-btn-dummy" title="召唤不死神木桩">🪵 召木桩</button>
          <button class="test-hud-btn" id="test-hud-btn-straw" title="召唤易爆草人群测试AOE">🌾 召草人</button>
          <button class="test-hud-btn" id="test-hud-btn-clear" title="清空所有木桩与敌人">🧹 清屏</button>
          <button class="test-hud-btn" id="test-hud-btn-reset-stat" title="重置秒伤和累计伤害统计">🔄 重置统计</button>
          <button class="test-hud-btn exit" id="test-hud-btn-exit" title="退出演武场返回主界面">🚪 退出</button>
        </div>
      </div>

      <!-- 极简全屏顶部悬浮 HUD (计时与领主血条) -->
      <div class="combat-hud">
        <div class="hud-top-center">
          <div class="hud-timer" id="timer">01:00</div>
          <div class="boss-hud-bar hidden" id="boss-hud-bar">
            <div class="boss-hud-meta">
              <span class="boss-hud-icon">☠</span>
              <span class="boss-hud-title" id="boss-hud-title">千年赤炼蛟</span>
              <span class="boss-hud-phase" id="boss-hud-phase">阶段 1/2 · 游龙翻江</span>
            </div>
            <div class="boss-hp-track-box">
              <div class="boss-hp-track">
                <div class="boss-hp-lag" id="boss-hp-lag"></div>
                <div class="boss-hp-fill" id="boss-hp-fill"></div>
              </div>
              <span class="boss-hp-val" id="boss-hp-val">1200 / 1200 (100%)</span>
            </div>
          </div>
        </div>

        <div class="hud-right">
          <div class="hud-gamepad-badge hidden" id="hud-gamepad-badge" title="法印手柄已连接">
            <span class="gamepad-badge-icon">🎮</span>
            <span class="gamepad-badge-text" id="hud-gamepad-name">手柄已连接</span>
          </div>
          <div class="hud-stat-pill"><span>斩妖</span><b id="kill-value">0</b></div>
          <div class="hud-stat-pill"><span>神识</span><b id="range-value">140</b></div>
          <button class="hud-btn-pause" id="btn-pause" title="暂停游戏 (ESC / 手柄 Start)">⏸ 暂停 (ESC)</button>
        </div>
      </div>

      <!-- 底部 HUD 栏：左侧角色面板与右侧武器槽，通过 flex 容器实现中心高度严格一致 -->
      <div class="combat-hud-bottom-bar" id="hud-bottom-bar">
        <!-- 左下角：角色立绘和血条、境界条 -->
        <div class="combat-hud-bottom-left" id="hud-bottom-left">
          <div class="char-avatar-box">
            <div class="char-avatar-ring">
              <img src="./player_anime.png" class="char-avatar-img" id="hud-char-avatar" alt="入世弟子">
              <span class="char-avatar-glow"></span>
            </div>
            <div class="char-realm-badge" id="hud-char-realm-badge">炼气</div>
          </div>

          <div class="char-status-col">
            <div class="char-status-meta">
              <span class="char-name-text" id="hud-char-name">凌虚子</span>
              <div class="realm-pill" id="arena-realm">第 1 关 · 炼气初期</div>
            </div>
            <div class="hud-bar-group">
              <div class="hud-bar-item hp-item">
                <span class="bar-lbl">生命</span>
                <div class="bar-track"><i class="bar-fill hp" id="hp-bar"></i></div>
                <b class="bar-val" id="hp-value">100 / 100</b>
              </div>
              <div class="hud-bar-item xp-item">
                <span class="bar-lbl">灵气</span>
                <div class="bar-track"><i class="bar-fill xp" id="xp-bar"></i></div>
                <b class="bar-val gold" id="xp-value">0 / 100</b>
              </div>
            </div>
          </div>
        </div>

        <!-- 右下角：武器槽（中间为本命法宝，左上右下四个槽位存放战斗中收集的法宝、灵宠） -->
        <div class="combat-hud-bottom-right" id="hud-bottom-right">
          <div class="weapon-slot-hud">
            <span id="slots-count-text" style="display: none;">0 / 4</span>
            <div class="weapon-cross-container">
              <!-- 槽位 0: 上 -->
              <div class="slot-item slot-top empty" id="offensive-slot-0" data-slot="0" title="进攻槽位：空置">
                <div class="slot-inner"></div>
              </div>
              <!-- 槽位 3: 左 -->
              <div class="slot-item slot-left empty" id="offensive-slot-3" data-slot="3" title="进攻槽位：空置">
                <div class="slot-inner"></div>
              </div>
              <!-- 核心槽位: 中 (本命法宝) -->
              <div class="slot-item slot-center" id="natal-weapon-slot" title="本命法宝">
                <div class="slot-inner"><img src="./weapon_sword.png" class="slot-img" alt="本命法宝"></div>
              </div>
              <!-- 槽位 1: 右 -->
              <div class="slot-item slot-right empty" id="offensive-slot-1" data-slot="1" title="进攻槽位：空置">
                <div class="slot-inner"></div>
              </div>
              <!-- 槽位 2: 下 -->
              <div class="slot-item slot-bottom empty" id="offensive-slot-2" data-slot="2" title="进攻槽位：空置">
                <div class="slot-inner"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3.5 进攻法宝灵宠替换选择模态窗口 -->
  <div class="modal-overlay hidden" id="modal-slot-replace">
    <div class="modal-card slot-replace-modal-card">
      <div class="modal-header">
        <h3>⚔️ 进攻法宝槽位已满（4/4）</h3>
        <button class="modal-close" id="btn-slot-replace-close">✕</button>
      </div>
      <div class="modal-body">
        <p class="slot-replace-desc">
          诸天道法四象有常。欲纳入新得道法【<b class="gold" id="replace-new-name"></b>】，请选择替换下方一件已有法宝或灵宠：
        </p>
        <div class="slot-replace-list" id="slot-replace-list"></div>
        <div class="slot-replace-actions" style="display:flex;justify-content:flex-end;">
          <button class="modal-btn secondary" id="btn-slot-replace-cancel">取消（保留现有阵容）</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. 设置模态窗口 -->
  <div class="modal-overlay hidden" id="modal-settings">
    <div class="modal-card">
      <div class="modal-header">
        <h3>系统设置 · 调息安神</h3>
        <button class="modal-close" id="btn-settings-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="settings-group">
          <div class="settings-group-title">🔊 音效与道音</div>
          <div class="settings-row">
            <span>音效总开关</span>
            <div class="settings-ctrl">
              <button class="modal-btn" id="sound-toggle"><span id="sound-icon">🔊</span> <span id="sound-text">开启</span></button>
            </div>
          </div>
          <div class="settings-row">
            <span>道音主音量</span>
            <div class="settings-ctrl">
              <input type="range" min="0" max="150" value="100" class="volume-slider" id="volume-slider">
              <span id="volume-value" style="font-size:12px;color:#dfc475;min-width:38px;">100%</span>
            </div>
          </div>
          <div class="settings-row">
            <span>音效试听</span>
            <div class="settings-ctrl">
              <button class="modal-btn" id="btn-test-sound">试听破空剑啸</button>
            </div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-title">🎮 控制器与操作指南</div>
          <div class="settings-row">
            <span>手柄触觉震动</span>
            <div class="settings-ctrl">
              <button class="modal-btn" id="btn-toggle-rumble">震动开启</button>
            </div>
          </div>
          <div class="ctrl-guide-grid">
            <div class="ctrl-guide-item"><kbd>WASD / 摇杆</kbd> <span>360°平滑御风移动</span></div>
            <div class="ctrl-guide-item"><kbd>A / Start</kbd> <span>确认、突破、进入下一关</span></div>
            <div class="ctrl-guide-item"><kbd>LB / RB</kbd> <span>快捷切换弟子、法宝与卡片</span></div>
            <div class="ctrl-guide-item"><kbd>X / Y</kbd> <span>一键放弃灵气、切换保留</span></div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-title">🖥 显示偏好</div>
          <div class="settings-row">
            <span>战斗飘字提示</span>
            <div class="settings-ctrl">
              <button class="modal-btn" id="btn-toggle-float-num">显示伤害飘字</button>
            </div>
          </div>
          <div class="settings-row">
            <span>网页全屏</span>
            <div class="settings-ctrl">
              <button class="modal-btn" id="btn-toggle-fullscreen">切换全屏显示</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn primary" id="btn-settings-save">保存并返回</button>
        <div class="settings-gamepad-hints hidden" id="settings-gamepad-hints">🎮 [↑/↓] 选择项目 · [←/→] 调整/开关 · [A] 确定 · [B / Start] 保存并返回</div>
      </div>
    </div>
  </div>

  <!-- 5. 暂停面板（洞察自身） -->
  <div class="modal-overlay hidden" id="modal-pause">
    <div class="modal-card">
      <div class="modal-header">
        <h3>修行入定 · 洞察自身</h3>
        <button class="modal-close" id="btn-pause-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="pause-panel-content">
          <div class="pause-section">
            <div class="pause-section-title">【境界与道基】</div>
            <div class="pause-stats-grid">
              <div class="pause-stat-card">
                <span>当前境界</span>
                <b class="gold" id="pause-realm">炼气初期</b>
              </div>
              <div class="pause-stat-card">
                <span>灵气修为</span>
                <b id="pause-qi">0 / 100</b>
              </div>
              <div class="pause-stat-card">
                <span>气血生机</span>
                <b id="pause-hp">100 / 100</b>
              </div>
              <div class="pause-stat-card">
                <span>体魄基底</span>
                <b id="pause-base-hp">基础 100 (+0)</b>
              </div>
            </div>
          </div>

          <div class="pause-section">
            <div class="pause-section-title">【神通与神识】</div>
            <div class="pause-stats-grid">
              <div class="pause-stat-card">
                <span>神识范围</span>
                <b class="gold" id="pause-range">140 px</b>
              </div>
              <div class="pause-stat-card">
                <span>法宝伤害</span>
                <b id="pause-attack">18 点</b>
              </div>
              <div class="pause-stat-card">
                <span>御剑频率</span>
                <b id="pause-speed">1.3 次/秒</b>
              </div>
              <div class="pause-stat-card">
                <span>御风移速</span>
                <b id="pause-movespeed">220 px/s</b>
              </div>
            </div>
          </div>

          <div class="pause-builds-box">
            <div class="pause-section-title" style="margin-bottom:8px;">【已纳道法与随身法宝】</div>
            <div class="build-tiles-grid" id="pause-build-tiles"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn" id="btn-pause-test-level" style="color:#ffd875; border-color:rgba(212,175,55,0.5);">🎯 演武试炼</button>
        <button class="modal-btn" id="btn-pause-settings">⚙ 系统设置</button>
        <button class="modal-btn" id="btn-pause-abandon" style="color:#d87b7b;">放弃重修</button>
        <button class="modal-btn primary" id="btn-pause-resume">继续历练 (ESC)</button>
        <div class="pause-gamepad-hints hidden" id="pause-gamepad-hints">🎮 [↑/↓] 选择 · [A] 确定 · [B / Start] 继续历练 · [Y] 设置 · [X] 放弃</div>
      </div>
    </div>
  </div>

  <!-- 6. 逐个清点战利品模态窗口 -->
  <div class="modal-overlay hidden" id="modal-loot-review">
    <div class="loot-review-card">
      <div class="loot-review-step" id="loot-review-step">战利品清点 · (第 1 / 1 件)</div>
      <div class="loot-review-icon-wrap" id="loot-review-icon">✧</div>
      <h3 class="loot-review-name" id="loot-review-name">法宝名</h3>
      <span class="loot-review-type" id="loot-review-type">丹药</span>
      <p class="loot-review-desc" id="loot-review-desc">效果说明</p>
      <div class="loot-review-qi" id="loot-review-qi">可熔炼化为 +20 点灵气</div>
      <div class="loot-review-actions">
        <button class="btn-loot-action keep" id="btn-loot-keep">收纳囊中 (保留)</button>
        <button class="btn-loot-action drop" id="btn-loot-drop">熔炼化气 (+灵气)</button>
      </div>
      <div class="loot-gamepad-hints hidden" id="loot-gamepad-hints">🎮 [←/→] 切换 · [A] 确认 · [Y] 收纳囊中 · [X] 熔炼化气</div>
    </div>
  </div>

  <!-- 6.5 化神飞升通关结算面板 -->
  <div class="modal-overlay hidden" id="modal-ascension">
    <div class="modal-card ascension-card">
      <div class="ascension-banner">
        <div class="ascension-emblem">☯</div>
        <h2 class="ascension-title">仙道大圆满 · 化神飞升</h2>
        <p class="ascension-quote">「踏碎诸天万界锁，神魂超脱入虚皇」</p>
      </div>
      <div class="ascension-body">
        <div class="ascension-lore">
          恭喜道友历经千难万劫，斩灭终极领主【混沌太虚道祖】！五大境界圆满无漏，凡尘因果尽断，天门大开，白日飞升，登临九天真仙之境！
        </div>
        <div class="ascension-stats-grid">
          <div class="asc-stat"><span class="asc-lbl">最终境界</span><b class="asc-val gold">化神境 · 圆满飞升</b></div>
          <div class="asc-stat"><span class="asc-lbl">通关关卡</span><b class="asc-val" id="asc-stage">第 18 关</b></div>
          <div class="asc-stat"><span class="asc-lbl">累计斩妖</span><b class="asc-val" id="asc-kills">0 尊</b></div>
          <div class="asc-stat"><span class="asc-lbl">历练总长</span><b class="asc-val" id="asc-time">00:00</b></div>
          <div class="asc-stat"><span class="asc-lbl">本命道法</span><b class="asc-val gold" id="asc-weapon">飞剑</b></div>
          <div class="asc-stat"><span class="asc-lbl">纳得珍宝</span><b class="asc-val" id="asc-loot-count">0 件</b></div>
        </div>
        <div class="ascension-choices-prompt">
          仙道已成，乾坤既定。道友今后欲往何方？
        </div>
        <div class="ascension-actions">
          <button class="btn-ascend settle" id="btn-ascend-settle">
            <span class="asc-btn-main">☯ 仙道圆满 · 结算归隐</span>
            <span class="asc-btn-sub">功成名就，白日飞升，返回大厅</span>
          </button>
          <button class="btn-ascend endless" id="btn-ascend-endless">
            <span class="asc-btn-main">⚡ 破界重霄 · 开启无尽模式</span>
            <span class="asc-btn-sub">解除时间限制，挑战永无止境的太虚妖魔，战至道陨！</span>
          </button>
        </div>
        <div class="ascension-gamepad-hint hidden" id="ascension-gamepad-hint">🎮 [左右 / LB/RB] 切换选择 · [A] 确认 · [B] 归隐 · [X/Y] 开启无尽</div>
      </div>
    </div>
  </div>

  <!-- 7. 悟道三选一卡片选择界面 (#stage-overlay) -->
  <div class="overlay hidden" id="stage-overlay">
    <div class="stage-modal-container">
      <div class="stage-modal-main">
        <div class="stage-top-section">
          <div class="stage-modal-header">
            <div class="overlay-kicker" id="stage-kicker">第 1 关 · 参悟机缘</div>
            <h2 id="stage-title">天道馈赠 · 选择一张卡片</h2>
            <p class="overlay-description" id="stage-desc">本关斩妖 0，境界 炼气初期。固定三张卡片，择一纳入构筑。</p>
          </div>
          <div class="choice-grid" id="stage-choices"></div>
        </div>

        <div class="stage-bottom-section">
          <div class="build-grid-header">
            <span class="build-grid-title">已纳道法与随身法宝（当前构筑）</span>
            <span class="build-grid-count" id="build-grid-count">共 1 件</span>
          </div>
          <div class="build-tiles-grid" id="build-tiles"></div>
        </div>
      </div>

      <!-- 右侧：角色详细属性列表 -->
      <div class="stage-modal-sidebar">
        <div class="sidebar-header">
          <h3>道基底蕴 · 详细属性</h3>
          <span class="sidebar-sub">实时修为面板统计</span>
        </div>
        <div class="stage-stats-list" id="stage-stats-list"></div>
        <div class="sidebar-footer">
          <button id="stage-continue" class="btn-confirm-stage" disabled>进入下一关</button>
          <div class="settle-gamepad-hint hidden" id="settle-gamepad-hint">🎮 [左右 / LB/RB] 切换卡片 · [A / Start] 继续</div>
        </div>
      </div>
    </div>

    <!-- 兼容 smoke-test.mjs 读写的老式结算 DOM 元素（隐藏桩） -->
    <div class="test-bridge-dom hidden" style="display:none;" aria-hidden="true">
      <span id="stage-loot-summary">0 件</span>
      <div id="stage-loot"></div>
      <button id="stage-loot-all">全部放弃</button>
    </div>
  </div>

  <!-- 3.8 演武试炼调控道台模态窗口 -->
  <div class="modal-overlay hidden" id="modal-test-panel">
    <div class="modal-card test-panel-card">
      <div class="modal-header">
        <div class="test-panel-header-title">
          <h3>🎯 演武试炼 · 调控道台</h3>
          <span class="test-panel-badge">测试模式 (按 T 快捷开关)</span>
        </div>
        <div class="test-panel-header-actions">
          <button class="test-btn-pause" id="btn-test-panel-pause">⏸ 暂停时间</button>
          <button class="modal-close" id="btn-test-panel-close">✕</button>
        </div>
      </div>
      <div class="test-panel-tabs" id="test-panel-tabs">
        <button class="test-tab-btn active" data-tab="weapons">⚔️ 神兵法宝 (24把)</button>
        <button class="test-tab-btn" data-tab="skills">📜 神通天道卡</button>
        <button class="test-tab-btn" data-tab="realms">🥋 境界与属性</button>
        <button class="test-tab-btn" data-tab="dummies">🪵 木桩与怪物</button>
        <button class="test-tab-btn" data-tab="stats">📊 伤害统计</button>
      </div>
      <div class="test-panel-body" id="test-panel-body"></div>
      <div class="modal-footer" style="justify-content: space-between; align-items: center;">
        <div class="test-footer-hints">快捷键提示：<b>T</b> 打开/折叠面板 · <b>ESC</b> 暂停游戏</div>
        <div style="display:flex; gap:10px;">
          <button class="test-btn amber" id="btn-test-quick-straw">🌾 召唤环形草人群 (16只)</button>
          <button class="test-btn" id="btn-test-panel-resume">确定并继续测试 (T)</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 兼容 smoke-test.mjs 读写的老式面板 DOM 元素（隐藏桩） -->
  <div class="test-bridge-side hidden" style="display:none;" aria-hidden="true">
    <div id="realm-name">炼气</div>
    <div id="realm-level">初期</div>
    <div id="realm-progress"></div>
    <div id="realm-caption">灵气 0 / 100</div>
    <div id="realm-next">距离炼气中期还需 100</div>
    <div id="realm-base-hp">100</div>
    <div id="realm-bonus-hp">+0</div>
    <div id="realm-range">140</div>
    <div id="threat-value">安稳</div>
    <div id="hero-status">筑基之前，皆为积累</div>
    <div id="intel-next">下一关强度</div>
    <div id="intel-loot">本关物品 0 件</div>
    <div id="build-list"></div>
    <div id="log"></div>
  </div>
</div>`

const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')
const ARENA_WIDTH = 960
const ARENA_HEIGHT = 540
const ui = {
  hp: document.querySelector('#hp-value'), xp: document.querySelector('#xp-value'), kills: document.querySelector('#kill-value'), threat: document.querySelector('#threat-value'),
  hpBar: document.querySelector('#hp-bar'), xpBar: document.querySelector('#xp-bar'),
  timer: document.querySelector('#timer'), arenaRealm: document.querySelector('#arena-realm'), realmName: document.querySelector('#realm-name'), realmLevel: document.querySelector('#realm-level'),
  realmProgress: document.querySelector('#realm-progress'), realmCaption: document.querySelector('#realm-caption'), realmNext: document.querySelector('#realm-next'),
  realmBaseHp: document.querySelector('#realm-base-hp'), realmBonusHp: document.querySelector('#realm-bonus-hp'),
  build: document.querySelector('#build-list'), log: document.querySelector('#log'), heroStatus: document.querySelector('#hero-status'),
  intelNext: document.querySelector('#intel-next'), intelLoot: document.querySelector('#intel-loot'),
  overlay: document.querySelector('#stage-overlay'), stageKicker: document.querySelector('#stage-kicker'), stageTitle: document.querySelector('#stage-title'),
  stageDesc: document.querySelector('#stage-desc'), stageChoices: document.querySelector('#stage-choices'), stageLoot: document.querySelector('#stage-loot'),
  stageLootSummary: document.querySelector('#stage-loot-summary'), stageLootAll: document.querySelector('#stage-loot-all'), stageContinue: document.querySelector('#stage-continue')
}

ui.title = ui.stageTitle;
ui.desc = ui.stageDesc;
ui.choices = ui.stageChoices;
ui.loot = ui.stageLoot;
ui.lootSummary = ui.stageLootSummary;
ui.lootAll = ui.stageLootAll;
ui.cont = ui.stageContinue;
ui.arena = ui.arenaRealm;
ui.soundToggle = document.querySelector('#sound-toggle');
ui.soundIcon = document.querySelector('#sound-icon');
ui.soundText = document.querySelector('#sound-text');

const sound = {
  enabled: true,
  volume: 1.0,
  ctx: null,
  masterGain: null,
  limiter: null,
  init() {
    if (this.ctx) return
    const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
    if (AudioCtx) {
      try {
        this.ctx = new AudioCtx()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime)

        this.limiter = this.ctx.createDynamicsCompressor()
        this.limiter.threshold.setValueAtTime(-3, this.ctx.currentTime)
        this.limiter.knee.setValueAtTime(4, this.ctx.currentTime)
        this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime)
        this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime)
        this.limiter.release.setValueAtTime(0.15, this.ctx.currentTime)

        this.masterGain.connect(this.limiter)
        this.limiter.connect(this.ctx.destination)
      } catch (e) {
        console.warn('AudioContext init failed', e)
      }
    }
  },
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  },
  setVolume(val) {
    this.volume = Math.max(0, Math.min(1.5, Number(val) || 0))
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime)
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05)
    }
  },
  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  },
  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.3, slideTo = null) {
    if (!this.enabled || isHeadless) return
    this.init()
    this.resume()
    if (!this.ctx || !this.masterGain) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const t = this.ctx.currentTime

      osc.type = type
      osc.frequency.setValueAtTime(freq, t)
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + duration)
      }

      gain.gain.setValueAtTime(Math.max(0.001, gainVal), t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(t)
      osc.stop(t + duration)
    } catch (e) {}
  },
  shoot() {
    this.playTone(880, 'triangle', 0.12, 0.45, 240)
  },
  hit() {
    this.playTone(160, 'sawtooth', 0.16, 0.55, 60)
  },
  defeat() {
    if (!this.enabled || isHeadless) return
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (this._lastDefeatSound && now - this._lastDefeatSound < 45) return
    this._lastDefeatSound = now
    this.playTone(420, 'sine', 0.18, 0.4, 180)
  },
  slam() {
    this.playTone(85, 'sawtooth', 0.28, 0.65, 35)
  },
  crash() {
    this.playTone(110, 'triangle', 0.35, 0.7, 45)
  },
  dragon() {
    this.playTone(220, 'sawtooth', 0.25, 0.55, 120)
  },
  whirlwind() {
    this.playTone(520, 'sine', 0.18, 0.45, 380)
  },
  fuchen() {
    this.playTone(660, 'sine', 0.2, 0.4, 440)
  },
  bagua() {
    this.playTone(440, 'triangle', 0.3, 0.45, 330)
  },
  singularity() {
    this.playTone(180, 'sine', 0.35, 0.5, 90)
  },
  flame() {
    this.playTone(260, 'sawtooth', 0.28, 0.5, 90)
  },
  pounce() {
    this.playTone(740, 'triangle', 0.16, 0.5, 320)
  },
  chainArc() {
    this.playTone(720, 'sawtooth', 0.16, 0.45, 140)
  },
  blazingBurst() {
    if (!this.enabled || isHeadless) return
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (this._lastBlazingBurst && now - this._lastBlazingBurst < 65) return
    this._lastBlazingBurst = now
    this.playTone(280, 'sawtooth', 0.32, 0.55, 55)
  },
  flameBrand() {
    if (!this.enabled || isHeadless) return
    this.playTone(520, 'triangle', 0.12, 0.35, 260)
  },
  levelUp() {
    if (!this.enabled || isHeadless) return
    const notes = [523.25, 659.25, 783.99, 1046.50]
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.28, 0.45, f * 1.05)
      }, idx * 75)
    })
  },
  pickup(isItem = false) {
    if (isItem) {
      this.playTone(1174.66, 'sine', 0.22, 0.5, 1318.51)
    } else {
      this.playTone(698.46, 'triangle', 0.08, 0.35, 880)
    }
  },
  click() {
    this.playTone(587.33, 'sine', 0.06, 0.3, 440)
  }
}

const characters = [
  {
    id: 'sword',
    name: '凌虚子',
    class: '剑修',
    desc: '心如止水，人剑合一。青锋所指，万魔皆伏。',
    passiveText: '剑气凌厉 · 基础攻击 +25%',
    icon: '⚔️',
    spriteUrl: './player_anime.png',
    weapons: [
      {
        id: 'sword_qingfeng',
        name: '青锋灵剑',
        icon: '🗡️',
        desc: '道门本命飞剑，御剑穿云贯穿敌阵，连续穿透并爆发青碧十字斩',
        type: 'sword',
        bulletColor: '#64e8cb',
        bulletRadius: 5,
        bulletSpeed: 370,
        shootInterval: 0.78,
        stats: { dmg: 28, spd: '1.3/s', rng: '140px', feat: '青碧剑芒 · 单点索敌贯穿' },
        apply: (g) => { g.attack = 28 }
      },
      {
        id: 'sword_jifeng',
        name: '疾风残刃',
        icon: '🗡️',
        desc: '风卷残云，翡翠双刃周身极速回旋，化为 360 度近身风暴高频切割',
        type: 'daggers',
        bulletColor: '#8bf3c0',
        bulletRadius: 4.5,
        bulletSpeed: 440,
        shootInterval: 0.55,
        stats: { dmg: 22, spd: '1.8/s', rng: '105px', feat: '翡翠双刃 · 360°回旋风暴' },
        apply: (g) => { g.attack = 22; g.attackSpeed = 1.25 }
      },
      {
        id: 'sword_benlei',
        name: '奔雷古剑',
        icon: '⚡',
        desc: '天雷淬锋，飞剑引动九天神雷落雷轰顶，并爆裂出跳跃连锁紫电',
        type: 'thunder_sword',
        bulletColor: '#a5bdf8',
        bulletRadius: 6,
        bulletSpeed: 360,
        shootInterval: 0.95,
        stats: { dmg: 26, spd: '1.1/s', rng: '150px', feat: '九天神雷 · 紫电连锁轰顶' },
        apply: (g) => { g.attack = 26; g.thunderDamage = 16 }
      }
    ],
    applyBonus: (g) => {
      g.baseAttackRange = 140
    }
  },
  {
    id: 'spell',
    name: '清虚仙子',
    class: '法修',
    desc: '道法自然，虚怀若谷。神念笼罩周天，随手摘星化气。',
    passiveText: '灵台清明 · 神识感知与拾取范围 +35',
    icon: '✨',
    spriteUrl: './player_fairy.png',
    weapons: [
      {
        id: 'spell_bagua',
        name: '八卦阵盘',
        icon: '☯️',
        desc: '乾坤道阵，在敌群脚下召唤旋转太极八卦大阵，中心阵眼多段绞杀，外围微弱',
        type: 'bagua',
        bulletColor: '#eed57d',
        bulletRadius: 6.5,
        bulletSpeed: 350,
        shootInterval: 1.10,
        stats: { dmg: 12, spd: '0.9/s', rng: '110px', feat: '乾坤道阵 · 阵眼多段/外围衰减' },
        apply: (g) => { g.attack = 12 }
      },
      {
        id: 'spell_fuchen',
        name: '灵木拂尘',
        icon: '🪶',
        desc: '万木回春，拂尘挥扫荡开扇面碧霞仙浪，微幅击退敌怪，近身伤害递减',
        type: 'fuchen',
        bulletColor: '#96e8e0',
        bulletRadius: 5.5,
        bulletSpeed: 400,
        shootInterval: 0.90,
        stats: { dmg: 12, spd: '1.1/s', rng: '110px', feat: '碧霞仙浪 · 扇形轻推/近强远弱' },
        apply: (g) => { g.attack = 12; g.bonusHp += 15; if (typeof recomputeMaxHp === 'function') recomputeMaxHp() }
      },
      {
        id: 'spell_baozhu',
        name: '混元宝珠',
        icon: '🔮',
        desc: '太虚混元之珠，祭出混元宝珠化为弱引力奇点，核心多段引力微引牵聚',
        type: 'baozhu',
        bulletColor: '#d6a8f8',
        bulletRadius: 6,
        bulletSpeed: 390,
        shootInterval: 1.15,
        stats: { dmg: 12, spd: '0.9/s', rng: '120px', feat: '星河微引 · 核心多段/弱力牵引' },
        apply: (g) => { g.attack = 12; g.bonusAttackRange = (g.bonusAttackRange || 0) + 20; if (typeof recomputeAttackRange === 'function') recomputeAttackRange() }
      }
    ],
    applyBonus: (g) => {
      g.bonusAttackRange = (g.bonusAttackRange || 0) + 30
      g.pickup += 35
      if (typeof recomputeAttackRange === 'function') recomputeAttackRange()
    }
  },
  {
    id: 'body',
    name: '铁狂徒',
    class: '体修',
    desc: '肉身通玄，气血如龙。纵有千万妖魔，难撼玄铁之躯。',
    passiveText: '金刚不坏 · 基础生命 +50，移速 +15',
    icon: '🛡️',
    spriteUrl: './player_body.png',
    weapons: [
      {
        id: 'body_ding',
        name: '九疑重鼎',
        icon: '🏺',
        desc: '厚重威严，生命上限 +30，祭出九疑重鼎沉重砸地，震中泰山压顶，外圈震波递减',
        type: 'ding',
        bulletColor: '#e69848',
        bulletRadius: 8,
        bulletSpeed: 330,
        shootInterval: 1.25,
        stats: { dmg: 15, spd: '0.8/s', rng: '110px', feat: '泰山压顶 · 鼎心重碾/外圈衰减' },
        apply: (g) => { g.attack = 15; g.bonusHp += 30; if (typeof recomputeMaxHp === 'function') recomputeMaxHp(); g.hp = g.maxHp }
      },
      {
        id: 'body_armor',
        name: '龙鳞霸甲',
        icon: '🥋',
        desc: '金甲护体，生命上限 +20，身前轰出赤金龙炎，拳心贯穿重伤，边缘扩散递减',
        type: 'dragon_armor',
        bulletColor: '#f2b836',
        bulletRadius: 6,
        bulletSpeed: 390,
        shootInterval: 0.85,
        stats: { dmg: 14, spd: '1.2/s', rng: '115px', feat: '赤金龙炎 · 拳心贯穿/掠击衰减' },
        apply: (g) => { g.attack = 14; g.bonusHp += 20; if (typeof recomputeMaxHp === 'function') recomputeMaxHp() }
      },
      {
        id: 'body_hammer',
        name: '破军金锤',
        icon: '🔨',
        desc: '刚猛沉稳，挥动巨锤重砸地面，震中核心重创裂地，外围冲击波衰减击退',
        type: 'hammer',
        bulletColor: '#ff7b30',
        bulletRadius: 8.5,
        bulletSpeed: 340,
        shootInterval: 1.18,
        stats: { dmg: 16, spd: '0.85/s', rng: '105px', feat: '撼地金锤 · 震中重创/外围衰减' },
        apply: (g) => { g.attack = 16 }
      }
    ],
    applyBonus: (g) => {
      g.baseHp += 50
      g.moveSpeed += 15
      if (typeof recomputeMaxHp === 'function') recomputeMaxHp()
      g.hp = g.maxHp
    }
  },
  {
    id: 'beast',
    name: '白灵儿',
    class: '灵兽师',
    desc: '万兽同心，灵通造化。心念一动，灵禽神兽破空助阵。',
    passiveText: '万灵共鸣 · 灵宠与随行伴生法宝伤害 +30%，拾取范围 +25',
    icon: '🐾',
    spriteUrl: './player_beast.png',
    weapons: [
      {
        id: 'beast_bell',
        name: '百兽金铃',
        icon: '🔔',
        desc: '御兽宗传承摄魂金铃，清脆摇响激荡音波，声波穿透环射并唤出一道灵兽疾影突袭前方',
        type: 'beast_bell',
        bulletColor: '#facc15',
        bulletRadius: 6,
        bulletSpeed: 380,
        shootInterval: 0.85,
        stats: { dmg: 18, spd: '1.2/s', rng: '135px', feat: '摄魂唤兽 · 金铃摄魂波+兽影破空' },
        apply: (g) => { g.attack = 18; g.petDamage = (g.petDamage || 42) * 1.15 }
      },
      {
        id: 'beast_lash',
        name: '缚兽玄绫',
        icon: '🪢',
        desc: '千年灵兽鬃丝炼就的缚兽彩绫，挥甩如游龙破空，横扫抽击周围弧形敌怪并强力击退',
        type: 'beast_lash',
        bulletColor: '#38bdf8',
        bulletRadius: 5.5,
        bulletSpeed: 420,
        shootInterval: 0.90,
        stats: { dmg: 20, spd: '1.1/s', rng: '120px', feat: '神索横空 · 弧形重抽/强韧束缚' },
        apply: (g) => { g.attack = 20 }
      },
      {
        id: 'beast_horn',
        name: '唤灵法螺',
        icon: '🐚',
        desc: '上古巨鲲背脊灵螺，长鸣号角引动兽潮虚影，召唤两只飞天苍鹰虚影从两侧交错穿刺目标',
        type: 'beast_horn',
        bulletColor: '#e0f2fe',
        bulletRadius: 6.5,
        bulletSpeed: 360,
        shootInterval: 1.18,
        stats: { dmg: 24, spd: '0.85/s', rng: '160px', feat: '苍鹰巡天 · 双翼交叉袭杀' },
        apply: (g) => { g.attack = 24 }
      }
    ],
    applyBonus: (g) => {
      g.petDamage = Math.round((g.petDamage || 42) * 1.30)
      g.pickup += 25
    }
  },
  {
    id: 'formation_master',
    name: '诸葛玄清',
    class: '阵法师',
    desc: '胸罗星汉，手点乾坤。步罡踏斗之间，万千杀阵落子生根。',
    passiveText: '奇门遁甲 · 阵法威力 +35%，神识感知范围 +30',
    icon: '🔯',
    spriteUrl: './player_formation.png',
    weapons: [
      {
        id: 'formation_flag',
        name: '四象诛邪旗',
        icon: '🚩',
        desc: '青龙白虎朱雀玄武四象灵旗，掷入敌阵插地成阵，引动四象雷火结界连续灼烧围困妖魔',
        type: 'formation_flag',
        bulletColor: '#fb7185',
        bulletRadius: 6,
        bulletSpeed: 350,
        shootInterval: 1.10,
        stats: { dmg: 13, spd: '0.9/s', rng: '130px', feat: '四象大阵 · 插旗连线结界绞杀' },
        apply: (g) => { g.attack = 13; g.formationPower = (g.formationPower || 1) * 1.2 }
      },
      {
        id: 'formation_chess',
        name: '天星弈棋',
        icon: '♟️',
        desc: '以天地为棋盘，以黑白二子断生死。在地面接连落子，黑白棋子共鸣爆发阴阳天劫星光',
        type: 'formation_chess',
        bulletColor: '#c084fc',
        bulletRadius: 6,
        bulletSpeed: 370,
        shootInterval: 1.0,
        stats: { dmg: 15, spd: '1.0/s', rng: '140px', feat: '阴阳落子 · 黑白共鸣天劫爆破' },
        apply: (g) => { g.attack = 15 }
      },
      {
        id: 'formation_ruler',
        name: '量天玉尺',
        icon: '📏',
        desc: '量天测地之九宫玉尺，横空一量划出九宫封绝禁界，重力骤增并造成持续迟滞挤压破损',
        type: 'formation_ruler',
        bulletColor: '#34d399',
        bulletRadius: 5.5,
        bulletSpeed: 390,
        shootInterval: 1.05,
        stats: { dmg: 14, spd: '0.95/s', rng: '125px', feat: '九宫禁绝 · 划界锁足/重力重压' },
        apply: (g) => { g.attack = 14 }
      }
    ],
    applyBonus: (g) => {
      g.formationPower = (g.formationPower || 1) * 1.35
      g.bonusAttackRange = (g.bonusAttackRange || 0) + 30
      if (typeof recomputeAttackRange === 'function') recomputeAttackRange()
    }
  },
  {
    id: 'alchemist',
    name: '云舒',
    class: '丹药师',
    desc: '神农传世，百草通神。炼九转还魂仙丹，投毒煞蚀骨宝火。',
    passiveText: '百草回阳 · 丹药与恢复效果 +50%，生命上限 +15',
    icon: '🌿',
    spriteUrl: './player_alchemist.png',
    weapons: [
      {
        id: 'pill_furnace',
        name: '紫金八卦炉',
        icon: '⚗️',
        desc: '悬浮周身的小型紫金丹炉，炉盖开启向前方喷出三昧丹火与滚烫药气，范围灼烧并遗留毒煞',
        type: 'pill_furnace',
        bulletColor: '#f97316',
        bulletRadius: 6.5,
        bulletSpeed: 360,
        shootInterval: 1.0,
        stats: { dmg: 13, spd: '1.0/s', rng: '120px', feat: '丹火漫天 · 扇形热浪/附带药煞' },
        apply: (g) => { g.attack = 13 }
      },
      {
        id: 'pill_pestle',
        name: '碧玉药王杵',
        icon: '🪄',
        desc: '通灵翠玉捣药仙杵，御空旋转砸向敌群，爆发翠绿回春与碎骨剧毒双重药气环',
        type: 'pill_pestle',
        bulletColor: '#10b981',
        bulletRadius: 7,
        bulletSpeed: 380,
        shootInterval: 0.90,
        stats: { dmg: 15, spd: '1.1/s', rng: '125px', feat: '药杵捣地 · 药煞碎骨/翠雾震荡' },
        apply: (g) => { g.attack = 15; g.bonusHp += 10; if (typeof recomputeMaxHp === 'function') recomputeMaxHp() }
      },
      {
        id: 'pill_poison',
        name: '千草腐仙葫',
        icon: '🧪',
        desc: '淬炼千草剧毒之紫木葫芦，抛射出三枚剧毒爆裂丹丸，在地面炸裂成漫天腐蚀绿雾',
        type: 'pill_poison',
        bulletColor: '#84cc16',
        bulletRadius: 5.5,
        bulletSpeed: 340,
        shootInterval: 1.18,
        stats: { dmg: 14, spd: '0.85/s', rng: '135px', feat: '剧毒丹丸 · 三发爆裂/腐蚀毒雾' },
        apply: (g) => { g.attack = 14 }
      }
    ],
    applyBonus: (g) => {
      g.bonusHp += 15
      g.healBonus = 1.5
      if (typeof recomputeMaxHp === 'function') recomputeMaxHp()
      g.hp = g.maxHp
    }
  },
  {
    id: 'demon',
    name: '厉苍溟',
    class: '魔修',
    desc: '顺我者生，逆我者死。吞噬诸天生灵血海，以杀止杀铸就魔神。',
    passiveText: '嗜血狂魔 · 击败妖物有 20% 几率吸取 1 点气血，基础伤害 +15%',
    icon: '🩸',
    spriteUrl: './player_demon.png',
    weapons: [
      {
        id: 'demon_blade',
        name: '化血狂刀',
        icon: '🗡️',
        desc: '上古魔道至凶血刃，凌空斩出猩红半月血煞刀芒，撕裂路径所有妖魔并附带击退',
        type: 'demon_blade',
        bulletColor: '#ef4444',
        bulletRadius: 6.5,
        bulletSpeed: 400,
        shootInterval: 1.0,
        stats: { dmg: 25, spd: '1.0/s', rng: '130px', feat: '血煞半月 · 贯穿撕裂/猩红刀芒' },
        apply: (g) => { g.attack = 25 }
      },
      {
        id: 'demon_claws',
        name: '天魔血煞爪',
        icon: '🧤',
        desc: '魔神骸骨淬炼的漆黑血爪，隔空撕裂出三道巨大血红利爪暗劲，交错抓爆虚空',
        type: 'demon_claws',
        bulletColor: '#dc2626',
        bulletRadius: 5,
        bulletSpeed: 430,
        shootInterval: 0.80,
        stats: { dmg: 21, spd: '1.25/s', rng: '115px', feat: '幽冥血爪 · 三重撕裂/暗劲爆破' },
        apply: (g) => { g.attack = 21; g.attackSpeed = 1.15 }
      },
      {
        id: 'demon_seal',
        name: '修罗血皇玺',
        icon: '🩸',
        desc: '修罗血海凝炼之古印，祭起如血岳悬空，重重印入地面爆发四方血浪冲天与骷髅咆哮',
        type: 'demon_seal',
        bulletColor: '#991b1b',
        bulletRadius: 8,
        bulletSpeed: 330,
        shootInterval: 1.18,
        stats: { dmg: 16, spd: '0.85/s', rng: '120px', feat: '血海降世 · 修罗血浪/魔印震天' },
        apply: (g) => { g.attack = 16 }
      }
    ],
    applyBonus: (g) => {
      g.lifestealChance = 0.20
      g.attack = Math.round((g.attack || 18) * 1.15)
    }
  },
  {
    id: 'ghost',
    name: '幽月',
    class: '鬼修',
    desc: '阴司黄泉，百鬼夜行。生魂不度归忘川，引魂引路渡幽冥。',
    passiveText: '黄泉无相 · 角色受击无敌时间延长 50%，移速 +10',
    icon: '👻',
    spriteUrl: './player_ghost.png',
    weapons: [
      {
        id: 'ghost_lantern',
        name: '幽冥引魂灯',
        icon: '🏮',
        desc: '忘川河畔引魂青铜古灯，悬浮肩侧释放漂浮碧磷鬼火，自动索敌追击并穿透妖魔',
        type: 'ghost_lantern',
        bulletColor: '#2dd4bf',
        bulletRadius: 5.5,
        bulletSpeed: 370,
        shootInterval: 0.77,
        stats: { dmg: 19, spd: '1.3/s', rng: '150px', feat: '幽冥鬼火 · 自动追踪/碧磷焚魂' },
        apply: (g) => { g.attack = 19 }
      },
      {
        id: 'ghost_wand',
        name: '白骨哀丧棒',
        icon: '🦯',
        desc: '幽冥无常哭丧法棒，挥舞之间百鬼齐哭，震荡出一圈凄厉苍白环状音煞，惊骇推散群妖',
        type: 'ghost_wand',
        bulletColor: '#e2e8f0',
        bulletRadius: 6,
        bulletSpeed: 380,
        shootInterval: 1.0,
        stats: { dmg: 14, spd: '1.0/s', rng: '115px', feat: '万鬼同哭 · 苍白鬼环/恐惧震退' },
        apply: (g) => { g.attack = 14 }
      },
      {
        id: 'ghost_banner',
        name: '百鬼聚灵幡',
        icon: '🏴',
        desc: '封印万千冤魂的漆黑长幡，振幡一摇，数道凄厉怨魂厉鬼尖啸着飞扑撕咬最近的敌怪',
        type: 'ghost_banner',
        bulletColor: '#a7f3d0',
        bulletRadius: 6.5,
        bulletSpeed: 350,
        shootInterval: 1.10,
        stats: { dmg: 17, spd: '0.9/s', rng: '140px', feat: '百鬼夜行 · 厉鬼扑击/持续撕咬' },
        apply: (g) => { g.attack = 17 }
      }
    ],
    applyBonus: (g) => {
      g.invulnBonus = 0.5
      g.moveSpeed += 10
    }
  }
]

// 为所有角色的武器初始化挂载高清法宝贴图路径
characters.forEach(c => {
  if (c.weapons) {
    c.weapons.forEach(w => {
      if (!w.image) w.image = `./weapon_${w.type}.png`
    })
  }
})

function getWeaponDef(type) {
  for (const c of characters) {
    for (const w of c.weapons) {
      if (w.id === type || w.type === type) {
        if (!w.image) w.image = `./weapon_${w.type}.png`
        return w
      }
    }
  }
  return {
    id: 'sword',
    name: '流云飞剑',
    type: 'sword',
    image: './weapon_sword.png',
    bulletColor: '#64e8cb',
    bulletRadius: 5,
    bulletSpeed: 370,
    shootInterval: 0.78,
    stats: { dmg: 28, spd: '1.3/s', rng: '140px', feat: '青碧剑芒 · 自动索敌贯穿' }
  }
}

let selectedCharIndex = 0
let selectedWeaponIndex = 0

const enemyWispImg = typeof Image !== 'undefined' ? new Image() : null
let enemyWispLoaded = false
if (enemyWispImg) {
  enemyWispImg.src = './enemy_wisp.png'
  enemyWispImg.onload = () => { enemyWispLoaded = true }
}

const enemyWispSheetImg = typeof Image !== 'undefined' ? new Image() : null
let enemyWispSheetLoaded = false
if (enemyWispSheetImg) {
  enemyWispSheetImg.src = './enemy_wisp_sheet.png'
  enemyWispSheetImg.onload = () => { enemyWispSheetLoaded = true }
}

const enemyBruteImg = typeof Image !== 'undefined' ? new Image() : null
let enemyBruteLoaded = false
if (enemyBruteImg) {
  enemyBruteImg.src = './enemy_brute.png'
  enemyBruteImg.onload = () => { enemyBruteLoaded = true }
}

const enemyBruteSheetImg = typeof Image !== 'undefined' ? new Image() : null
let enemyBruteSheetLoaded = false
if (enemyBruteSheetImg) {
  enemyBruteSheetImg.src = './enemy_brute_sheet.png'
  enemyBruteSheetImg.onload = () => { enemyBruteSheetLoaded = true }
}

const enemyFrostBruteImg = typeof Image !== 'undefined' ? new Image() : null
let enemyFrostBruteLoaded = false
if (enemyFrostBruteImg) {
  enemyFrostBruteImg.src = './enemy_frost_brute.png'
  enemyFrostBruteImg.onload = () => { enemyFrostBruteLoaded = true }
}

const enemyFrostBruteSheetImg = typeof Image !== 'undefined' ? new Image() : null
let enemyFrostBruteSheetLoaded = false
if (enemyFrostBruteSheetImg) {
  enemyFrostBruteSheetImg.src = './enemy_frost_brute_sheet.png'
  enemyFrostBruteSheetImg.onload = () => { enemyFrostBruteSheetLoaded = true }
}

const frostCrystalImg = typeof Image !== 'undefined' ? new Image() : null
let frostCrystalLoaded = false
if (frostCrystalImg) {
  frostCrystalImg.src = './effect_frost_crystal.png'
  frostCrystalImg.onload = () => { frostCrystalLoaded = true }
}

// 8 大修仙职业专属高清立绘贴图加载器
const charSprites = {
  sword: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_anime.png', w: 64, h: 64 },
  spell: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_fairy.png', w: 64, h: 64 },
  body: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_body.png', w: 68, h: 68 },
  beast: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_beast.png', w: 64, h: 64 },
  formation_master: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_formation.png', w: 64, h: 64 },
  alchemist: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_alchemist.png', w: 64, h: 64 },
  demon: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_demon.png', w: 68, h: 68 },
  ghost: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_ghost.png', w: 64, h: 64 },
}
if (!isHeadless) {
  for (const k in charSprites) {
    const s = charSprites[k]
    if (s.img) {
      s.img.src = s.src
      s.img.onload = () => { s.loaded = true }
    }
  }
}

// 凌虚子（剑修）与清虚仙子（法修）本命法宝专属动作序列帧贴图 (Action Spritesheets)
// 6 帧动画（3 列 × 2 行，每帧 180×180）：0:待机蓄势, 1:移步起手, 2:蓄劲引势, 3:招式巅峰, 4:破空余韵, 5:敛息收招
// 注意：序列帧里只有角色本体与法术光效，法宝本体由 drawFloatingWeapons 单独绘制，两者不可重复
const playerWeaponSheets = {
  sword_qingfeng: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_sword_qingfeng_sheet.png', frameW: 180, frameH: 180, cols: 3, rows: 2, totalFrames: 6 },
  sword_jifeng: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_sword_jifeng_sheet.png', frameW: 180, frameH: 180, cols: 3, rows: 2, totalFrames: 6 },
  sword_benlei: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_sword_benlei_sheet.png', frameW: 180, frameH: 180, cols: 3, rows: 2, totalFrames: 6 },
  spell_bagua: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_spell_bagua_sheet.png', frameW: 180, frameH: 180, cols: 3, rows: 2, totalFrames: 6 },
  spell_fuchen: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_spell_fuchen_sheet.png', frameW: 180, frameH: 180, cols: 3, rows: 2, totalFrames: 6 },
  spell_baozhu: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './player_spell_baozhu_sheet.png', frameW: 180, frameH: 180, cols: 3, rows: 2, totalFrames: 6 },
}
playerWeaponSheets['sword'] = playerWeaponSheets.sword_qingfeng
playerWeaponSheets['daggers'] = playerWeaponSheets.sword_jifeng
playerWeaponSheets['thunder_sword'] = playerWeaponSheets.sword_benlei
playerWeaponSheets['bagua'] = playerWeaponSheets.spell_bagua
playerWeaponSheets['fuchen'] = playerWeaponSheets.spell_fuchen
playerWeaponSheets['baozhu'] = playerWeaponSheets.spell_baozhu

if (!isHeadless) {
  for (const k in playerWeaponSheets) {
    const ws = playerWeaponSheets[k]
    if (ws.img && !ws.img.src) {
      ws.img.src = ws.src
      ws.img.onload = () => { ws.loaded = true }
    }
  }
}

function getPlayerWeaponSheet(p) {
  if (!p) return null
  const charId = p.charId || 'sword'
  const curWeapon = (game.weapons && game.weapons[0]) || {}
  const wId = p.weaponId || curWeapon.id || ''
  const wType = p.weaponType || curWeapon.weaponType || curWeapon.type || ''
  const sheet = playerWeaponSheets[wId] || playerWeaponSheets[wType]
  if (sheet) return sheet
  // 只有剑修在未匹配到时才回退到默认青锋灵剑序列帧（保持既有行为）；
  // 法修等其余职业没有对应帧集时返回 null，平滑回退到各自专属立绘
  return charId === 'sword' ? playerWeaponSheets.sword_qingfeng : null
}

const playerAnimeImg = charSprites.sword.img
let playerAnimeLoaded = false
if (playerAnimeImg) {
  playerAnimeImg.onload = () => { playerAnimeLoaded = true; charSprites.sword.loaded = true }
}

const mapImg = typeof Image !== 'undefined' ? new Image() : null
let mapLoaded = false
if (mapImg) {
  mapImg.src = './map_arena.jpg'
  mapImg.onload = () => { mapLoaded = true }
}

const dropQiImg = typeof Image !== 'undefined' ? new Image() : null
let dropQiLoaded = false
if (!isHeadless && dropQiImg) {
  dropQiImg.src = './drop_qi.png'
  dropQiImg.onload = () => { dropQiLoaded = true }
}

const dropItemImg = typeof Image !== 'undefined' ? new Image() : null
let dropItemLoaded = false
if (!isHeadless && dropItemImg) {
  dropItemImg.src = './drop_item.png'
  dropItemImg.onload = () => { dropItemLoaded = true }
}

const dropHealImg = typeof Image !== 'undefined' ? new Image() : null
let dropHealLoaded = false
if (!isHeadless && dropHealImg) {
  dropHealImg.src = './drop_heal.png'
  dropHealImg.onload = () => { dropHealLoaded = true }
}

// 24 大本命法宝专属高清透明贴图加载器
const weaponSprites = {
  // 剑修 3 大法宝
  sword: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_sword.png' },
  daggers: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_daggers.png' },
  thunder_sword: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_thunder_sword.png' },
  // 法修 3 大法宝
  bagua: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_bagua.png' },
  fuchen: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_fuchen.png' },
  baozhu: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_baozhu.png' },
  // 体修 3 大法宝
  ding: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_ding.png' },
  dragon_armor: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_dragon_armor.png' },
  hammer: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_hammer.png' },
  // 灵兽师 3 大法宝
  beast_bell: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_beast_bell.png' },
  beast_lash: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_beast_lash.png' },
  beast_horn: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_beast_horn.png' },
  // 阵法师 3 大法宝
  formation_flag: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_formation_flag.png' },
  formation_chess: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_formation_chess.png' },
  formation_ruler: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_formation_ruler.png' },
  // 丹药师 3 大法宝
  pill_furnace: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_pill_furnace.png' },
  pill_pestle: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_pill_pestle.png' },
  pill_poison: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_pill_poison.png' },
  // 魔修 3 大法宝
  demon_blade: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_demon_blade.png' },
  demon_claws: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_demon_claws.png' },
  demon_seal: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_demon_seal.png' },
  // 鬼修 3 大法宝
  ghost_lantern: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_ghost_lantern.png' },
  ghost_wand: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_ghost_wand.png' },
  ghost_banner: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './weapon_ghost_banner.png' },
}

if (!isHeadless) {
  for (const k in weaponSprites) {
    const s = weaponSprites[k]
    if (s.img) {
      s.img.src = s.src
      s.img.onload = () => { s.loaded = true }
    }
  }
}

// 卡片技能与灵兽专属高清透明贴图加载器 (赤炎葫芦、青羽灵狐等)
const skillSprites = {
  gourd: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './skill_gourd.png' },
  fox: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './skill_fox.png' },
  chain_lightning: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './skill_chain_lightning.png' },
  effect_chain_arc: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './effect_chain_arc.png' },
  skill_blazing_fire: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './skill_blazing_fire.png' },
  effect_fire_burst: { img: typeof Image !== 'undefined' ? new Image() : null, loaded: false, src: './effect_fire_burst.png' }
}

if (!isHeadless) {
  for (const k in skillSprites) {
    const s = skillSprites[k]
    if (s.img) {
      s.img.src = s.src
      s.img.onload = () => { s.loaded = true }
    }
  }
}

// ==========================================
// 仙侠法宝多样化攻击与专属升级系统 (Special Attacks & Upgrades System)
// ==========================================

function damageEnemy(enemy, amount, color = '#ffd166') {
  if (!enemy || enemy.hp <= 0) return
  if (typeof recordTestDamage === 'function') {
    recordTestDamage(amount, enemy)
  }
  if (typeof game !== 'undefined' && game && game._currentAttackIsPrimary) {
    if ((game.chainArcLevel || 0) > 0) {
      triggerChainArc(enemy, amount)
    }
    if ((game.blazingFireLevel || 0) > 0) {
      applyBlazingFireBrand(enemy, amount)
    }
  }
  if (enemy.isBoss && typeof damageBoss === 'function') {
    damageBoss(amount)
    if (!isHeadless && typeof spawnHitImpact === 'function') {
      spawnHitImpact(enemy.x, enemy.y, color || '#ffbe0b', 7)
    }
    return
  }
  if (enemy.isBossPart) {
    const dmg = Math.max(1, Math.round(amount))
    enemy.hp -= dmg
    if (enemy.armRef) {
      enemy.armRef.hp = Math.max(0, enemy.armRef.hp - dmg)
      enemy.armRef.hit = 0.16
    }
    enemy.hit = Math.max(enemy.hit || 0, 0.16)
    if (!isHeadless && typeof spawnHitImpact === 'function') {
      spawnHitImpact(enemy.x, enemy.y, color || '#06d6a0', 5)
    }
    if (!isHeadless && typeof game !== 'undefined' && game && game.damageNumbers) {
      game.damageNumbers.push({
        x: enemy.x + (Math.random() - 0.5) * 16,
        y: enemy.y - (enemy.r || 12) - 8,
        text: dmg,
        color: '#06d6a0',
        life: 0.65,
        maxLife: 0.65
      })
    }
    if (enemy.hp <= 0) defeat(enemy)
    return
  }
  const dmg = Math.max(1, Math.round(amount))
  enemy.hp -= amount
  if (enemy.isDummy && enemy.immortal) {
    enemy.hp = enemy.maxHp
  }
  enemy.hit = Math.max(enemy.hit || 0, 0.16)
  if (!isHeadless && typeof spawnHitImpact === 'function') {
    spawnHitImpact(enemy.x, enemy.y, color, 4)
  }
  if (!isHeadless && typeof game !== 'undefined' && game && game.damageNumbers) {
    game.damageNumbers.push({
      x: enemy.x + (Math.random() - 0.5) * 16,
      y: enemy.y - (enemy.r || 12) - 8,
      text: dmg,
      color: color || '#ffd166',
      life: 0.65,
      maxLife: 0.65
    })
  }
  if (enemy.hp <= 0) defeat(enemy)
}

function initSpecialAttackSound(soundObj) {
  if (!soundObj) return
  soundObj.slam = function() {
    this.playTone(85, 'sawtooth', 0.28, 0.7, 35)
  }
  soundObj.crash = function() {
    this.playTone(110, 'triangle', 0.35, 0.75, 45)
  }
  soundObj.dragon = function() {
    this.playTone(220, 'sawtooth', 0.25, 0.6, 120)
  }
  soundObj.whirlwind = function() {
    this.playTone(520, 'sine', 0.18, 0.45, 380)
  }
  soundObj.fuchen = function() {
    this.playTone(660, 'sine', 0.2, 0.45, 440)
  }
  soundObj.bagua = function() {
    this.playTone(440, 'triangle', 0.3, 0.5, 330)
  }
  soundObj.singularity = function() {
    this.playTone(180, 'sine', 0.35, 0.55, 90)
  }
  soundObj.bell = function() {
    this.playTone(880, 'sine', 0.22, 0.45, 660)
  }
  soundObj.slash = function() {
    this.playTone(320, 'sawtooth', 0.18, 0.5, 90)
  }
  soundObj.curse = function() {
    this.playTone(220, 'triangle', 0.25, 0.45, 110)
  }
  soundObj.wail = function() {
    this.playTone(550, 'sine', 0.35, 0.4, 280)
  }
  soundObj.poison = function() {
    this.playTone(350, 'sine', 0.16, 0.35, 180)
  }
}

// 辅助渲染武器贴图或矢量回退
function drawWeaponSpriteOrFallback(ctx, wType, x, y, angle, size = 44, glowColor = '#ffd700', fallbackFn = null) {
  if (typeof weaponSprites !== 'undefined' && weaponSprites[wType] && weaponSprites[wType].loaded && weaponSprites[wType].img) {
    ctx.save()
    ctx.translate(x, y)
    let angleOffset = 0
    if (wType === 'sword' || wType === 'thunder_sword' || wType === 'demon_blade' || wType === 'beast_horn') {
      angleOffset = Math.PI * 0.25 // image tip is at -45 deg, rotate +45 deg to align with travel direction
    } else if (wType === 'daggers') {
      angleOffset = -Math.PI * 0.25 // image tip is at +45 deg, rotate -45 deg to align with travel direction
    } else if (wType === 'pill_pestle' || wType === 'ghost_wand') {
      angleOffset = Math.PI * 0.20
    } else if (wType === 'ghost_banner' || wType === 'formation_flag') {
      angleOffset = -Math.PI * 0.15
    }
    ctx.rotate(angle + angleOffset)
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 14
    ctx.drawImage(weaponSprites[wType].img, -size / 2, -size / 2, size, size)
    ctx.restore()
  } else if (fallbackFn) {
    fallbackFn(ctx, x, y, angle)
  }
}

// 各武器专属升级路线派发函数 (Upgrades route by weapon type)
function upgradePrimaryWeapon(targetWeapon) {
  const wType = game.player.weaponType || 'sword'
  const item = game.weapons[0] || targetWeapon

  if (isHeadless || wType === 'sword') {
    game.attack += 12
    if (item) {
      item.count = (item.count || 1) + 1
      item.detail = `追踪飞剑 · 伤害 ${game.attack} (×${item.count})`
    }
    return
  }

  // 专属升级路线：无法增加数量的武器，升级伤害、范围与攻击频率（线性平稳成长，避免数值失衡）
  switch (wType) {
    case 'hammer':
      game.attack = Math.round(game.attack + 4)
      game.attackSpeed = Math.min(1.35, game.attackSpeed * 1.04)
      game.hammerRadiusBonus = Math.min(25, (game.hammerRadiusBonus || 0) + 6)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `破军金锤 · 伤害 ${game.attack} · 裂地范围 +${game.hammerRadiusBonus}px (强化 Lv.${item.upgrades})`
      }
      break

    case 'ding':
      game.attack = Math.round(game.attack + 4)
      game.attackSpeed = Math.min(1.25, game.attackSpeed * 1.04)
      game.dingRadiusBonus = Math.min(25, (game.dingRadiusBonus || 0) + 6)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `九疑重鼎 · 伤害 ${game.attack} · 镇压范围 +${game.dingRadiusBonus}px (强化 Lv.${item.upgrades})`
      }
      break

    case 'dragon_armor':
      game.attack = Math.round(game.attack + 3)
      game.attackSpeed = Math.min(1.5, game.attackSpeed * 1.05)
      game.dragonRangeBonus = Math.min(30, (game.dragonRangeBonus || 0) + 8)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `赤龙霸甲 · 伤害 ${game.attack} · 狂龙范围 +${game.dragonRangeBonus}px (强化 Lv.${item.upgrades})`
      }
      break

    case 'baozhu':
      game.attack = Math.round(game.attack + 3)
      game.baozhuRadiusBonus = Math.min(25, (game.baozhuRadiusBonus || 0) + 6)
      game.attackSpeed = Math.min(1.3, game.attackSpeed * 1.04)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `混元宝珠 · 伤害 ${game.attack} · 涡旋范围 +${game.baozhuRadiusBonus}px (强化 Lv.${item.upgrades})`
      }
      break

    case 'bagua':
      game.attack = Math.round(game.attack + 3)
      game.baguaRadiusBonus = Math.min(25, (game.baguaRadiusBonus || 0) + 6)
      game.attackSpeed = Math.min(1.3, game.attackSpeed * 1.04)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `八卦玄盘 · 伤害 ${game.attack} · 阵法范围 +${game.baguaRadiusBonus}px (强化 Lv.${item.upgrades})`
      }
      break

    case 'fuchen':
      game.attack = Math.round(game.attack + 3)
      game.fuchenRangeBonus = Math.min(25, (game.fuchenRangeBonus || 0) + 6)
      game.attackSpeed = Math.min(1.5, game.attackSpeed * 1.05)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `灵木拂尘 · 伤害 ${game.attack} · 仙风范围 +${game.fuchenRangeBonus}px (强化 Lv.${item.upgrades})`
      }
      break

    case 'daggers':
      game.attack = Math.round(game.attack + 4)
      game.daggerRangeBonus = Math.min(25, (game.daggerRangeBonus || 0) + 8)
      game.attackSpeed = Math.min(2.2, game.attackSpeed * 1.08)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `疾风残刃 · 伤害 ${game.attack} · 回旋射程 +${game.daggerRangeBonus}px (强化 Lv.${item.upgrades})`
      }
      break

    case 'thunder_sword':
      game.attack = Math.round(game.attack + 6)
      game.thunderChainBonus = Math.min(4, (game.thunderChainBonus || 0) + 1)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `奔雷古剑 · 伤害 ${game.attack} · 连锁目标 +${game.thunderChainBonus} (强化 Lv.${item.upgrades})`
      }
      break

    case 'beast_bell':
    case 'beast_lash':
    case 'beast_horn':
    case 'formation_flag':
    case 'formation_chess':
    case 'formation_ruler':
    case 'pill_furnace':
    case 'pill_pestle':
    case 'pill_poison':
    case 'demon_blade':
    case 'demon_claws':
    case 'demon_seal':
    case 'ghost_lantern':
    case 'ghost_wand':
    case 'ghost_banner':
      game.attack = Math.round(game.attack + 4)
      game.attackSpeed = Math.min(2.0, game.attackSpeed * 1.05)
      if (item) {
        item.upgrades = (item.upgrades || 1) + 1
        item.detail = `${item.name} · 伤害 ${game.attack} (强化 Lv.${item.upgrades})`
      }
      break

    default:
      game.attack += 8
      if (item) {
        item.count = (item.count || 1) + 1
        item.detail = `追踪飞剑 · 伤害 ${game.attack} (×${item.count})`
      }
      break
  }
}

function executeWeaponAttack(target, angleOffset = 0, damage = game.attack, color = '#e2c66e', radius = 5) {
  const angle = Math.atan2(target.y - game.player.y, target.x - game.player.x) + angleOffset
  const wType = game.player.weaponType || 'sword'
  const def = getWeaponDef(wType)
  const actualDamage = damage || game.attack

  game.player.attackTimer = 0.28
  game.player.attackAngle = angle

  // Headless mode: keep classic projectile behavior to pass smoke-test.mjs
  if (isHeadless) {
    shootClassic(target, angleOffset, actualDamage, color, radius)
    return
  }

  // --- 1. 破军金锤 (Hammer): 飞出下砸再飞回 (Throw -> Slam -> Return Boomerang) ---
  if (wType === 'hammer') {
    const distToTarget = Math.hypot(target.x - game.player.x, target.y - game.player.y)
    const throwDist = Math.min(distToTarget, 150 + (game.hammerRadiusBonus || 0) * 0.4)
    const targetX = game.player.x + Math.cos(angle) * throwDist
    const targetY = game.player.y + Math.sin(angle) * throwDist

    game.specialAttacks.push({
      type: 'hammer_strike',
      phase: 'fly_out', // 'fly_out' -> 'slam' -> 'return'
      startX: game.player.x,
      startY: game.player.y,
      x: game.player.x,
      y: game.player.y,
      targetX,
      targetY,
      angle,
      spin: 0,
      phaseTimer: 0.22,
      phaseDuration: 0.22,
      radius: 16,
      maxRadius: 85 + (game.hammerRadiusBonus || 0),
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#ff7b30'
    })
    if (!isHeadless) sound.shoot?.()
    return
  }

  // --- 2. 九疑重鼎 (Ding): 泰山压顶 (Launch Arc -> Cauldron Crash -> Golden Essence Recall) ---
  if (wType === 'ding') {
    const distToTarget = Math.hypot(target.x - game.player.x, target.y - game.player.y)
    const throwDist = Math.min(distToTarget, 160 + (game.dingRadiusBonus || 0) * 0.4)
    const targetX = game.player.x + Math.cos(angle) * throwDist
    const targetY = game.player.y + Math.sin(angle) * throwDist

    game.specialAttacks.push({
      type: 'ding_crush',
      phase: 'launch', // 'launch' -> 'crash' -> 'recall'
      startX: game.player.x,
      startY: game.player.y,
      x: game.player.x,
      y: game.player.y,
      targetX,
      targetY,
      spin: 0,
      phaseTimer: 0.32,
      phaseDuration: 0.32,
      radius: 18,
      maxRadius: 90 + (game.dingRadiusBonus || 0),
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#e69848'
    })
    if (!isHeadless) sound.shoot?.()
    return
  }

  // --- 3. 龙鳞霸甲 (Dragon Armor): 狂龙出海 赤龙拳劲破空贯通 ---
  if (wType === 'dragon_armor') {
    const range = 115 + (game.dragonRangeBonus || 0)
    game.specialAttacks.push({
      type: 'dragon_fist',
      x: game.player.x,
      y: game.player.y,
      angle,
      range,
      progress: 0,
      duration: 0.32,
      life: 0.32,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#f2b836'
    })
    if (!isHeadless) sound.dragon?.()
    return
  }

  // --- 4. 疾风残刃 (Daggers): 翡翠飞刀回旋斩 (Flying Dagger Boomerang) ---
  if (wType === 'daggers') {
    const distToTarget = Math.hypot(target.x - game.player.x, target.y - game.player.y)
    const throwDist = Math.min(distToTarget + 40, 135 + (game.daggerRangeBonus || 0))

    game.specialAttacks.push({
      type: 'flying_dagger_boomerang',
      startX: game.player.x,
      startY: game.player.y,
      x: game.player.x,
      y: game.player.y,
      angle,
      dist: throwDist,
      spin: 0,
      phaseTimer: 0.44,
      phaseDuration: 0.44,
      radius: 12,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#8bf3c0',
      size: 38,
      trail: []
    })
    if (!isHeadless) sound.whirlwind?.()
    return
  }

  // --- 5. 灵木拂尘 (Fuchen): 三重碧霄扇面仙风 (Triple Crescent Breeze Waves) ---
  if (wType === 'fuchen') {
    const range = 110 + (game.fuchenRangeBonus || 0)
    game.specialAttacks.push({
      type: 'fuchen_wave',
      x: game.player.x,
      y: game.player.y,
      angle,
      fanAngle: Math.PI * 0.61, // ~110 度
      range,
      duration: 0.32,
      life: 0.32,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#96e8e0'
    })
    if (!isHeadless) sound.fuchen?.()
    return
  }

  // --- 6. 八卦阵盘 (Bagua): 太极八卦天衍大阵 持续诛邪法域 ---
  if (wType === 'bagua') {
    const maxR = 80 + (game.baguaRadiusBonus || 0)
    game.specialAttacks.push({
      type: 'bagua_field',
      x: target.x,
      y: target.y,
      radius: maxR,
      duration: 1.0,
      life: 1.0,
      tickTimer: 0.25,
      damage: actualDamage,
      color: '#eed57d'
    })
    if (!isHeadless) sound.bagua?.()
    return
  }

  // --- 7. 混元宝珠 (Baozhu): 星河引力黑洞 聚怪吸附与引力爆裂 ---
  if (wType === 'baozhu') {
    const maxR = 85 + (game.baozhuRadiusBonus || 0)
    game.specialAttacks.push({
      type: 'singularity',
      startX: game.player.x,
      startY: game.player.y,
      x: target.x,
      y: target.y,
      radius: maxR,
      duration: 0.9,
      life: 0.9,
      tickTimer: 0.25,
      damage: actualDamage,
      color: '#d6a8f8'
    })
    if (!isHeadless) sound.singularity?.()
    return
  }

  // --- 8. 奔雷古剑 (Thunder Sword): 紫电贯日 · 天劫落雷 (Flying Thunder Sword) ---
  if (wType === 'thunder_sword') {
    const distToTarget = Math.hypot(target.x - game.player.x, target.y - game.player.y)
    const throwDist = Math.min(distToTarget, 160)
    const targetX = game.player.x + Math.cos(angle) * throwDist
    const targetY = game.player.y + Math.sin(angle) * throwDist

    game.specialAttacks.push({
      type: 'flying_thunder_sword',
      phase: 'flight', // 'flight' -> 'strike' -> 'recall'
      startX: game.player.x,
      startY: game.player.y,
      x: game.player.x,
      y: game.player.y,
      targetX,
      targetY,
      angle,
      speed: 520,
      phaseTimer: Math.max(0.12, throwDist / 520),
      phaseDuration: Math.max(0.12, throwDist / 520),
      radius: 14,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#a5bdf8',
      size: 46,
      trail: []
    })
    if (!isHeadless) sound.shoot?.()
    return
  }

  // --- 9. 青锋灵剑 (Sword): 御剑索敌贯穿 (Flying Sword Strike) ---
  if (wType === 'sword') {
    const distToTarget = Math.hypot(target.x - game.player.x, target.y - game.player.y)
    const thrustDist = Math.max(160, Math.min(distToTarget + 60, 240))
    const targetX = game.player.x + Math.cos(angle) * thrustDist
    const targetY = game.player.y + Math.sin(angle) * thrustDist

    game.specialAttacks.push({
      type: 'flying_sword_strike',
      phase: 'thrust', // 'thrust' -> 'return'
      startX: game.player.x,
      startY: game.player.y,
      x: game.player.x,
      y: game.player.y,
      targetX,
      targetY,
      angle,
      speed: 480,
      phaseTimer: thrustDist / 480,
      phaseDuration: thrustDist / 480,
      radius: 14,
      pierce: 3,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#64e8cb',
      size: 44,
      trail: []
    })
    if (!isHeadless) sound.shoot?.()
    return
  }

  // --- 10. 百兽金铃 (Beast Bell): 摄魂金铃音波 + 兽影破空飞扑 ---
  if (wType === 'beast_bell') {
    game.specialAttacks.push({
      type: 'beast_bell_sonic',
      x: game.player.x,
      y: game.player.y,
      angle,
      range: 135,
      life: 0.35,
      duration: 0.35,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#facc15'
    })
    if (!isHeadless) sound.bell?.()
    return
  }

  // --- 11. 缚兽玄绫 (Beast Lash): 灵索大弧抽击 ---
  if (wType === 'beast_lash') {
    game.specialAttacks.push({
      type: 'beast_whip_arc',
      x: game.player.x,
      y: game.player.y,
      angle,
      range: 120,
      life: 0.28,
      duration: 0.28,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#38bdf8'
    })
    if (!isHeadless) sound.whirlwind?.()
    return
  }

  // --- 12. 唤灵法螺 (Beast Horn): 双鹰巡天交叉袭杀 ---
  if (wType === 'beast_horn') {
    game.specialAttacks.push({
      type: 'beast_eagle_cross',
      startX: game.player.x,
      startY: game.player.y,
      targetX: target.x,
      targetY: target.y,
      angle,
      life: 0.40,
      duration: 0.40,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#e0f2fe'
    })
    if (!isHeadless) sound.dragon?.()
    return
  }

  // --- 13. 四象诛邪旗 (Formation Flag): 四方阵旗连线结界 ---
  if (wType === 'formation_flag') {
    game.specialAttacks.push({
      type: 'formation_flag_field',
      x: target.x,
      y: target.y,
      radius: 65,
      life: 0.90,
      duration: 0.90,
      tickTimer: 0.22,
      damage: Math.round(actualDamage * 0.45),
      color: '#fb7185'
    })
    if (!isHeadless) sound.bagua?.()
    return
  }

  // --- 14. 天星弈棋 (Formation Chess): 黑白落子阴阳爆鸣 ---
  if (wType === 'formation_chess') {
    game.specialAttacks.push({
      type: 'formation_chess_yin_yang',
      x: target.x,
      y: target.y,
      life: 0.38,
      duration: 0.38,
      radius: 55,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#c084fc'
    })
    if (!isHeadless) sound.crash?.()
    return
  }

  // --- 15. 量天玉尺 (Formation Ruler): 九宫划界重力锁足 ---
  if (wType === 'formation_ruler') {
    game.specialAttacks.push({
      type: 'formation_ruler_grid',
      x: target.x,
      y: target.y,
      size: 90,
      life: 0.85,
      duration: 0.85,
      tickTimer: 0.25,
      damage: Math.round(actualDamage * 0.42),
      color: '#34d399'
    })
    if (!isHeadless) sound.curse?.()
    return
  }

  // --- 16. 紫金八卦炉 (Pill Furnace): 三昧丹火与药煞浓烟扇面 ---
  if (wType === 'pill_furnace') {
    game.specialAttacks.push({
      type: 'furnace_flame_cone',
      x: game.player.x,
      y: game.player.y,
      angle,
      range: 120,
      life: 0.35,
      duration: 0.35,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#f97316'
    })
    if (!isHeadless) sound.flame?.()
    return
  }

  // --- 17. 碧玉药王杵 (Pill Pestle): 捣药碎骨药气震荡环 ---
  if (wType === 'pill_pestle') {
    game.specialAttacks.push({
      type: 'pestle_pound_ring',
      targetX: target.x,
      targetY: target.y,
      radius: 55,
      life: 0.36,
      duration: 0.36,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#10b981'
    })
    if (!isHeadless) sound.slam?.()
    return
  }

  // --- 18. 千草腐仙葫 (Poison Gourd): 三枚剧毒丹丸腐蚀酸雾 ---
  if (wType === 'pill_poison') {
    for (const offset of [-0.22, 0, 0.22]) {
      const a = angle + offset
      const dist = Math.min(140, Math.hypot(target.x - game.player.x, target.y - game.player.y) + (offset === 0 ? 0 : 20))
      game.specialAttacks.push({
        type: 'poison_pellet_pool',
        startX: game.player.x,
        startY: game.player.y,
        targetX: game.player.x + Math.cos(a) * dist,
        targetY: game.player.y + Math.sin(a) * dist,
        x: game.player.x,
        y: game.player.y,
        phase: 'fly',
        phaseTimer: 0.22,
        phaseDuration: 0.22,
        life: 0.75,
        duration: 0.75,
        radius: 36,
        damage: Math.round(actualDamage * 0.45),
        color: '#84cc16'
      })
    }
    if (!isHeadless) sound.poison?.()
    return
  }

  // --- 19. 化血狂刀 (Demon Blade): 猩红半月狂斩 ---
  if (wType === 'demon_blade') {
    game.specialAttacks.push({
      type: 'demon_blood_crescent',
      x: game.player.x,
      y: game.player.y,
      vx: Math.cos(angle) * 440,
      vy: Math.sin(angle) * 440,
      angle,
      range: 160,
      life: 0.40,
      duration: 0.40,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#ef4444'
    })
    if (!isHeadless) sound.slash?.()
    return
  }

  // --- 20. 天魔血煞爪 (Demon Claws): 虚空三爪暗劲 ---
  if (wType === 'demon_claws') {
    game.specialAttacks.push({
      type: 'demon_claw_marks',
      x: target.x,
      y: target.y,
      angle,
      life: 0.32,
      duration: 0.32,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#dc2626'
    })
    if (!isHeadless) sound.slash?.()
    return
  }

  // --- 21. 修罗血皇玺 (Demon Seal): 血岳坠地冲天血浪 ---
  if (wType === 'demon_seal') {
    game.specialAttacks.push({
      type: 'asura_blood_seal',
      targetX: target.x,
      targetY: target.y,
      life: 0.42,
      duration: 0.42,
      radius: 65,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#991b1b'
    })
    if (!isHeadless) sound.crash?.()
    return
  }

  // --- 22. 幽冥引魂灯 (Ghost Lantern): 碧磷追踪鬼火 ---
  if (wType === 'ghost_lantern') {
    for (let i = 0; i < 2; i++) {
      game.specialAttacks.push({
        type: 'nether_ghost_wisp',
        x: game.player.x + (i === 0 ? -16 : 16),
        y: game.player.y - 12,
        vx: Math.cos(angle + (i === 0 ? -0.4 : 0.4)) * 260,
        vy: Math.sin(angle + (i === 0 ? -0.4 : 0.4)) * 260,
        target,
        life: 0.85,
        damage: Math.round(actualDamage * 0.65),
        color: '#2dd4bf'
      })
    }
    if (!isHeadless) sound.shoot?.()
    return
  }

  // --- 23. 白骨哀丧棒 (Ghost Wand): 苍白鬼环音煞推怪 ---
  if (wType === 'ghost_wand') {
    game.specialAttacks.push({
      type: 'mourning_wail_ring',
      x: game.player.x,
      y: game.player.y,
      range: 115,
      life: 0.32,
      duration: 0.32,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#e2e8f0'
    })
    if (!isHeadless) sound.wail?.()
    return
  }

  // --- 24. 百鬼聚灵幡 (Ghost Banner): 怨魂恶鬼螺旋穿刺 ---
  if (wType === 'ghost_banner') {
    game.specialAttacks.push({
      type: 'ghost_parade_swarm',
      x: game.player.x,
      y: game.player.y,
      angle,
      range: 150,
      life: 0.45,
      duration: 0.45,
      damage: actualDamage,
      hitEnemies: new Set(),
      color: '#a7f3d0'
    })
    if (!isHeadless) sound.wail?.()
    return
  }
}

function shootClassic(target, angleOffset = 0, damage = game.attack, color = '#e2c66e', radius = 5) {
  const angle = Math.atan2(target.y - game.player.y, target.x - game.player.x) + angleOffset
  const wType = game.player.weaponType || 'sword'
  const def = getWeaponDef(wType)
  const projSpeed = def.bulletSpeed || 370
  const projColor = (color && color !== '#e2c66e') ? color : (def.bulletColor || '#e2c66e')
  const projRadius = (radius && radius !== 5) ? radius : (def.bulletRadius || 5)
  const projKind = (color === '#e9865b') ? 'fire' : (def.type || wType)
  game.projectiles.push({
    x: game.player.x,
    y: game.player.y,
    vx: Math.cos(angle) * projSpeed,
    vy: Math.sin(angle) * projSpeed,
    r: projRadius,
    life: 1.4,
    damage,
    color: projColor,
    kind: projKind
  })
  game.player.attackTimer = 0.28
  game.player.attackAngle = angle
  if (!isHeadless) {
    const now = performance.now()
    if (!game._lastShootSfx || now - game._lastShootSfx > 100) {
      sound.shoot()
      game._lastShootSfx = now
    }
  }
}

function updateSpecialAttacks(dt) {
  if (!game.specialAttacks) game.specialAttacks = []
  const p = game.player

  for (const atk of [...game.specialAttacks]) {
    // 1. 破军金锤 (Hammer): 飞出 -> 下砸震裂 -> 飞回手心
    if (atk.type === 'hammer_strike') {
      atk.phaseTimer -= dt

      if (atk.phase === 'fly_out') {
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        atk.x = atk.startX + (atk.targetX - atk.startX) * prog
        atk.y = atk.startY + (atk.targetY - atk.startY) * prog
        atk.spin += dt * 32

        // 飞掷路径微弱刮伤
        for (const enemy of game.enemies) {
          if (!atk.hitEnemies.has(enemy) && distance(atk, enemy) < 22 + (enemy.r || 12)) {
            atk.hitEnemies.add(enemy)
            damageEnemy(enemy, Math.max(1, Math.round(atk.damage * 0.2)), '#ff9920')
            burst(enemy.x, enemy.y, '#ff9920', 2, 15)
          }
        }

        if (atk.phaseTimer <= 0) {
          atk.phase = 'slam'
          atk.phaseTimer = 0.28
          atk.phaseDuration = 0.28
          atk.x = atk.targetX
          atk.y = atk.targetY
          atk.slamRadius = 16
          atk.hitEnemies = new Set()
          if (!isHeadless) sound.slam?.()
          game.cameraShake = 0.16
          burst(atk.x, atk.y, '#ff7b30', 14, 65)
        }
      } else if (atk.phase === 'slam') {
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        atk.slamRadius = 16 + (atk.maxRadius - 16) * Math.sin(prog * Math.PI * 0.5)

        for (const enemy of game.enemies) {
          const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
          if (d <= atk.slamRadius + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
            atk.hitEnemies.add(enemy)
            const kAngle = Math.atan2(enemy.y - atk.y, enemy.x - atk.x)
            enemy.x += Math.cos(kAngle) * 22
            enemy.y += Math.sin(kAngle) * 22
            // 范围中心基准伤害，外围平滑衰减至 0.55x
            const maxR = Math.max(1, atk.maxRadius)
            const distRatio = Math.min(1, d / maxR)
            const falloff = distRatio <= 0.35 ? 1.0 : Math.max(0.55, 1.0 - ((distRatio - 0.35) / 0.65) * 0.45)
            damageEnemy(enemy, atk.damage * falloff, '#ff7b30')
            burst(enemy.x, enemy.y, '#ff7b30', 4, 30)
          }
        }

        if (atk.phaseTimer <= 0) {
          atk.phase = 'return'
          atk.phaseTimer = 0.26
          atk.phaseDuration = 0.26
          atk.hitEnemies = new Set()
          if (!isHeadless) sound.shoot?.()
        }
      } else if (atk.phase === 'return') {
        atk.spin -= dt * 28
        const dx = p.x - atk.x
        const dy = p.y - atk.y
        const distToPlayer = Math.hypot(dx, dy)

        if (distToPlayer <= 26 || atk.phaseTimer <= 0) {
          if (!isHeadless) burst(p.x, p.y - 7, '#ffd700', 6, 35)
          atk.finished = true
        } else {
          const returnSpeed = Math.max(480, (distToPlayer / Math.max(0.01, atk.phaseTimer)))
          atk.x += (dx / distToPlayer) * returnSpeed * dt
          atk.y += (dy / distToPlayer) * returnSpeed * dt

          for (const enemy of game.enemies) {
            if (!atk.hitEnemies.has(enemy) && distance(atk, enemy) < 22 + (enemy.r || 12)) {
              atk.hitEnemies.add(enemy)
              damageEnemy(enemy, Math.max(1, Math.round(atk.damage * 0.2)), '#ffaa40')
              burst(enemy.x, enemy.y, '#ffaa40', 2, 15)
            }
          }
        }
      }
    }

    // 2. 九疑重鼎 (Ding): 抛物线飞砸 -> 震地重压 -> 符光遁回
    else if (atk.type === 'ding_crush') {
      atk.phaseTimer -= dt

      if (atk.phase === 'launch') {
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        atk.x = atk.startX + (atk.targetX - atk.startX) * prog
        atk.y = atk.startY + (atk.targetY - atk.startY) * prog
        atk.arcY = -Math.sin(prog * Math.PI) * 90

        if (atk.phaseTimer <= 0) {
          atk.phase = 'crash'
          atk.phaseTimer = 0.35
          atk.phaseDuration = 0.35
          atk.x = atk.targetX
          atk.y = atk.targetY
          atk.arcY = 0
          atk.crashRadius = 18
          atk.hitEnemies = new Set()
          if (!isHeadless) sound.crash?.()
          game.cameraShake = 0.20
          burst(atk.x, atk.y, '#e69848', 16, 70)
        }
      } else if (atk.phase === 'crash') {
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        atk.crashRadius = 18 + (atk.maxRadius - 18) * prog

        for (const enemy of game.enemies) {
          const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
          if (d <= atk.crashRadius + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
            atk.hitEnemies.add(enemy)
            // 径向衰减：鼎心基准伤害，外围气浪衰减至 0.55x
            const maxR = Math.max(1, atk.maxRadius)
            const distRatio = Math.min(1, d / maxR)
            const falloff = distRatio <= 0.35 ? 1.0 : Math.max(0.55, 1.0 - ((distRatio - 0.35) / 0.65) * 0.45)
            damageEnemy(enemy, atk.damage * falloff, atk.color)
            burst(enemy.x, enemy.y, atk.color, 5, 35)
          }
        }

        if (atk.phaseTimer <= 0) {
          atk.phase = 'recall'
          atk.phaseTimer = 0.18
        }
      } else if (atk.phase === 'recall') {
        if (atk.phaseTimer <= 0) {
          atk.finished = true
        }
      }
    }

    // 3. 龙鳞霸甲 (Dragon Armor): 赤龙冲拳贯通
    else if (atk.type === 'dragon_fist') {
      atk.life -= dt
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const curDist = atk.range * prog
      const tipX = atk.x + Math.cos(atk.angle) * curDist
      const tipY = atk.y + Math.sin(atk.angle) * curDist

      for (const enemy of game.enemies) {
        const d = distance({ x: tipX, y: tipY }, enemy)
        if (!atk.hitEnemies.has(enemy) && d < 28 + (enemy.r || 12)) {
          atk.hitEnemies.add(enemy)
          // 龙拳拳心基准伤害，外圈掠伤衰减至 0.55x
          const falloff = d <= 18 ? 1.0 : Math.max(0.55, 1.0 - ((d - 18) / 26) * 0.45)
          damageEnemy(enemy, atk.damage * falloff, atk.color)
          burst(enemy.x, enemy.y, atk.color, 4, 25)
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 4. 疾风残刃 (Daggers): 翡翠飞刀回旋斩 (Flying Dagger Boomerang)
    else if (atk.type === 'flying_dagger_boomerang') {
      atk.phaseTimer -= dt
      const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
      atk.spin += dt * 32

      if (!atk.trail) atk.trail = []
      atk.trail.unshift({ x: atk.x, y: atk.y, spin: atk.spin, life: 0.14 })
      for (const t of atk.trail) t.life -= dt
      atk.trail = atk.trail.filter(t => t.life > 0)

      // 弧月回旋轨迹：向前飞掷并划出弧月回旋归位
      const forward = Math.sin(prog * Math.PI) * atk.dist
      const side = Math.sin(prog * Math.PI * 2) * (atk.dist * 0.35)
      atk.x = atk.startX + Math.cos(atk.angle) * forward - Math.sin(atk.angle) * side
      atk.y = atk.startY + Math.sin(atk.angle) * forward + Math.cos(atk.angle) * side

      for (const enemy of game.enemies) {
        if (!atk.hitEnemies.has(enemy) && distance(atk, enemy) < 14 + (enemy.r || 12)) {
          atk.hitEnemies.add(enemy)
          damageEnemy(enemy, atk.damage, '#8bf3c0')
          burst(enemy.x, enemy.y, '#8bf3c0', 4, 20)
        }
      }

      if (atk.phaseTimer <= 0) {
        burst(atk.x, atk.y, '#8bf3c0', 3, 14)
        atk.finished = true
      }
    }

    // 5. 灵木拂尘 (Fuchen): 碧霞仙风扇面
    else if (atk.type === 'fuchen_wave') {
      atk.life -= dt
      atk.x = p.x
      atk.y = p.y
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const curRange = atk.range * prog

      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
        if (d <= curRange + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          const enemyAngle = Math.atan2(enemy.y - atk.y, enemy.x - atk.x)
          let diff = Math.abs(enemyAngle - atk.angle)
          while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2)
          if (diff <= atk.fanAngle * 0.5) {
            atk.hitEnemies.add(enemy)
            enemy.x += Math.cos(enemyAngle) * 16
            enemy.y += Math.sin(enemyAngle) * 16
            // 扇面中心与贴身基准伤害，外缘衰减
            const distRatio = Math.min(1, d / Math.max(1, atk.range))
            const angleRatio = diff / (atk.fanAngle * 0.5)
            const falloff = Math.max(0.55, 1.0 - distRatio * 0.3 - angleRatio * 0.15)
            damageEnemy(enemy, atk.damage * falloff, atk.color)
            burst(enemy.x, enemy.y, atk.color, 3, 20)
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 6. 八卦阵盘 (Bagua): 太极八卦天衍大阵
    else if (atk.type === 'bagua_field') {
      atk.life -= dt
      atk.tickTimer -= dt
      if (atk.tickTimer <= 0) {
        atk.tickTimer = 0.25
        const tickDmg = atk.damage / 4
        for (const enemy of game.enemies) {
          const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
          if (d <= atk.radius + (enemy.r || 12)) {
            // 太极阵眼 1.15x，外环衰减至 0.65x
            const distRatio = Math.min(1, d / Math.max(1, atk.radius))
            const falloff = distRatio <= 0.35 ? 1.15 : Math.max(0.65, 1.15 - ((distRatio - 0.35) / 0.65) * 0.5)
            damageEnemy(enemy, Math.max(1, tickDmg * falloff), atk.color)
            burst(enemy.x, enemy.y, atk.color, 2, 16)
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 7. 混元宝珠 (Baozhu): 星河微引黑洞
    else if (atk.type === 'singularity') {
      atk.life -= dt
      atk.tickTimer -= dt
      // 微弱引力牵引聚怪（不锁怪）
      for (const enemy of game.enemies) {
        const dx = atk.x - enemy.x
        const dy = atk.y - enemy.y
        const d = Math.hypot(dx, dy)
        if (d < atk.radius && d > 12) {
          const pullSpeed = 30 * (1 - d / atk.radius)
          enemy.x += (dx / d) * pullSpeed * dt
          enemy.y += (dy / d) * pullSpeed * dt
        }
      }
      if (atk.tickTimer <= 0) {
        atk.tickTimer = 0.25
        const tickDmg = atk.damage / 4
        for (const enemy of game.enemies) {
          const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
          if (d <= atk.radius) {
            // 奇点中心 1.15x，外围衰减至 0.65x
            const distRatio = Math.min(1, d / Math.max(1, atk.radius))
            const falloff = distRatio <= 0.35 ? 1.15 : Math.max(0.65, 1.15 - ((distRatio - 0.35) / 0.65) * 0.5)
            damageEnemy(enemy, Math.max(1, tickDmg * falloff), atk.color)
          }
        }
      }
      if (atk.life <= 0) {
        burst(atk.x, atk.y, atk.color, 8, 40)
        atk.finished = true
      }
    }

    // 8. 青锋灵剑 (Sword): 御剑索敌贯穿飞剑
    else if (atk.type === 'flying_sword_strike') {
      atk.phaseTimer -= dt
      if (!atk.trail) atk.trail = []
      atk.trail.unshift({ x: atk.x, y: atk.y, angle: atk.angle, life: 0.16 })
      for (const t of atk.trail) t.life -= dt
      atk.trail = atk.trail.filter(t => t.life > 0)

      if (atk.phase === 'thrust') {
        atk.x += Math.cos(atk.angle) * atk.speed * dt
        atk.y += Math.sin(atk.angle) * atk.speed * dt

        // 穿透检测
        for (const enemy of game.enemies) {
          if (!atk.hitEnemies.has(enemy) && distance(atk, enemy) < 14 + (enemy.r || 12)) {
            atk.hitEnemies.add(enemy)
            damageEnemy(enemy, atk.damage, '#64e8cb')
            burst(enemy.x, enemy.y, '#64e8cb', 5, 25)
            atk.pierce--
            if (atk.pierce <= 0) {
              atk.phase = 'return'
              atk.phaseTimer = 0.26
              atk.phaseDuration = 0.26
              break
            }
          }
        }

        if (atk.phaseTimer <= 0 && atk.phase === 'thrust') {
          atk.phase = 'return'
          atk.phaseTimer = 0.26
          atk.phaseDuration = 0.26
        }
      } else if (atk.phase === 'return') {
        const dx = p.x - atk.x
        const dy = p.y - atk.y
        const d = Math.hypot(dx, dy)
        if (d < 30 || atk.phaseTimer <= 0) {
          burst(atk.x, atk.y, '#64e8cb', 3, 15)
          atk.finished = true
        } else {
          atk.angle = Math.atan2(dy, dx)
          atk.x += Math.cos(atk.angle) * (atk.speed * 1.15) * dt
          atk.y += Math.sin(atk.angle) * (atk.speed * 1.15) * dt
        }
      }
    }

    // 9. 奔雷古剑 (Thunder Sword): 紫电贯日 · 天劫落雷
    else if (atk.type === 'flying_thunder_sword') {
      atk.phaseTimer -= dt
      if (!atk.trail) atk.trail = []
      atk.trail.unshift({ x: atk.x, y: atk.y, angle: atk.angle, life: 0.16 })
      for (const t of atk.trail) t.life -= dt
      atk.trail = atk.trail.filter(t => t.life > 0)

      if (atk.phase === 'flight') {
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        atk.x = atk.startX + (atk.targetX - atk.startX) * prog
        atk.y = atk.startY + (atk.targetY - atk.startY) * prog

        if (atk.phaseTimer <= 0) {
          atk.phase = 'strike'
          atk.phaseTimer = 0.18
          atk.phaseDuration = 0.18
          atk.x = atk.targetX
          atk.y = atk.targetY

          // 天劫落雷轰顶
          game.zaps.push({ x: atk.x, y: atk.y, life: 0.35 })
          burst(atk.x, atk.y, '#a5bdf8', 12, 45)
          game.cameraShake = 0.12
          if (!isHeadless) sound.crash?.()

          // 核心落雷伤害
          for (const enemy of game.enemies) {
            if (distance(atk, enemy) < 45 + (enemy.r || 12)) {
              damageEnemy(enemy, atk.damage, '#a5bdf8')
            }
          }

          // 连锁闪电弹射
          const maxChains = 2 + (game.thunderChainBonus || 0)
          let chained = 0
          for (const enemy of game.enemies) {
            if (distance(atk, enemy) >= 30 && distance(atk, enemy) < 140 && chained < maxChains) {
              damageEnemy(enemy, atk.damage * 0.46, '#a5bdf8')
              game.zaps.push({ x: enemy.x, y: enemy.y, life: 0.25 })
              burst(enemy.x, enemy.y, '#a5bdf8', 4, 25)
              chained++
            }
          }
        }
      } else if (atk.phase === 'strike') {
        if (atk.phaseTimer <= 0) {
          atk.phase = 'recall'
          atk.phaseTimer = 0.22
          atk.phaseDuration = 0.22
        }
      } else if (atk.phase === 'recall') {
        const dx = p.x - atk.x
        const dy = p.y - atk.y
        const d = Math.hypot(dx, dy)
        if (d < 30 || atk.phaseTimer <= 0) {
          burst(atk.x, atk.y, '#a5bdf8', 4, 18)
          atk.finished = true
        } else {
          atk.angle = Math.atan2(dy, dx)
          atk.x += Math.cos(atk.angle) * (atk.speed * 1.2) * dt
          atk.y += Math.sin(atk.angle) * (atk.speed * 1.2) * dt
        }
      }
    }

    // 10. 赤炎葫芦 (Gourd Flame Beam): 灼热火线持续喷射
    else if (atk.type === 'gourd_flame_beam') {
      atk.life -= dt
      atk.tickTimer -= dt

      // 跟踪主角葫芦口位置
      atk.startX = p.x + 22
      atk.startY = p.y - 20

      const endX = atk.startX + Math.cos(atk.angle) * atk.length
      const endY = atk.startY + Math.sin(atk.angle) * atk.length

      // 火流喷射粒子
      if (Math.random() < 0.45 && !isHeadless) {
        const spreadDist = Math.random() * atk.length
        const px = atk.startX + Math.cos(atk.angle) * spreadDist + (Math.random() - 0.5) * 12
        const py = atk.startY + Math.sin(atk.angle) * spreadDist + (Math.random() - 0.5) * 12
        game.particles.push({
          x: px,
          y: py,
          vx: Math.cos(atk.angle) * 120 + (Math.random() - 0.5) * 40,
          vy: Math.sin(atk.angle) * 120 + (Math.random() - 0.5) * 40,
          life: 0.22,
          color: Math.random() < 0.5 ? '#ff4d00' : '#ffaa00'
        })
      }

      if (atk.tickTimer <= 0) {
        atk.tickTimer = 0.08
        const segDx = endX - atk.startX
        const segDy = endY - atk.startY
        const segLenSq = segDx * segDx + segDy * segDy || 1

        for (const enemy of game.enemies) {
          const ex = enemy.x - atk.startX
          const ey = enemy.y - atk.startY
          const u = Math.max(0, Math.min(1, (ex * segDx + ey * segDy) / segLenSq))
          const closeX = atk.startX + u * segDx
          const closeY = atk.startY + u * segDy
          const d = Math.hypot(enemy.x - closeX, enemy.y - closeY)

          if (d <= atk.width * 0.5 + (enemy.r || 12)) {
            damageEnemy(enemy, atk.damage * 0.36, '#ff6a18')
            burst(enemy.x, enemy.y, '#ff7b30', 3, 20)
            const pushAngle = Math.atan2(enemy.y - closeY, enemy.x - closeX)
            enemy.x += Math.cos(pushAngle) * 5
            enemy.y += Math.sin(pushAngle) * 5
          }
        }
      }

      if (atk.life <= 0) atk.finished = true
    }

    // 11. 青羽灵狐扑击冲击波与爪痕
    else if (atk.type === 'fox_claw_impact') {
      atk.life -= dt
      if (atk.life <= 0) atk.finished = true
    }

    // 12. 百兽金铃 (Beast Bell): 摄魂金铃金色音波扩散
    else if (atk.type === 'beast_bell_sonic') {
      atk.life -= dt
      atk.x = p.x
      atk.y = p.y
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const curR = atk.range * (0.3 + prog * 0.7)
      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
        if (d <= curR + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          const eAngle = Math.atan2(enemy.y - atk.y, enemy.x - atk.x)
          let diff = Math.abs(eAngle - atk.angle)
          while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2)
          if (diff <= Math.PI * 0.45) {
            atk.hitEnemies.add(enemy)
            const falloff = Math.max(0.6, 1.0 - (d / atk.range) * 0.4)
            damageEnemy(enemy, atk.damage * falloff, atk.color)
            burst(enemy.x, enemy.y, atk.color, 3, 20)
            enemy.x += Math.cos(eAngle) * 12
            enemy.y += Math.sin(eAngle) * 12
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 13. 缚兽玄绫 (Beast Lash): 灵索大弧扫击
    else if (atk.type === 'beast_whip_arc') {
      atk.life -= dt
      atk.x = p.x
      atk.y = p.y
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const sweepAngle = atk.angle - Math.PI * 0.5 + prog * Math.PI
      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
        if (d <= atk.range + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          const eAngle = Math.atan2(enemy.y - atk.y, enemy.x - atk.x)
          let diff = Math.abs(eAngle - sweepAngle)
          while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2)
          if (diff <= 0.45) {
            atk.hitEnemies.add(enemy)
            damageEnemy(enemy, atk.damage, atk.color)
            burst(enemy.x, enemy.y, atk.color, 4, 22)
            enemy.x += Math.cos(eAngle) * 18
            enemy.y += Math.sin(eAngle) * 18
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 14. 唤灵法螺 (Beast Horn): 双鹰交叉巡天
    else if (atk.type === 'beast_eagle_cross') {
      atk.life -= dt
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const curX = atk.startX + (atk.targetX - atk.startX) * prog
      const curY = atk.startY + (atk.targetY - atk.startY) * prog
      atk.curX = curX
      atk.curY = curY
      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - curX, enemy.y - curY)
        if (d <= 35 + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          atk.hitEnemies.add(enemy)
          damageEnemy(enemy, atk.damage, atk.color)
          burst(enemy.x, enemy.y, atk.color, 4, 25)
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 15. 四象诛邪旗 (Formation Flag): 四方诛邪结界
    else if (atk.type === 'formation_flag_field') {
      atk.life -= dt
      atk.tickTimer -= dt
      if (atk.tickTimer <= 0) {
        atk.tickTimer = 0.22
        for (const enemy of game.enemies) {
          const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
          if (d <= atk.radius + (enemy.r || 12)) {
            const falloff = d <= atk.radius * 0.4 ? 1.0 : Math.max(0.65, 1.0 - (d / atk.radius) * 0.35)
            damageEnemy(enemy, atk.damage * falloff, atk.color)
            burst(enemy.x, enemy.y, atk.color, 2, 12)
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 16. 天星弈棋 (Formation Chess): 黑白落子阴阳爆鸣
    else if (atk.type === 'formation_chess_yin_yang') {
      atk.life -= dt
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      if (prog >= 0.45) {
        for (const enemy of game.enemies) {
          const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
          if (d <= atk.radius + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
            atk.hitEnemies.add(enemy)
            const falloff = d <= atk.radius * 0.4 ? 1.0 : Math.max(0.6, 1.0 - (d / atk.radius) * 0.4)
            damageEnemy(enemy, atk.damage * falloff, atk.color)
            burst(enemy.x, enemy.y, atk.color, 5, 25)
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 17. 量天玉尺 (Formation Ruler): 九宫划界重力锁足
    else if (atk.type === 'formation_ruler_grid') {
      atk.life -= dt
      atk.tickTimer -= dt
      const half = atk.size * 0.5
      for (const enemy of game.enemies) {
        if (Math.abs(enemy.x - atk.x) <= half && Math.abs(enemy.y - atk.y) <= half) {
          enemy.x += (atk.x - enemy.x) * 0.8 * dt
          enemy.y += (atk.y - enemy.y) * 0.8 * dt
        }
      }
      if (atk.tickTimer <= 0) {
        atk.tickTimer = 0.25
        for (const enemy of game.enemies) {
          if (Math.abs(enemy.x - atk.x) <= half && Math.abs(enemy.y - atk.y) <= half) {
            damageEnemy(enemy, atk.damage, atk.color)
            burst(enemy.x, enemy.y, atk.color, 2, 14)
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 18. 紫金八卦炉 (Pill Furnace): 三昧丹火与药煞浓烟扇面
    else if (atk.type === 'furnace_flame_cone') {
      atk.life -= dt
      atk.x = p.x
      atk.y = p.y
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const curRange = atk.range * (0.4 + prog * 0.6)
      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
        if (d <= curRange + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          const eAngle = Math.atan2(enemy.y - atk.y, enemy.x - atk.x)
          let diff = Math.abs(eAngle - atk.angle)
          while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2)
          if (diff <= 0.65) {
            atk.hitEnemies.add(enemy)
            const falloff = Math.max(0.6, 1.0 - (d / atk.range) * 0.4)
            damageEnemy(enemy, atk.damage * falloff, atk.color)
            burst(enemy.x, enemy.y, atk.color, 3, 20)
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 19. 碧玉药王杵 (Pill Pestle): 捣药碎骨药气震荡环
    else if (atk.type === 'pestle_pound_ring') {
      atk.life -= dt
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const curR = atk.radius * prog
      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - atk.targetX, enemy.y - atk.targetY)
        if (d <= curR + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          atk.hitEnemies.add(enemy)
          const falloff = d <= atk.radius * 0.35 ? 1.0 : Math.max(0.65, 1.0 - (d / atk.radius) * 0.35)
          damageEnemy(enemy, atk.damage * falloff, atk.color)
          burst(enemy.x, enemy.y, atk.color, 4, 25)
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 20. 千草腐仙葫 (Poison Gourd): 三枚剧毒丹丸腐蚀酸雾
    else if (atk.type === 'poison_pellet_pool') {
      atk.life -= dt
      if (atk.phase === 'fly') {
        atk.phaseTimer -= dt
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        atk.x = atk.startX + (atk.targetX - atk.startX) * prog
        atk.y = atk.startY + (atk.targetY - atk.startY) * prog
        if (atk.phaseTimer <= 0) {
          atk.phase = 'pool'
          atk.x = atk.targetX
          atk.y = atk.targetY
          atk.tickTimer = 0.18
        }
      } else if (atk.phase === 'pool') {
        atk.tickTimer = (atk.tickTimer || 0.18) - dt
        if (atk.tickTimer <= 0) {
          atk.tickTimer = 0.18
          for (const enemy of game.enemies) {
            const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
            if (d <= atk.radius + (enemy.r || 12)) {
              damageEnemy(enemy, atk.damage, atk.color)
              burst(enemy.x, enemy.y, atk.color, 1, 8)
            }
          }
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 21. 化血狂刀 (Demon Blade): 猩红半月狂斩
    else if (atk.type === 'demon_blood_crescent') {
      atk.life -= dt
      atk.x += atk.vx * dt
      atk.y += atk.vy * dt
      for (const enemy of game.enemies) {
        if (!atk.hitEnemies.has(enemy) && distance(atk, enemy) < 22 + (enemy.r || 12)) {
          atk.hitEnemies.add(enemy)
          damageEnemy(enemy, atk.damage, atk.color)
          burst(enemy.x, enemy.y, atk.color, 4, 20)
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 22. 天魔血煞爪 (Demon Claws): 虚空三爪暗劲
    else if (atk.type === 'demon_claw_marks') {
      atk.life -= dt
      for (const enemy of game.enemies) {
        if (!atk.hitEnemies.has(enemy) && distance(atk, enemy) < 32 + (enemy.r || 12)) {
          atk.hitEnemies.add(enemy)
          damageEnemy(enemy, atk.damage, atk.color)
          burst(enemy.x, enemy.y, atk.color, 5, 24)
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 23. 修罗血皇玺 (Demon Seal): 血岳坠地冲天血浪
    else if (atk.type === 'asura_blood_seal') {
      atk.life -= dt
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const curR = atk.radius * Math.sin(prog * Math.PI)
      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - atk.targetX, enemy.y - atk.targetY)
        if (d <= curR + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          atk.hitEnemies.add(enemy)
          const falloff = d <= atk.radius * 0.35 ? 1.0 : Math.max(0.65, 1.0 - (d / atk.radius) * 0.35)
          damageEnemy(enemy, atk.damage * falloff, atk.color)
          burst(enemy.x, enemy.y, atk.color, 6, 30)
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 24. 幽冥引魂灯 (Ghost Lantern): 碧磷追踪鬼火
    else if (atk.type === 'nether_ghost_wisp') {
      atk.life -= dt
      if (atk.target && !atk.target.dead) {
        const angleToTarget = Math.atan2(atk.target.y - atk.y, atk.target.x - atk.x)
        atk.vx += Math.cos(angleToTarget) * 450 * dt
        atk.vy += Math.sin(angleToTarget) * 450 * dt
        const spd = Math.hypot(atk.vx, atk.vy)
        if (spd > 320) {
          atk.vx = (atk.vx / spd) * 320
          atk.vy = (atk.vy / spd) * 320
        }
      }
      atk.x += atk.vx * dt
      atk.y += atk.vy * dt
      for (const enemy of game.enemies) {
        if (distance(atk, enemy) < 16 + (enemy.r || 12)) {
          damageEnemy(enemy, atk.damage, atk.color)
          burst(enemy.x, enemy.y, atk.color, 5, 20)
          atk.finished = true
          break
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 25. 白骨哀丧棒 (Ghost Wand): 苍白鬼环音煞推怪
    else if (atk.type === 'mourning_wail_ring') {
      atk.life -= dt
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const curR = atk.range * prog
      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - atk.x, enemy.y - atk.y)
        if (d <= curR + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          atk.hitEnemies.add(enemy)
          damageEnemy(enemy, atk.damage, atk.color)
          burst(enemy.x, enemy.y, atk.color, 3, 20)
          const eAngle = Math.atan2(enemy.y - atk.y, enemy.x - atk.x)
          enemy.x += Math.cos(eAngle) * 22
          enemy.y += Math.sin(eAngle) * 22
        }
      }
      if (atk.life <= 0) atk.finished = true
    }

    // 26. 百鬼聚灵幡 (Ghost Banner): 怨魂恶鬼螺旋穿刺
    else if (atk.type === 'ghost_parade_swarm') {
      atk.life -= dt
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const dist = atk.range * prog
      const curX = atk.x + Math.cos(atk.angle) * dist
      const curY = atk.y + Math.sin(atk.angle) * dist
      atk.curX = curX
      atk.curY = curY
      for (const enemy of game.enemies) {
        const d = Math.hypot(enemy.x - curX, enemy.y - curY)
        if (d <= 26 + (enemy.r || 12) && !atk.hitEnemies.has(enemy)) {
          atk.hitEnemies.add(enemy)
          damageEnemy(enemy, atk.damage, atk.color)
          burst(enemy.x, enemy.y, atk.color, 4, 22)
        }
      }
      if (atk.life <= 0) atk.finished = true
    }
  }

  game.specialAttacks = game.specialAttacks.filter(a => !a.finished)
  updatePetFox(dt)
}

// ==========================================
// 连锁电弧系统 (Chain Lightning Arc System)
// ==========================================

function getChainArcN(overrideLevel) {
  if (typeof game !== 'undefined' && game && game.chainArcN != null && overrideLevel == null) {
    return game.chainArcN
  }
  const level = overrideLevel != null ? overrideLevel : ((typeof game !== 'undefined' && game && game.chainArcLevel) ? game.chainArcLevel : 1)
  return 10 + Math.max(0, level - 1) * 5
}

function triggerChainArc(startEnemy, primaryDamage) {
  if (!startEnemy || typeof game === 'undefined' || !game || (game.chainArcLevel || 0) <= 0) return
  if ((game.chainArcCooldown || 0) > 0) return
  game.chainArcCooldown = 0.08

  const n = getChainArcN()
  const actualDamage = primaryDamage || game.attack || 28
  const arcDamage = Math.max(1, Math.round(actualDamage * (n / 100)))

  // 搜集存活敌怪与领主候选
  const candidates = []
  if (game.enemies && game.enemies.length > 0) {
    for (const e of game.enemies) {
      if (e && e.hp > 0) candidates.push(e)
    }
  }
  if (game.isBossStage && game.boss && !game.boss.defeated && !game.boss.invuln && !candidates.includes(game.boss)) {
    candidates.push(game.boss)
  }

  const chained = [startEnemy]
  const visited = new Set([startEnemy])
  let curr = startEnemy
  const maxJumpDist = 240

  while (chained.length < n) {
    let nearest = null
    let minDist = maxJumpDist
    for (const e of candidates) {
      if (visited.has(e) || e.hp <= 0) continue
      const d = Math.hypot(e.x - curr.x, e.y - curr.y)
      if (d < minDist) {
        minDist = d
        nearest = e
      }
    }
    if (nearest) {
      visited.add(nearest)
      chained.push(nearest)
      curr = nearest
    } else {
      break
    }
  }

  // 传递电弧对每个敌怪造成主武器当前伤害的 n%
  const wasPrimary = game._currentAttackIsPrimary
  game._currentAttackIsPrimary = false
  try {
    for (let i = 0; i < chained.length; i++) {
      const target = chained[i]
      if (isHeadless) {
        if (target.isBoss && typeof damageBoss === 'function') {
          damageBoss(arcDamage)
        } else {
          target.hp -= arcDamage
          target.hit = 0.15
          if (target.hp <= 0) defeat(target)
        }
      } else {
        damageEnemy(target, arcDamage, '#ffd700')
        burst(target.x, target.y, '#ffd700', 3, 20)
      }
    }
  } finally {
    game._currentAttackIsPrimary = wasPrimary
  }

  if (!isHeadless && sound && typeof sound.chainArc === 'function') {
    sound.chainArc()
  }

  if (!isHeadless) {
    if (!game.chainArcs) game.chainArcs = []
    game.chainArcs.push({
      nodes: chained.map(e => ({ x: e.x, y: e.y })),
      life: 0.32,
      maxLife: 0.32,
      seed: Math.random()
    })
  }
}

function drawChainArcs(ctx) {
  if (!game.chainArcs || game.chainArcs.length === 0 || isHeadless) return

  for (const arc of game.chainArcs) {
    const progress = Math.max(0, arc.life / arc.maxLife)
    if (progress <= 0 || !arc.nodes || arc.nodes.length === 0) continue

    ctx.save()

    // 1. 绘制释放电弧特效贴图 (effect_chain_arc.png)
    const arcImgObj = (typeof skillSprites !== 'undefined' && skillSprites.effect_chain_arc)
    if (arcImgObj && arcImgObj.loaded && arcImgObj.img) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = Math.min(1, progress * 1.25) * 0.88
      for (const node of arc.nodes) {
        const size = 56 + (1 - progress) * 22
        ctx.drawImage(arcImgObj.img, node.x - size / 2, node.y - size / 2, size, size)
      }
    }

    // 2. 绘制各节点之间金黄色连环雷电弧光 (Golden Lightning Arc Bolts)
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < arc.nodes.length - 1; i++) {
      const p1 = arc.nodes[i]
      const p2 = arc.nodes[i + 1]
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const numSegments = Math.max(3, Math.min(10, Math.floor(dist / 22)))
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)
      const perpAngle = angle + Math.PI / 2

      const pts = [p1]
      for (let s = 1; s < numSegments; s++) {
        const t = s / numSegments
        const bx = p1.x + (p2.x - p1.x) * t
        const by = p1.y + (p2.y - p1.y) * t
        const jitter = ((Math.sin(s * 4.3 + arc.seed * 12 + (game.elapsed || 0) * 30)) * 14 + (Math.random() - 0.5) * 8) * progress
        pts.push({
          x: bx + Math.cos(perpAngle) * jitter,
          y: by + Math.sin(perpAngle) * jitter
        })
      }
      pts.push(p2)

      // 金光光晕层 (Outer Golden Glow)
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let s = 1; s < pts.length; s++) ctx.lineTo(pts[s].x, pts[s].y)
      ctx.strokeStyle = `rgba(255, 193, 7, ${progress * 0.75})`
      ctx.lineWidth = 5.2
      ctx.shadowColor = '#ffc107'
      ctx.shadowBlur = 14
      ctx.stroke()

      // 金黄雷芒核心层 (Bright Yellow Core)
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let s = 1; s < pts.length; s++) ctx.lineTo(pts[s].x, pts[s].y)
      ctx.strokeStyle = `rgba(255, 235, 59, ${progress * 0.95})`
      ctx.lineWidth = 2.4
      ctx.shadowBlur = 6
      ctx.stroke()

      // 白炽金丝芯 (White-hot Filament)
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let s = 1; s < pts.length; s++) ctx.lineTo(pts[s].x, pts[s].y)
      ctx.strokeStyle = `rgba(255, 255, 255, ${progress * 0.9})`
      ctx.lineWidth = 1.1
      ctx.shadowBlur = 0
      ctx.stroke()
    }

    // 3. 节点环绕金芒碎电
    for (const node of arc.nodes) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, (1 - progress) * 16 + 8, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 215, 0, ${progress * 0.65})`
      ctx.lineWidth = 1.6
      ctx.stroke()
    }

    ctx.restore()
  }
}

// ==========================================
// 离火焚原 (Blazing Scorch / Samadhi True Fire) 核心系统
// ==========================================

function getBlazingFireParams(overrideLvl) {
  const lvl = Math.max(1, overrideLvl != null ? overrideLvl : (typeof game !== 'undefined' && game && game.blazingFireLevel ? game.blazingFireLevel : 1))
  return {
    lvl,
    burnDmgPct: 10 + (lvl - 1) * 5,   // 每秒持续灼烧百分比 (起始 10%/s，每重增加 5%)
    burstDamagePct: 20 + (lvl - 1) * 5, // 引爆瞬时真实范围伤害百分比 (起始 20%，每重增加 5%)
    burstRadius: 85 + lvl * 20,      // 爆炸半径
    motesCount: 3 + (lvl - 1) * 2,   // 散射飞火流星数量 (起始 3 颗，每重增加 2 颗)
  }
}

function applyBlazingFireBrand(enemy, primaryDamage) {
  if (!enemy || enemy.hp <= 0 || (game.blazingFireLevel || 0) <= 0) return
  if (enemy._flameBrandDebounce && (game.elapsed - enemy._flameBrandDebounce < 0.04)) return
  enemy._flameBrandDebounce = game.elapsed

  enemy.flameBrand = true
  enemy.flameBrandTimer = 3.2
  enemy.flameBrandDmg = Math.max(enemy.flameBrandDmg || 0, primaryDamage || game.attack || 28)
  enemy.flameHits = (enemy.flameHits || 0) + 1

  if (!isHeadless && sound && typeof sound.flameBrand === 'function') {
    sound.flameBrand()
  }

  // 连续命中 3 次（如高防大怪或秘境领主）直接触发引爆，无需等到击杀
  if (enemy.flameHits >= 3) {
    enemy.flameHits = 0
    triggerBlazingDetonation(enemy, enemy.flameBrandDmg)
  }
}

function triggerBlazingDetonation(originEnemy, primaryDamage) {
  if (!originEnemy || (game.blazingFireLevel || 0) <= 0) return
  if (originEnemy._blazingDetonated) return
  originEnemy._blazingDetonated = true
  originEnemy._blazingQueued = true

  const params = getBlazingFireParams()
  const actualDamage = primaryDamage || originEnemy.flameBrandDmg || game.attack || 28
  const burstDamage = Math.max(1, Math.round(actualDamage * (params.burstDamagePct / 100)))
  const radius = params.burstRadius

  const prevIsDetonating = game._isDetonating
  game._isDetonating = true
  const wasPrimary = game._currentAttackIsPrimary
  game._currentAttackIsPrimary = false

  try {
    // 1. 范围冲击波伤害
    const allTargets = [...(game.enemies || [])]
    if (game.isBossStage && game.boss && !game.boss.defeated && !allTargets.includes(game.boss)) {
      allTargets.push(game.boss)
    }

    for (const target of allTargets) {
      if (!target || target.hp <= 0) continue
      const dx = target.x - originEnemy.x
      const dy = target.y - originEnemy.y
      if (Math.abs(dx) > radius || Math.abs(dy) > radius) continue
      const distSq = dx * dx + dy * dy
      if (distSq <= radius * radius) {
        const dist = Math.sqrt(distSq)
        const falloff = 1 - (dist / radius) * 0.3
        const dmg = Math.max(1, Math.round(burstDamage * falloff))
        if (isHeadless) {
          if (target.isBoss && typeof damageBoss === 'function') {
            damageBoss(dmg)
          } else {
            target.hp -= dmg
            target.hit = 0.15
            if (target.hp <= 0) defeat(target)
          }
        } else {
          damageEnemy(target, dmg, '#ff3700')
          if (!target.isBoss && dist > 1) {
            target.x += (dx / dist) * 12
            target.y += (dy / dist) * 12
          }
        }
      }
    }
  } finally {
    game._currentAttackIsPrimary = wasPrimary
    game._isDetonating = prevIsDetonating
  }

  // 2. 散射飞火流星/火种 (Motes)，上限控制避免连锁引爆产生几何级暴增
  if (!game.blazingMotes) game.blazingMotes = []
  if (game.blazingMotes.length < 24) {
    const motesCount = Math.min(params.motesCount, 24 - game.blazingMotes.length)
    const candidates = (game.enemies || []).filter(e => e.hp > 0 && e !== originEnemy && !e.flameBrand)

    for (let i = 0; i < motesCount; i++) {
      const angle = (i / motesCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
      const speed = rand(170, 270)
      let target = null
      if (candidates.length > 0) {
        target = candidates[i % candidates.length]
      }
      game.blazingMotes.push({
        x: originEnemy.x,
        y: originEnemy.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: Math.max(1, Math.round(burstDamage * 0.45)),
        life: 0.65,
        maxLife: 0.65,
        target
      })
    }
  }

  // 3. 产生视觉爆裂对象
  if (!isHeadless) {
    if (!game.blazingBursts) game.blazingBursts = []
    if (game.blazingBursts.length < 12) {
      game.blazingBursts.push({
        x: originEnemy.x,
        y: originEnemy.y,
        radius,
        life: 0.42,
        maxLife: 0.42,
        rotation: Math.random() * Math.PI * 2,
        scale: 0.25
      })
    }

    if (!game.blazingEmberParticles) game.blazingEmberParticles = []
    if (game.blazingEmberParticles.length < 36) {
      const spawnP = Math.min(10, 36 - game.blazingEmberParticles.length)
      for (let p = 0; p < spawnP; p++) {
        const pAngle = Math.random() * Math.PI * 2
        const pSpeed = rand(40, 180)
        game.blazingEmberParticles.push({
          x: originEnemy.x,
          y: originEnemy.y,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed,
          life: rand(0.3, 0.6),
          maxLife: 0.6,
          size: rand(2.2, 4.5),
          color: ['#fff3b0', '#ff9f1c', '#e71d36', '#ff5400'][Math.floor(Math.random() * 4)]
        })
      }
    }

    if (!game._lastShakeTime || (game.elapsed || 0) - game._lastShakeTime > 0.16) {
      game._lastShakeTime = game.elapsed || 0
      game.cameraShake = Math.max(game.cameraShake || 0, 0.10)
    }
    if (sound && typeof sound.blazingBurst === 'function') {
      sound.blazingBurst()
    }
  }
}

function updateBlazingFire(dt) {
  if (!game) return

  // 0. 更新延迟链式爆裂队列 (Staggered Cascade Explosions)
  if (game.pendingDetonations && game.pendingDetonations.length > 0) {
    for (const pd of game.pendingDetonations) {
      pd.timer -= dt
    }
    const ready = game.pendingDetonations.filter(pd => pd.timer <= 0)
    game.pendingDetonations = game.pendingDetonations.filter(pd => pd.timer > 0)
    for (const pd of ready) {
      if (pd.enemy) {
        triggerBlazingDetonation(pd.enemy, pd.damage)
      }
    }
  }

  // 1. 更新引爆冲击波
  if (game.blazingBursts && game.blazingBursts.length > 0) {
    for (const b of game.blazingBursts) {
      b.life -= dt
      b.scale = Math.min(1.0, b.scale + dt * 3.2)
    }
    game.blazingBursts = game.blazingBursts.filter(b => b.life > 0)
  }

  // 2. 更新飞火流星/火种
  if (game.blazingMotes && game.blazingMotes.length > 0) {
    const aliveEnemies = (game.enemies || []).filter(e => e.hp > 0)
    if (game.isBossStage && game.boss && !game.boss.defeated) aliveEnemies.push(game.boss)

    for (const m of game.blazingMotes) {
      m.life -= dt
      if (m.target && m.target.hp > 0) {
        const dx = m.target.x - m.x
        const dy = m.target.y - m.y
        const distSq = dx * dx + dy * dy
        if (distSq > 25) {
          const dist = Math.sqrt(distSq)
          const steerSpeed = 460
          m.vx += (dx / dist * steerSpeed - m.vx) * dt * 8
          m.vy += (dy / dist * steerSpeed - m.vy) * dt * 8
        }
      }
      m.x += m.vx * dt
      m.y += m.vy * dt

      for (const e of aliveEnemies) {
        if (e.hp <= 0) continue
        const hitDist = (e.r || 14) + 12
        const dx = e.x - m.x
        const dy = e.y - m.y
        if (Math.abs(dx) > hitDist || Math.abs(dy) > hitDist) continue
        if (dx * dx + dy * dy < hitDist * hitDist) {
          m.life = 0
          damageEnemy(e, m.damage, '#ff4500')
          applyBlazingFireBrand(e, m.damage)
          if (!isHeadless) burst(m.x, m.y, '#ff6b35', 3, 20)
          break
        }
      }
    }
    game.blazingMotes = game.blazingMotes.filter(m => m.life > 0)
  }

  // 3. 更新敌人体表的离火烙印持续灼烧
  if ((game.blazingFireLevel || 0) > 0 && game.enemies) {
    const params = getBlazingFireParams()
    for (const e of game.enemies) {
      if (!e || e.hp <= 0 || !e.flameBrand) continue
      e.flameBrandTimer = (e.flameBrandTimer || 0) - dt
      e.flameBurnTick = (e.flameBurnTick || 0) + dt

      if (e.flameBurnTick >= 0.3) {
        e.flameBurnTick = 0
        const burnDmg = Math.max(1, Math.round((e.flameBrandDmg || game.attack || 28) * (params.burnDmgPct / 100) * 0.3))
        damageEnemy(e, burnDmg, '#ff6700')
        if (!isHeadless) {
          burst(e.x + rand(-8, 8), e.y + rand(-8, 8), '#ffa200', 2, 14)
        }
        if (e.hp <= 0) {
          defeat(e)
          continue
        }
      }

      if (e.flameBrandTimer <= 0) {
        e.flameBrand = false
      }
    }
  }

  // 4. 更新火星环境粒子
  if (game.blazingEmberParticles && game.blazingEmberParticles.length > 0) {
    for (const p of game.blazingEmberParticles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy -= dt * 60
      p.life -= dt
    }
    game.blazingEmberParticles = game.blazingEmberParticles.filter(p => p.life > 0)
  }
}

function drawBlazingBursts(ctx) {
  if (isHeadless || !game) return

  // 1. 绘制引爆莲火冲击波贴图 (effect_fire_burst.png) 与动态光晕
  if (game.blazingBursts && game.blazingBursts.length > 0) {
    const burstImgObj = (typeof skillSprites !== 'undefined' && skillSprites.effect_fire_burst)
    for (const b of game.blazingBursts) {
      const progress = Math.max(0, b.life / b.maxLife)
      if (progress <= 0) continue

      ctx.save()
      ctx.translate(b.x, b.y)
      ctx.rotate(b.rotation + (1 - progress) * 1.5)

      if (burstImgObj && burstImgObj.loaded && burstImgObj.img) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = Math.min(1, progress * 1.4) * 0.95
        // 调小火莲爆裂光图尺寸：聚拢为精致灵动的法阵核心 (约原先 1/3~1/4 直径)，极大节省填充率
        const drawSize = b.radius * (0.35 + b.scale * 0.75)
        ctx.drawImage(burstImgObj.img, -drawSize / 2, -drawSize / 2, drawSize, drawSize)
      }

      ctx.globalCompositeOperation = 'lighter'
      const curRadius = b.radius * (1 - progress * 0.6)

      // 外层烈火冲击波环 (纯色 + lighter 自然发光，彻底移除高耗能 shadowBlur)
      ctx.beginPath()
      ctx.arc(0, 0, curRadius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 69, 0, ${progress * 0.85})`
      ctx.lineWidth = 3.2 * progress
      ctx.stroke()

      // 内层白金炽焰环
      ctx.beginPath()
      ctx.arc(0, 0, curRadius * 0.65, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 240, 180, ${progress * 0.95})`
      ctx.lineWidth = 1.8 * progress
      ctx.stroke()

      ctx.restore()
    }
  }

  // 2. 绘制飞火流星/火种 (Blazing Motes)
  if (game.blazingMotes && game.blazingMotes.length > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (const m of game.blazingMotes) {
      const progress = Math.max(0, m.life / m.maxLife)
      const tailLen = 14
      const angle = Math.atan2(m.vy, m.vx)
      const tailX = m.x - Math.cos(angle) * tailLen
      const tailY = m.y - Math.sin(angle) * tailLen

      // 外层金红彗尾 (双层线条 + lighter，零 shadowBlur 与零动态 Gradient 垃圾回收开销)
      ctx.strokeStyle = `rgba(255, 80, 20, ${progress * 0.8})`
      ctx.lineWidth = 3.6
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(tailX, tailY)
      ctx.stroke()

      // 核心白炽火线
      ctx.strokeStyle = `rgba(255, 245, 190, ${progress * 0.95})`
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(m.x - Math.cos(angle) * (tailLen * 0.55), m.y - Math.sin(angle) * (tailLen * 0.55))
      ctx.stroke()

      // 彗星头部高亮光核
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  // 3. 绘制爆裂上浮火星粒子 (Rising Fire Embers)
  if (game.blazingEmberParticles && game.blazingEmberParticles.length > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (const p of game.blazingEmberParticles) {
      const progress = Math.max(0, p.life / p.maxLife)
      ctx.fillStyle = p.color
      ctx.globalAlpha = progress * 0.85
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  // 4. 绘制敌怪脚下的离火烙印 (Flame Brand Rune)
  if ((game.blazingFireLevel || 0) > 0 && game.enemies) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (const e of game.enemies) {
      if (!e || e.hp <= 0 || !e.flameBrand) continue

      const pulse = 1 + Math.sin((game.elapsed || 0) * 12) * 0.15
      const runeR = (e.r || 14) * 1.35 * pulse

      ctx.save()
      ctx.translate(e.x, e.y + (e.r || 14) * 0.8)
      ctx.scale(1, 0.45)

      ctx.beginPath()
      ctx.arc(0, 0, runeR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 69, 0, 0.7)'
      ctx.lineWidth = 1.6
      ctx.stroke()

      ctx.fillStyle = 'rgba(255, 180, 0, 0.75)'
      ctx.beginPath()
      ctx.arc(0, 0, runeR * 0.45, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }
    ctx.restore()
  }
}

function drawSpecialAttacks(ctx) {
  if (!game.specialAttacks || isHeadless) return

  for (const atk of game.specialAttacks) {
    ctx.save()

    // 1. 破军金锤 (Hammer)
    if (atk.type === 'hammer_strike') {
      if (atk.phase === 'fly_out' || atk.phase === 'return') {
        drawWeaponSpriteOrFallback(ctx, 'hammer', atk.x, atk.y, atk.spin, 46, '#ff9920', (c, x, y, a) => {
          if (typeof drawHammerEntity === 'function') drawHammerEntity(c, x, y, a, 1.35)
        })
      } else if (atk.phase === 'slam') {
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        const alpha = Math.max(0, 1 - prog)

        ctx.save()
        ctx.translate(atk.x, atk.y)

        // 冲击波金光外环
        ctx.strokeStyle = `rgba(255, 123, 48, ${alpha * 0.95})`
        ctx.lineWidth = 4.5 * alpha
        ctx.shadowColor = '#ff7b30'
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.arc(0, 0, atk.slamRadius, 0, Math.PI * 2)
        ctx.stroke()

        // 震中金炎
        ctx.fillStyle = `rgba(255, 200, 80, ${alpha * 0.4})`
        ctx.beginPath()
        ctx.arc(0, 0, atk.slamRadius * 0.45, 0, Math.PI * 2)
        ctx.fill()

        // 地面金炎龟裂纹 (8条地裂纹)
        ctx.strokeStyle = `rgba(255, 160, 40, ${alpha * 0.9})`
        ctx.lineWidth = 2.2 * alpha
        for (let i = 0; i < 8; i++) {
          const fAngle = (i / 8) * Math.PI * 2 + 0.12
          const fLen = atk.slamRadius * 0.92
          ctx.beginPath()
          ctx.moveTo(0, 0)
          const midR = fLen * 0.5
          ctx.lineTo(Math.cos(fAngle + 0.14) * midR, Math.sin(fAngle + 0.14) * midR)
          ctx.lineTo(Math.cos(fAngle) * fLen, Math.sin(fAngle) * fLen)
          ctx.stroke()
        }
        ctx.restore()

        // 砸入地面的金锤
        const embedTilt = 0.35 + Math.sin(prog * 8) * 0.05
        drawWeaponSpriteOrFallback(ctx, 'hammer', atk.x, atk.y - 6, embedTilt, 48, '#ff7b30', (c, x, y, a) => {
          if (typeof drawHammerEntity === 'function') drawHammerEntity(c, x, y, a, 1.4)
        })
      }
    }

    // 2. 九疑重鼎 (Ding)
    else if (atk.type === 'ding_crush') {
      if (atk.phase === 'launch') {
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        // 地面影子
        ctx.fillStyle = `rgba(20, 30, 25, ${0.2 + (1 - Math.abs(atk.arcY) / 95) * 0.3})`
        ctx.beginPath()
        ctx.ellipse(atk.x, atk.y, 16, 8, 0, 0, Math.PI * 2)
        ctx.fill()

        // 空中重鼎
        drawWeaponSpriteOrFallback(ctx, 'ding', atk.x, atk.y + atk.arcY, 0, 48, '#e69848', (c, x, y) => {
          if (typeof drawDingEntity === 'function') drawDingEntity(c, x, y, 0, 1.3)
        })
      } else if (atk.phase === 'crash') {
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        const alpha = Math.max(0, 1 - prog)

        ctx.save()
        ctx.translate(atk.x, atk.y)
        ctx.strokeStyle = `rgba(230, 152, 72, ${alpha * 0.9})`
        ctx.lineWidth = 5 * alpha
        ctx.shadowColor = '#e69848'
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.arc(0, 0, atk.crashRadius, 0, Math.PI * 2)
        ctx.stroke()

        // 内环铭文
        ctx.strokeStyle = `rgba(255, 215, 120, ${alpha * 0.6})`
        ctx.lineWidth = 2 * alpha
        ctx.beginPath()
        ctx.arc(0, 0, atk.crashRadius * 0.6, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // 巨鼎镇地
        drawWeaponSpriteOrFallback(ctx, 'ding', atk.x, atk.y - 10, 0, 46, '#e69848', (c, x, y) => {
          if (typeof drawDingEntity === 'function') drawDingEntity(c, x, y, 0, 1.35)
        })
      }
    }

    // 3. 龙鳞霸甲 (Dragon Armor)
    else if (atk.type === 'dragon_fist') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)
      const curDist = atk.range * prog
      const tipX = atk.x + Math.cos(atk.angle) * curDist
      const tipY = atk.y + Math.sin(atk.angle) * curDist

      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.rotate(atk.angle)

      // 烈焰龙息光带
      const grad = ctx.createLinearGradient(0, 0, curDist, 0)
      grad.addColorStop(0, 'rgba(255, 100, 20, 0.15)')
      grad.addColorStop(0.7, 'rgba(242, 184, 54, 0.45)')
      grad.addColorStop(1, 'rgba(255, 230, 140, 0.85)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(0, -12)
      ctx.lineTo(curDist, -28)
      ctx.lineTo(curDist, 28)
      ctx.lineTo(0, 12)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // 龙头金影
      drawWeaponSpriteOrFallback(ctx, 'dragon_armor', tipX, tipY, atk.angle, 40, '#f2b836', (c, x, y, a) => {
        if (typeof drawDragonArmorEntity === 'function') drawDragonArmorEntity(c, x, y, a, 1.25)
      })
    }

    // 4. 疾风残刃 (Daggers): 翡翠飞刀本体自旋回旋
    else if (atk.type === 'flying_dagger_boomerang') {
      // 翡翠风刃拖尾
      if (atk.trail && atk.trail.length > 1) {
        ctx.save()
        for (let i = 0; i < atk.trail.length - 1; i++) {
          const pt = atk.trail[i]
          const nextPt = atk.trail[i + 1]
          const alpha = (pt.life / 0.14) * 0.7
          ctx.strokeStyle = `rgba(139, 243, 192, ${alpha})`
          ctx.lineWidth = Math.max(1.5, 3.8 * (pt.life / 0.14))
          ctx.shadowColor = '#8bf3c0'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.moveTo(pt.x, pt.y)
          ctx.lineTo(nextPt.x, nextPt.y)
          ctx.stroke()
        }
        ctx.restore()
      }

      // 飞刀本体自旋贴图渲染
      drawWeaponSpriteOrFallback(ctx, 'daggers', atk.x, atk.y, atk.spin, atk.size || 38, '#8bf3c0', (c, x, y, a) => {
        if (typeof drawDaggersEntity === 'function') drawDaggersEntity(c, x, y, a, 1.2)
      })
    }

    // 5. 灵木拂尘 (Fuchen)
    else if (atk.type === 'fuchen_wave') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)

      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.rotate(atk.angle)
      ctx.strokeStyle = `rgba(150, 232, 224, ${alpha * 0.9})`
      ctx.fillStyle = `rgba(150, 232, 224, ${alpha * 0.25})`
      ctx.lineWidth = 4 * alpha
      ctx.shadowColor = '#96e8e0'
      ctx.shadowBlur = 16

      // 三道逐级推进的仙浪圆弧
      for (let w = 0; w < 3; w++) {
        const arcR = atk.range * (0.35 + prog * 0.65) - w * 18
        if (arcR > 10) {
          ctx.beginPath()
          ctx.arc(0, 0, arcR, -atk.fanAngle * 0.5, atk.fanAngle * 0.5)
          ctx.stroke()
        }
      }
      ctx.restore()
    }

    // 6. 八卦阵盘 (Bagua)
    else if (atk.type === 'bagua_field') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog * 0.3)

      ctx.save()
      ctx.translate(atk.x, atk.y)
      const spin = (atk.duration - atk.life) * 2.2
      ctx.rotate(spin)

      // 太极外金光环
      ctx.strokeStyle = `rgba(238, 213, 125, ${alpha * 0.85})`
      ctx.lineWidth = 2.8
      ctx.shadowColor = '#eed57d'
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.arc(0, 0, atk.radius, 0, Math.PI * 2)
      ctx.stroke()

      // 中心八卦盘模型
      drawWeaponSpriteOrFallback(ctx, 'bagua', 0, 0, spin * 0.5, 42, '#eed57d', (c, x, y, a) => {
        if (typeof drawBaguaEntity === 'function') drawBaguaEntity(c, x, y, a, 1.2)
      })

      // 八卦卦象标记 (八象)
      ctx.fillStyle = `rgba(255, 235, 160, ${alpha * 0.9})`
      for (let i = 0; i < 8; i++) {
        const bAngle = (i / 8) * Math.PI * 2
        const bx = Math.cos(bAngle) * (atk.radius - 12)
        const by = Math.sin(bAngle) * (atk.radius - 12)
        ctx.fillRect(bx - 3, by - 1.5, 6, 3)
      }
      ctx.restore()
    }

    // 7. 混元宝珠 (Baozhu)
    else if (atk.type === 'singularity') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog * 0.2)

      ctx.save()
      ctx.translate(atk.x, atk.y)
      const rot = (atk.duration - atk.life) * 6
      ctx.rotate(rot)

      // 引力外环
      ctx.fillStyle = `rgba(214, 168, 248, ${alpha * 0.28})`
      ctx.beginPath()
      ctx.arc(0, 0, atk.radius * (1 - prog * 0.25), 0, Math.PI * 2)
      ctx.fill()

      // 引力吸积盘
      ctx.strokeStyle = `rgba(214, 168, 248, ${alpha * 0.85})`
      ctx.lineWidth = 2.5
      ctx.shadowColor = '#d6a8f8'
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.ellipse(0, 0, 36, 14, 0.4, 0, Math.PI * 2)
      ctx.stroke()

      // 混元紫金宝珠本尊
      drawWeaponSpriteOrFallback(ctx, 'baozhu', 0, 0, rot * 0.4, 34, '#d6a8f8', (c, x, y, a) => {
        if (typeof drawBaozhuEntity === 'function') drawBaozhuEntity(c, x, y, a, 1.1)
      })
      ctx.restore()
    }

    // 8. 青锋灵剑 (Sword): 御剑索敌贯穿飞剑
    else if (atk.type === 'flying_sword_strike') {
      // 剑气流光拖尾
      if (atk.trail && atk.trail.length > 1) {
        ctx.save()
        for (let i = 0; i < atk.trail.length - 1; i++) {
          const pt = atk.trail[i]
          const nextPt = atk.trail[i + 1]
          const alpha = (pt.life / 0.16) * 0.75
          ctx.strokeStyle = `rgba(100, 232, 203, ${alpha})`
          ctx.lineWidth = Math.max(1.5, 4.5 * (pt.life / 0.16))
          ctx.shadowColor = '#64e8cb'
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.moveTo(pt.x, pt.y)
          ctx.lineTo(nextPt.x, nextPt.y)
          ctx.stroke()
        }
        ctx.restore()
      }

      // 飞剑本体贴图渲染 (对齐飞行朝向)
      drawWeaponSpriteOrFallback(ctx, 'sword', atk.x, atk.y, atk.angle, atk.size || 44, '#64e8cb', (c, x, y, a) => {
        if (typeof drawSwordEntity === 'function') drawSwordEntity(c, x, y, a, 1.25, true, 0.5)
      })
    }

    // 9. 奔雷古剑 (Thunder Sword): 紫电天劫飞剑
    else if (atk.type === 'flying_thunder_sword') {
      // 紫电雷芒拖尾
      if (atk.trail && atk.trail.length > 1) {
        ctx.save()
        for (let i = 0; i < atk.trail.length - 1; i++) {
          const pt = atk.trail[i]
          const nextPt = atk.trail[i + 1]
          const alpha = (pt.life / 0.16) * 0.85
          ctx.strokeStyle = `rgba(165, 189, 248, ${alpha})`
          ctx.lineWidth = Math.max(2, 5 * (pt.life / 0.16))
          ctx.shadowColor = '#818cf8'
          ctx.shadowBlur = 12
          ctx.beginPath()
          ctx.moveTo(pt.x, pt.y)
          ctx.lineTo(nextPt.x, nextPt.y)
          ctx.stroke()
        }
        ctx.restore()
      }

      if (atk.phase === 'strike') {
        // 九天神雷落雷光柱
        const prog = 1 - Math.max(0, atk.phaseTimer / atk.phaseDuration)
        const alpha = Math.max(0, 1 - prog)
        ctx.save()
        ctx.strokeStyle = `rgba(192, 132, 252, ${alpha})`
        ctx.lineWidth = 6 * alpha
        ctx.shadowColor = '#a855f7'
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.moveTo(atk.x, 0)
        ctx.lineTo(atk.x, atk.y)
        ctx.stroke()
        ctx.restore()
      }

      // 飞剑本体贴图渲染
      drawWeaponSpriteOrFallback(ctx, 'thunder_sword', atk.x, atk.y, atk.angle, atk.size || 46, '#a5bdf8', (c, x, y, a) => {
        if (typeof drawThunderSwordEntity === 'function') drawThunderSwordEntity(c, x, y, a, 1.3)
      })
    }

    // 10. 赤炎葫芦 (Gourd Flame Beam): 灼热火线
    else if (atk.type === 'gourd_flame_beam') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.sin(prog * Math.PI) * 0.95

      ctx.save()
      ctx.translate(atk.startX, atk.startY)
      ctx.rotate(atk.angle)

      // 层 1：外围炽热烈焰光晕
      ctx.strokeStyle = `rgba(255, 60, 0, ${alpha * 0.35})`
      ctx.lineWidth = atk.width * 1.4
      ctx.shadowColor = '#ff3300'
      ctx.shadowBlur = 22
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(atk.length, 0)
      ctx.stroke()

      // 层 2：烈焰光柱主体
      ctx.strokeStyle = `rgba(255, 130, 20, ${alpha * 0.85})`
      ctx.lineWidth = atk.width * 0.75
      ctx.shadowColor = '#ff7b00'
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(atk.length, 0)
      ctx.stroke()

      // 层 3：纯阳真火白炽光芯
      ctx.strokeStyle = `rgba(255, 250, 210, ${alpha * 0.95})`
      ctx.lineWidth = atk.width * 0.28
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(atk.length * 0.96, 0)
      ctx.stroke()

      // 葫芦口烈焰喷涌花火
      ctx.fillStyle = `rgba(255, 200, 50, ${alpha * 0.9})`
      ctx.beginPath()
      ctx.arc(0, 0, atk.width * 0.6, 0, Math.PI * 2)
      ctx.fill()

      // 束端火光扩散爆裂
      ctx.fillStyle = `rgba(255, 120, 20, ${alpha * 0.75})`
      ctx.beginPath()
      ctx.arc(atk.length, 0, atk.width * 0.7, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // 11. 青羽灵狐扑击冲击波与爪痕
    else if (atk.type === 'fox_claw_impact') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)

      ctx.save()
      ctx.translate(atk.x, atk.y)

      // 青碧狐火冲击环
      ctx.strokeStyle = `rgba(100, 232, 203, ${alpha * 0.9})`
      ctx.lineWidth = 3.5 * alpha
      ctx.shadowColor = '#64e8cb'
      ctx.shadowBlur = 16
      ctx.beginPath()
      ctx.arc(0, 0, atk.radius * (0.3 + prog * 0.7), 0, Math.PI * 2)
      ctx.stroke()

      // 灵力波纹内环
      ctx.strokeStyle = `rgba(200, 255, 245, ${alpha * 0.6})`
      ctx.lineWidth = 1.8 * alpha
      ctx.beginPath()
      ctx.arc(0, 0, atk.radius * 0.45 * prog, 0, Math.PI * 2)
      ctx.stroke()

      // 三道利爪裂空光痕
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`
      ctx.lineWidth = 2.4 * alpha
      for (let s = -1; s <= 1; s++) {
        ctx.beginPath()
        ctx.moveTo(-16, s * 9 - 10)
        ctx.quadraticCurveTo(0, s * 9, 16, s * 9 + 10)
        ctx.stroke()
      }

      ctx.restore()
    }

    // 12. 百兽金铃 (Beast Bell): 摄魂金波 + 灵兽神影突袭
    else if (atk.type === 'beast_bell_sonic') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)
      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.rotate(atk.angle)

      // 多重金色摄魂音波光环
      ctx.shadowColor = '#facc15'
      ctx.shadowBlur = 18
      for (let i = 0; i < 4; i++) {
        const arcR = atk.range * (0.3 + prog * 0.7) - i * 14
        if (arcR > 8) {
          ctx.strokeStyle = `rgba(250, 204, 21, ${(alpha * (1 - i * 0.2)).toFixed(2)})`
          ctx.lineWidth = (3.5 - i * 0.6) * alpha
          ctx.beginPath()
          ctx.arc(0, 0, arcR, -Math.PI * 0.38, Math.PI * 0.38)
          ctx.stroke()
        }
      }

      // 扑杀向前的金色灵兽疾影 (Golden Beast Phantom)
      const beastDist = atk.range * 0.75 * prog
      ctx.save()
      ctx.translate(beastDist, 0)
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha * 0.45})`
      ctx.beginPath()
      ctx.moveTo(18, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, -4); ctx.lineTo(-16, 0); ctx.lineTo(-6, 4); ctx.lineTo(-12, 14); ctx.closePath()
      ctx.fill()
      // 兽爪撕裂光芒
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
      ctx.lineWidth = 1.8 * alpha
      ctx.beginPath()
      ctx.moveTo(6, -8); ctx.lineTo(16, -2)
      ctx.moveTo(8, 0); ctx.lineTo(20, 0)
      ctx.moveTo(6, 8); ctx.lineTo(16, 2)
      ctx.stroke()
      ctx.restore()

      ctx.restore()

      // 金铃悬空高频摇曳震颤
      const bellTilt = Math.sin(prog * 20) * 0.35
      drawWeaponSpriteOrFallback(ctx, 'beast_bell', atk.x + Math.cos(atk.angle) * 18, atk.y + Math.sin(atk.angle) * 18, atk.angle + bellTilt, 38, '#facc15', (c, x, y, a) => {
        if (typeof drawBellEntity === 'function') drawBellEntity(c, x, y, a, 1.2)
      })
    }

    // 13. 缚兽玄绫 (Beast Lash): 碧水游龙大弧鞭影 + 龙鳞破空
    else if (atk.type === 'beast_whip_arc') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)
      const sweepAngle = atk.angle - Math.PI * 0.55 + prog * Math.PI * 1.1

      ctx.save()
      ctx.translate(atk.x, atk.y)

      // 碧蓝游龙彩绫轨迹 (渐变色带)
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 18
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.95})`
      ctx.lineWidth = 5 * alpha
      ctx.beginPath()
      ctx.arc(0, 0, atk.range * 0.88, atk.angle - Math.PI * 0.55, sweepAngle)
      ctx.stroke()

      // 绫心银白灵光细带
      ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.9})`
      ctx.lineWidth = 2 * alpha
      ctx.beginPath()
      ctx.arc(0, 0, atk.range * 0.88, atk.angle - Math.PI * 0.55, sweepAngle)
      ctx.stroke()

      // 鞭梢破空龙首爆击 (Dragon Head Wave Burst at Tip)
      const tipX = Math.cos(sweepAngle) * atk.range * 0.88
      const tipY = Math.sin(sweepAngle) * atk.range * 0.88
      ctx.fillStyle = '#bae6fd'
      ctx.beginPath()
      ctx.arc(tipX, tipY, 6 * alpha, 0, Math.PI * 2)
      ctx.fill()

      // 飞溅的水灵龙鳞火花
      ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.85})`
      ctx.lineWidth = 1.6
      for (let s = -1; s <= 1; s += 2) {
        ctx.beginPath()
        ctx.moveTo(tipX, tipY)
        ctx.lineTo(tipX + Math.cos(sweepAngle + s * 0.4) * 14, tipY + Math.sin(sweepAngle + s * 0.4) * 14)
        ctx.stroke()
      }
      ctx.restore()

      // 玄绫在道友身侧飞转
      drawWeaponSpriteOrFallback(ctx, 'beast_lash', atk.x + Math.cos(sweepAngle) * 22, atk.y + Math.sin(sweepAngle) * 22, sweepAngle, 38, '#38bdf8', (c, x, y, a) => {
        if (typeof drawLashEntity === 'function') drawLashEntity(c, x, y, a, 1.2)
      })
    }

    // 14. 唤灵法螺 (Beast Horn): 巡天双灵鹰交叉裂空穿透
    else if (atk.type === 'beast_eagle_cross') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog * 0.35)
      const curX = atk.curX || (atk.startX + (atk.targetX - atk.startX) * prog)
      const curY = atk.curY || (atk.startY + (atk.targetY - atk.startY) * prog)

      ctx.save()
      ctx.translate(curX, curY)
      ctx.rotate(atk.angle)
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 16

      // 双鹰巡天交错轨迹与飞翼 (Twin Celestial Spirit Eagles)
      for (const side of [-1, 1]) {
        const wingSpan = 24 * (1 - prog * 0.3)
        const wingFlap = Math.sin(prog * 18) * 8 * side
        const offY = side * (20 * (1 - prog * 0.45)) + wingFlap

        // 灵鹰身躯与羽翼光带
        ctx.fillStyle = `rgba(224, 242, 254, ${alpha * 0.9})`
        ctx.beginPath()
        ctx.moveTo(16, offY)
        ctx.lineTo(-8, offY - side * wingSpan)
        ctx.lineTo(-2, offY)
        ctx.lineTo(-18, offY)
        ctx.lineTo(-2, offY)
        ctx.lineTo(-8, offY + side * (wingSpan * 0.4))
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.95})`
        ctx.lineWidth = 1.8
        ctx.stroke()

        // 飞掠羽毛轨迹
        ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.6})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(-18, offY); ctx.lineTo(-32, offY + side * 4)
        ctx.stroke()
      }

      // 交叉点光芒爆裂
      if (prog > 0.4 && prog < 0.8) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(0, 0, 8 * alpha, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      drawWeaponSpriteOrFallback(ctx, 'beast_horn', curX, curY, atk.angle, 38, '#e0f2fe', (c, x, y, a) => {
        if (typeof drawHornEntity === 'function') drawHornEntity(c, x, y, a, 1.15)
      })
    }

    // 15. 四象诛邪旗 (Formation Flag): 四方诛邪结界 + 太极光网
    else if (atk.type === 'formation_flag_field') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog * 0.3)
      const rot = (atk.duration - atk.life) * 1.6

      ctx.save()
      ctx.translate(atk.x, atk.y)

      // 诛邪大阵外圆天罡光环
      ctx.strokeStyle = `rgba(251, 113, 133, ${alpha * 0.85})`
      ctx.lineWidth = 2.8
      ctx.shadowColor = '#fb7185'
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.arc(0, 0, atk.radius, 0, Math.PI * 2)
      ctx.stroke()

      // 四象四方旗帜坐标
      const flagCoords = []
      for (let i = 0; i < 4; i++) {
        const fAngle = rot + (i / 4) * Math.PI * 2
        const fx = Math.cos(fAngle) * (atk.radius * 0.78)
        const fy = Math.sin(fAngle) * (atk.radius * 0.78)
        flagCoords.push({ x: fx, y: fy, angle: fAngle })
      }

      // 四旗之间的结界灵索连线 (Laser Boundary Square)
      ctx.strokeStyle = `rgba(255, 228, 230, ${alpha * 0.8})`
      ctx.lineWidth = 2 * alpha
      ctx.beginPath()
      for (let i = 0; i < 4; i++) {
        const c1 = flagCoords[i]
        const c2 = flagCoords[(i + 1) % 4]
        if (i === 0) ctx.moveTo(c1.x, c1.y)
        ctx.lineTo(c2.x, c2.y)
      }
      ctx.closePath()
      ctx.stroke()

      // 阵内地面旋转诛邪太极符印
      ctx.fillStyle = `rgba(251, 113, 133, ${alpha * 0.16})`
      ctx.beginPath()
      ctx.arc(0, 0, atk.radius * 0.7, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = `rgba(244, 63, 94, ${alpha * 0.5})`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(0, 0, atk.radius * 0.45, 0, Math.PI * 2)
      ctx.stroke()

      // 4 枚插地的四象灵旗 (Rotated & Animated)
      for (let i = 0; i < 4; i++) {
        const fc = flagCoords[i]
        drawWeaponSpriteOrFallback(ctx, 'formation_flag', fc.x, fc.y, fc.angle + Math.PI * 0.5, 30, '#fb7185', (c, x, y) => {
          if (typeof drawFlagEntity === 'function') drawFlagEntity(c, x, y, 0, 0.9)
        })
      }
      ctx.restore()
    }

    // 16. 天星弈棋 (Formation Chess): 黑白双子九天坠落 + 太极阴阳星陨爆发
    else if (atk.type === 'formation_chess_yin_yang') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)

      ctx.save()
      ctx.translate(atk.x, atk.y)

      // 地面星光棋盘网格印记
      ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.45})`
      ctx.lineWidth = 1.4
      const gSize = atk.radius * 0.7
      for (let i = -2; i <= 2; i++) {
        const off = (i / 2) * gSize
        ctx.beginPath(); ctx.moveTo(off, -gSize); ctx.lineTo(off, gSize); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(-gSize, off); ctx.lineTo(gSize, off); ctx.stroke()
      }

      // 天元落子轰爆太极光环
      ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.95})`
      ctx.lineWidth = 4 * alpha
      ctx.shadowColor = '#c084fc'
      ctx.shadowBlur = 20
      ctx.beginPath()
      ctx.arc(0, 0, atk.radius * Math.min(1, prog * 1.4), 0, Math.PI * 2)
      ctx.stroke()

      // 阴阳双星对撞相融 (Twin Celestial Stones)
      const sep = Math.max(2, 28 * (1 - Math.min(1, prog * 2.2)))
      const stoneRot = prog * Math.PI * 3

      // 白子（天阳玉星）
      ctx.save()
      ctx.translate(-Math.cos(stoneRot) * sep, -Math.sin(stoneRot) * sep)
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = '#fdf4ff'
      ctx.shadowBlur = 12
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      // 黑子（九幽极阴）
      ctx.save()
      ctx.translate(Math.cos(stoneRot) * sep, Math.sin(stoneRot) * sep)
      ctx.fillStyle = '#1e1b4b'
      ctx.shadowColor = '#a855f7'
      ctx.shadowBlur = 12
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#c084fc'
      ctx.lineWidth = 1.8
      ctx.stroke()
      ctx.restore()

      // 碰撞瞬间的太极八卦光屑
      if (prog > 0.3) {
        ctx.fillStyle = `rgba(240, 171, 252, ${alpha * 0.8})`
        for (let a = 0; a < 6; a++) {
          const spAngle = (a / 6) * Math.PI * 2 + prog * 4
          const spR = atk.radius * 0.6 * (prog - 0.3)
          ctx.beginPath()
          ctx.arc(Math.cos(spAngle) * spR, Math.sin(spAngle) * spR, 3 * alpha, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
    }

    // 17. 量天玉尺 (Formation Ruler): 九宫画界禁绝泥潭 + 羊脂玉尺定坤
    else if (atk.type === 'formation_ruler_grid') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog * 0.3)
      const half = atk.size * 0.5
      const third = atk.size / 3

      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.shadowColor = '#34d399'
      ctx.shadowBlur = 18

      // 九宫金翠外边框
      ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.9})`
      ctx.lineWidth = 2.6
      ctx.strokeRect(-half, -half, atk.size, atk.size)

      // 九宫内部分割线 (Nine-Palace Grid Lines)
      ctx.strokeStyle = `rgba(167, 243, 208, ${alpha * 0.7})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(-half + third, -half); ctx.lineTo(-half + third, half)
      ctx.moveTo(-half + third * 2, -half); ctx.lineTo(-half + third * 2, half)
      ctx.moveTo(-half, -half + third); ctx.lineTo(half, -half + third)
      ctx.moveTo(-half, -half + third * 2); ctx.lineTo(half, -half + third * 2)
      ctx.stroke()

      // 九宫节点闪烁八卦玄光
      ctx.fillStyle = `rgba(209, 250, 229, ${alpha * 0.85})`
      for (let rx = 1; rx <= 2; rx++) {
        for (let ry = 1; ry <= 2; ry++) {
          const nx = -half + rx * third
          const ny = -half + ry * third
          ctx.beginPath()
          ctx.arc(nx, ny, 3.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // 阵中心脉冲重力泥沼 (Gravity Depression Ripple)
      ctx.fillStyle = `rgba(16, 185, 129, ${alpha * 0.15})`
      ctx.beginPath()
      ctx.arc(0, 0, half * 0.8, 0, Math.PI * 2)
      ctx.fill()

      // 镇守阵眼的量天玉尺 (Hovering Jade Ruler)
      const rulerBob = Math.sin((atk.duration - atk.life) * 8) * 3
      drawWeaponSpriteOrFallback(ctx, 'formation_ruler', 0, rulerBob, -0.4, 42, '#34d399', (c, x, y, a) => {
        if (typeof drawRulerEntity === 'function') drawRulerEntity(c, x, y, a, 1.2)
      })
      ctx.restore()
    }

    // 18. 紫金八卦炉 (Pill Furnace): 倾炉喷涌纯阳三昧真火与滚烫药气
    else if (atk.type === 'furnace_flame_cone') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)

      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.rotate(atk.angle)

      // 三重梯度三昧真火扇面 (Samadhi Dragon Flame Cone)
      const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, atk.range)
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`)
      grad.addColorStop(0.2, `rgba(254, 240, 138, ${alpha * 0.85})`)
      grad.addColorStop(0.55, `rgba(249, 115, 22, ${alpha * 0.7})`)
      grad.addColorStop(0.85, `rgba(220, 38, 38, ${alpha * 0.45})`)
      grad.addColorStop(1, 'rgba(147, 51, 234, 0)')

      ctx.fillStyle = grad
      ctx.shadowColor = '#f97316'
      ctx.shadowBlur = 20
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, atk.range, -0.68, 0.68)
      ctx.closePath()
      ctx.fill()

      // 喷射而出的纯阳金煞火星与药气气泡
      for (let s = 0; s < 5; s++) {
        const pDist = atk.range * (0.3 + (s / 5) * 0.65) * prog
        const pSpread = (s - 2) * 12 * prog
        ctx.fillStyle = s % 2 === 0 ? '#fde047' : '#f97316'
        ctx.beginPath()
        ctx.arc(pDist, pSpread, 3.5 * alpha, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // 炉身前倾开炉喷火
      drawWeaponSpriteOrFallback(ctx, 'pill_furnace', atk.x + Math.cos(atk.angle) * 18, atk.y + Math.sin(atk.angle) * 18, atk.angle * 0.2, 40, '#f97316', (c, x, y) => {
        if (typeof drawFurnaceEntity === 'function') drawFurnaceEntity(c, x, y, 0, 1.2)
      })
    }

    // 19. 碧玉药王杵 (Pill Pestle): 翠玉神杵破空重击 + 碎骨药浪震荡
    else if (atk.type === 'pestle_pound_ring') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)
      const curR = atk.radius * prog

      ctx.save()
      ctx.translate(atk.targetX, atk.targetY)
      ctx.shadowColor = '#10b981'
      ctx.shadowBlur = 20

      // 药神重击翡翠冲击波外环
      ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.95})`
      ctx.lineWidth = 4.5 * alpha
      ctx.beginPath()
      ctx.arc(0, 0, curR, 0, Math.PI * 2)
      ctx.stroke()

      // 回春翠雾与地裂莲纹内环
      ctx.strokeStyle = `rgba(167, 243, 208, ${alpha * 0.8})`
      ctx.lineWidth = 2 * alpha
      ctx.beginPath()
      ctx.arc(0, 0, curR * 0.55, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.25})`
      ctx.beginPath()
      ctx.arc(0, 0, curR * 0.5, 0, Math.PI * 2)
      ctx.fill()

      // 地面震裂出的 6 瓣绿莲花瓣纹
      ctx.strokeStyle = `rgba(209, 250, 229, ${alpha * 0.85})`
      ctx.lineWidth = 1.5 * alpha
      for (let i = 0; i < 6; i++) {
        const lpAngle = (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(lpAngle) * curR * 0.8, Math.sin(lpAngle) * curR * 0.8)
        ctx.stroke()
      }

      // 砸击在地的药王杵
      const pestleY = -14 * (1 - prog)
      drawWeaponSpriteOrFallback(ctx, 'pill_pestle', 0, pestleY, 0.25, 42, '#10b981', (c, x, y, a) => {
        if (typeof drawPestleEntity === 'function') drawPestleEntity(c, x, y, a, 1.25)
      })
      ctx.restore()
    }

    // 20. 千草腐仙葫 (Poison Gourd): 剧毒仙丸破空 + 腐蚀剧毒浓沼
    else if (atk.type === 'poison_pellet_pool') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog * 0.35)

      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.shadowColor = '#84cc16'
      ctx.shadowBlur = 16

      if (atk.phase === 'fly') {
        // 飞行中发光的幽绿爆裂毒丹
        ctx.fillStyle = '#a3e635'
        ctx.beginPath()
        ctx.arc(0, 0, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(-2, -2, 2.5, 0, Math.PI * 2)
        ctx.fill()

        // 剧毒拖尾气雾
        ctx.strokeStyle = 'rgba(163, 230, 53, 0.6)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(0, 0); ctx.lineTo(-10, -4)
        ctx.stroke()
      } else {
        // 炸开沉留的大片腐蚀毒沼 (Toxic Boiling Acid Pool)
        ctx.fillStyle = `rgba(132, 204, 22, ${alpha * 0.45})`
        ctx.beginPath()
        ctx.ellipse(0, 0, atk.radius, atk.radius * 0.6, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = `rgba(190, 242, 100, ${alpha * 0.9})`
        ctx.lineWidth = 2.2
        ctx.stroke()

        // 毒沼气泡与升腾绿雾 (Bubbling Toxic Gas)
        const bubblePhase = Math.sin((atk.duration - atk.life) * 12)
        ctx.fillStyle = '#ecfccb'
        ctx.beginPath()
        ctx.arc(bubblePhase * 8, -4 + bubblePhase * 3, 3, 0, Math.PI * 2)
        ctx.arc(-bubblePhase * 10, 2, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    // 21. 化血狂刀 (Demon Blade): 猩红极速血月刀芒贯穿 + 狂暴血煞
    else if (atk.type === 'demon_blood_crescent') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog * 0.3)

      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.rotate(atk.angle)
      ctx.shadowColor = '#ef4444'
      ctx.shadowBlur = 22

      // 撕裂长空的猩红半月斩芒 (Crimson Crescent Blade Wave)
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.35})`
      ctx.beginPath()
      ctx.arc(0, 0, 28, -Math.PI * 0.48, Math.PI * 0.48)
      ctx.quadraticCurveTo(8, 0, 0, -28)
      ctx.closePath()
      ctx.fill()

      // 极锐血芒外弧
      ctx.strokeStyle = `rgba(254, 202, 202, ${alpha * 0.95})`
      ctx.lineWidth = 4.5
      ctx.beginPath()
      ctx.arc(0, 0, 28, -Math.PI * 0.48, Math.PI * 0.48)
      ctx.stroke()

      // 刀芒后方拖曳的血煞残雷
      ctx.strokeStyle = `rgba(185, 28, 28, ${alpha * 0.7})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-12, -18); ctx.lineTo(-24, -10); ctx.lineTo(-16, 0); ctx.lineTo(-24, 10); ctx.lineTo(-12, 18)
      ctx.stroke()

      drawWeaponSpriteOrFallback(ctx, 'demon_blade', 0, 0, 0, 46, '#ef4444', (c, x, y, a) => {
        if (typeof drawDemonBladeEntity === 'function') drawDemonBladeEntity(c, x, y, a, 1.25)
      })
      ctx.restore()
    }

    // 22. 天魔血煞爪 (Demon Claws): 虚空三爪暗劲裂缝 + 猩红抓痕爆破
    else if (atk.type === 'demon_claw_marks') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)

      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.rotate(atk.angle)
      ctx.shadowColor = '#dc2626'
      ctx.shadowBlur = 20

      // 三道巨大撕裂虚空的血魔利爪光痕 (Three Asura Void Claws)
      for (let s = -1; s <= 1; s++) {
        const offY = s * 13
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha * 0.95})`
        ctx.lineWidth = 4.5 * alpha
        ctx.beginPath()
        ctx.moveTo(-22, offY - 10)
        ctx.quadraticCurveTo(6, offY, 24, offY + 10)
        ctx.stroke()

        // 爪心雪白极锐撕裂线
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`
        ctx.lineWidth = 2 * alpha
        ctx.beginPath()
        ctx.moveTo(-18, offY - 8)
        ctx.quadraticCurveTo(6, offY, 20, offY + 8)
        ctx.stroke()
      }

      // 虚空被撕碎的血色暗劲爆破
      ctx.fillStyle = `rgba(248, 113, 113, ${alpha * 0.5})`
      ctx.beginPath()
      ctx.arc(6, 0, 14 * alpha, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // 23. 修罗血皇玺 (Demon Seal): 血岳悬天泰山砸地 + 冲天血浪海啸
    else if (atk.type === 'asura_blood_seal') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)
      const curR = atk.radius * Math.sin(prog * Math.PI)

      ctx.save()
      ctx.translate(atk.targetX, atk.targetY)
      ctx.shadowColor = '#991b1b'
      ctx.shadowBlur = 24

      // 修罗血浪海啸冲击外环 (Crimson Blood Tidal Wave)
      ctx.strokeStyle = `rgba(185, 28, 28, ${alpha * 0.95})`
      ctx.lineWidth = 5.5 * alpha
      ctx.beginPath()
      ctx.arc(0, 0, curR, 0, Math.PI * 2)
      ctx.stroke()

      // 地面皇玺深印 (Imperial Seal Imprint)
      ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.45})`
      ctx.fillRect(-26, -26, 52, 52)
      ctx.strokeStyle = `rgba(254, 202, 202, ${alpha * 0.9})`
      ctx.lineWidth = 2.5
      ctx.strokeRect(-26, -26, 52, 52)

      // 皇玺印泥铭文金芒
      ctx.strokeStyle = `rgba(254, 240, 138, ${alpha * 0.85})`
      ctx.lineWidth = 2 * alpha
      ctx.strokeRect(-20, -20, 40, 40)
      ctx.beginPath()
      ctx.moveTo(-12, -12); ctx.lineTo(-12, 12)
      ctx.moveTo(12, -12); ctx.lineTo(12, 12)
      ctx.stroke()

      // 从天而降砸入大地的血皇玺 (Imperial Seal Drop)
      const sealY = -22 * (1 - prog)
      drawWeaponSpriteOrFallback(ctx, 'demon_seal', 0, sealY, 0, 46, '#991b1b', (c, x, y) => {
        if (typeof drawDemonSealEntity === 'function') drawDemonSealEntity(c, x, y, 0, 1.3)
      })
      ctx.restore()
    }

    // 24. 幽冥引魂灯 (Ghost Lantern): 灵动碧磷双鬼火追踪轰鸣
    else if (atk.type === 'nether_ghost_wisp') {
      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.shadowColor = '#2dd4bf'
      ctx.shadowBlur = 18

      // 幽冥鬼火灵火外晕
      ctx.fillStyle = 'rgba(45, 212, 191, 0.85)'
      ctx.beginPath()
      ctx.arc(0, 0, 8.5, 0, Math.PI * 2)
      ctx.fill()

      // 白炽摄魂灵火核心
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2)
      ctx.fill()

      // 蛇形摆动的青幽拖尾 (Swirling Spectral Flame Tail)
      const tailAngle = (atk.angle || 0) + Math.PI
      for (let t = 1; t <= 3; t++) {
        const tx = Math.cos(tailAngle) * t * 6
        const ty = Math.sin(tailAngle) * t * 6
        ctx.fillStyle = `rgba(94, 234, 212, ${(0.8 - t * 0.2).toFixed(2)})`
        ctx.beginPath()
        ctx.arc(tx, ty, 6 - t * 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    // 25. 白骨哀丧棒 (Ghost Wand): 360°百鬼同哭音煞圆环 + 苍白恐惧震退
    else if (atk.type === 'mourning_wail_ring') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog)
      const curR = atk.range * prog

      ctx.save()
      ctx.translate(atk.x, atk.y)
      ctx.shadowColor = '#cbd5e1'
      ctx.shadowBlur = 18

      // 360度凄厉白骨音煞狂澜 (Ghost-Wail Sonic Ring)
      ctx.strokeStyle = `rgba(241, 245, 249, ${alpha * 0.95})`
      ctx.lineWidth = 4.5 * alpha
      ctx.beginPath()
      ctx.arc(0, 0, curR, 0, Math.PI * 2)
      ctx.stroke()

      // 苍白鬼环外围尖啸鬼面幻影 (Screaming Ghost Faces)
      for (let i = 0; i < 6; i++) {
        const ghAngle = (i / 6) * Math.PI * 2 + prog * 2
        const gx = Math.cos(ghAngle) * curR
        const gy = Math.sin(ghAngle) * curR
        ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.7})`
        ctx.beginPath()
        ctx.arc(gx, gy, 5 * alpha, 0, Math.PI * 2)
        ctx.fill()
      }

      // 阴寒结霜内环
      ctx.strokeStyle = `rgba(94, 234, 212, ${alpha * 0.6})`
      ctx.lineWidth = 1.8 * alpha
      ctx.beginPath()
      ctx.arc(0, 0, curR * 0.6, 0, Math.PI * 2)
      ctx.stroke()

      // 高举施法的哀丧白骨棒
      drawWeaponSpriteOrFallback(ctx, 'ghost_wand', 0, -14, 0.25, 42, '#e2e8f0', (c, x, y, a) => {
        if (typeof drawGhostWandEntity === 'function') drawGhostWandEntity(c, x, y, a, 1.25)
      })
      ctx.restore()
    }

    // 26. 百鬼聚灵幡 (Ghost Banner): 百鬼夜行螺旋怨魂钻刺
    else if (atk.type === 'ghost_parade_swarm') {
      const prog = 1 - Math.max(0, atk.life / atk.duration)
      const alpha = Math.max(0, 1 - prog * 0.35)
      const curX = atk.curX || (atk.x + Math.cos(atk.angle) * (atk.range * prog))
      const curY = atk.curY || (atk.y + Math.sin(atk.angle) * (atk.range * prog))

      ctx.save()
      ctx.translate(curX, curY)
      ctx.rotate(atk.angle)
      ctx.shadowColor = '#34d399'
      ctx.shadowBlur = 18

      // 百鬼螺旋怨魂风暴 (Ghost Vortex Swarm)
      const spiralSpin = prog * Math.PI * 6
      for (let s = -1; s <= 1; s++) {
        const sDist = s * 12
        const sy = Math.sin(spiralSpin + s) * 14
        const sx = s * 8

        // 咆哮鬼影核心
        ctx.fillStyle = `rgba(167, 243, 208, ${alpha * 0.9})`
        ctx.beginPath()
        ctx.arc(sx, sy, 7, 0, Math.PI * 2)
        ctx.fill()

        // 鬼眼碧磷
        ctx.fillStyle = '#0f172a'
        ctx.beginPath()
        ctx.arc(sx + 3, sy - 2, 2, 0, Math.PI * 2)
        ctx.arc(sx + 3, sy + 2, 2, 0, Math.PI * 2)
        ctx.fill()

        // 怨魂撕裂气流拖尾
        ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.65})`
        ctx.lineWidth = 2.4
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.quadraticCurveTo(sx - 16, sy - s * 8, sx - 28, sy)
        ctx.stroke()
      }
      ctx.restore()

      // 百鬼聚灵神幡随行穿云
      drawWeaponSpriteOrFallback(ctx, 'ghost_banner', curX, curY, atk.angle, 44, '#a7f3d0', (c, x, y, a) => {
        if (typeof drawGhostBannerEntity === 'function') drawGhostBannerEntity(c, x, y, a, 1.25)
      })
    }

    ctx.restore()
  }
}

// ==========================================
// 赤炎葫芦与青羽灵狐卡片技能实体与动作管线
// ==========================================

function triggerGourdFireBeam(target, damage) {
  const p = game.player
  const gx = p.x + 22
  const gy = p.y - 20
  const angle = Math.atan2(target.y - gy, target.x - gx)
  const dist = Math.hypot(target.x - gx, target.y - gy)
  const length = Math.max(180, Math.min(320, dist + 70))

  game.specialAttacks.push({
    type: 'gourd_flame_beam',
    startX: gx,
    startY: gy,
    angle,
    length,
    width: 28,
    life: 0.38,
    duration: 0.38,
    damage: damage || (game.attack * 1.8 * (game.firePower || 1)),
    hitEnemies: new Set(),
    tickTimer: 0.08,
    color: '#ff6a18'
  })
  if (!isHeadless && sound.flame) sound.flame()
}

function drawFloatingGourd(ctx, p, elapsed) {
  if (isHeadless || !game.weapons || !game.weapons.some(x => x.id === 'fire')) return

  const activeBeam = (game.specialAttacks || []).find(a => a.type === 'gourd_flame_beam')
  const bob = Math.sin(elapsed * 3.6) * 3
  const gx = p.x + 22
  const gy = p.y - 20 + bob

  let angle = Math.sin(elapsed * 2.4) * 0.15 - 0.25
  if (activeBeam) {
    angle = activeBeam.angle + Math.PI * 0.15
  }

  ctx.save()
  ctx.translate(gx, gy)
  ctx.rotate(angle)
  ctx.shadowColor = '#ff6a18'
  ctx.shadowBlur = 12

  const spriteObj = (typeof skillSprites !== 'undefined') ? skillSprites.gourd : null
  if (spriteObj && spriteObj.loaded && spriteObj.img) {
    ctx.drawImage(spriteObj.img, -18, -20, 36, 40)
  } else {
    // 矢量备用绘制：赤炎宝葫芦
    ctx.fillStyle = '#c82808'
    ctx.beginPath()
    ctx.arc(0, 6, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 1.2
    ctx.stroke()

    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(0, -6, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#d4af37'
    ctx.fillRect(-6, -1, 12, 3)

    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(-2.5, -16, 5, 4)
    ctx.beginPath()
    ctx.moveTo(0, -22)
    ctx.lineTo(3, -16)
    ctx.lineTo(-3, -16)
    ctx.closePath()
    ctx.fill()
  }

  if (Math.random() < 0.25 && !game.paused) {
    game.particles.push({
      x: gx + (Math.random() - 0.5) * 6,
      y: gy - 16,
      vx: (Math.random() - 0.5) * 16,
      vy: -18 - Math.random() * 16,
      life: 0.28,
      color: '#ffa500'
    })
  }

  ctx.restore()
}

function updatePetFox(dt) {
  if (isHeadless || !game.pets || game.pets.length === 0) return

  const p = game.player
  if (!game.petFox) {
    game.petFox = {
      x: p.x - 28,
      y: p.y + 12,
      vx: 0,
      vy: 0,
      state: 'follow',
      facing: 1,
      animTimer: 0,
      pounceTimer: 0,
      pounceDuration: 0.32,
      returnTimer: 0,
      returnDuration: 0.25,
      arcY: 0,
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      trail: [],
      damage: game.petDamage || 42
    }
  }

  const fox = game.petFox
  fox.animTimer += dt

  // 每一帧无论处于任何状态均衰减残影生命周期，飞扑结束后残影自然淡出消失，避免残留在场上
  if (fox.trail && fox.trail.length > 0) {
    for (const t of fox.trail) t.life -= dt
    fox.trail = fox.trail.filter(t => t.life > 0)
  }

  if (fox.state === 'follow') {
    fox.arcY = 0
    const wantX = p.x - 26
    const wantY = p.y + 12 + Math.sin(fox.animTimer * 4) * 2.5
    const dx = wantX - fox.x
    const dy = wantY - fox.y
    const dist = Math.hypot(dx, dy)

    if (dist > 6) {
      const spd = Math.min(320, dist * 6.5)
      fox.x += (dx / dist) * spd * dt
      fox.y += (dy / dist) * spd * dt
      if (Math.abs(dx) > 2) fox.facing = dx >= 0 ? 1 : -1
    }

    if (Math.random() < 0.22 && !game.paused) {
      game.particles.push({
        x: fox.x + (Math.random() - 0.5) * 10,
        y: fox.y + 8,
        vx: -fox.facing * 12,
        vy: -6,
        life: 0.3,
        color: '#88eedd'
      })
    }
  } else if (fox.state === 'pounce') {
    fox.pounceTimer -= dt
    const prog = 1 - Math.max(0, fox.pounceTimer / fox.pounceDuration)
    fox.x = fox.startX + (fox.targetX - fox.startX) * prog
    fox.y = fox.startY + (fox.targetY - fox.startY) * prog
    fox.arcY = -Math.sin(prog * Math.PI) * 55

    if (!fox.trail) fox.trail = []
    fox.trail.unshift({ x: fox.x, y: fox.y + fox.arcY, facing: fox.facing, life: 0.16 })

    if (fox.pounceTimer <= 0) {
      fox.state = 'return'
      fox.returnTimer = 0.25
      fox.returnDuration = 0.25
      fox.arcY = 0
      game.cameraShake = 0.14
      if (!isHeadless && sound.pounce) sound.pounce()

      const aoeR = 55
      for (const enemy of game.enemies) {
        if (Math.hypot(enemy.x - fox.targetX, enemy.y - fox.targetY) <= aoeR + (enemy.r || 12)) {
          damageEnemy(enemy, fox.damage, '#64e8cb')
          burst(enemy.x, enemy.y, '#64e8cb', 5, 25)
        }
      }

      game.specialAttacks.push({
        type: 'fox_claw_impact',
        x: fox.targetX,
        y: fox.targetY,
        life: 0.28,
        duration: 0.28,
        radius: aoeR,
        color: '#64e8cb'
      })
      burst(fox.targetX, fox.targetY, '#88eedd', 14, 50)
    }
  } else if (fox.state === 'return') {
    fox.returnTimer -= dt
    fox.arcY = 0
    const rdx = (p.x - 26) - fox.x
    const rdy = (p.y + 12) - fox.y
    const rdist = Math.hypot(rdx, rdy)

    if (rdist <= 20 || fox.returnTimer <= 0) {
      fox.state = 'follow'
    } else {
      const rspd = Math.max(380, rdist / Math.max(0.01, fox.returnTimer))
      fox.x += (rdx / rdist) * rspd * dt
      fox.y += (rdy / rdist) * rspd * dt
      fox.facing = rdx >= 0 ? 1 : -1
    }
  }
}

function triggerFoxPounceAttack(target, damage) {
  if (isHeadless) return
  const p = game.player
  if (!game.petFox) {
    game.petFox = {
      x: p.x - 28,
      y: p.y + 12,
      vx: 0,
      vy: 0,
      state: 'follow',
      facing: 1,
      animTimer: 0,
      pounceTimer: 0,
      pounceDuration: 0.32,
      returnTimer: 0,
      returnDuration: 0.25,
      arcY: 0,
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      trail: [],
      damage: damage || (game.petDamage || 42)
    }
  }
  const fox = game.petFox
  fox.state = 'pounce'
  fox.startX = fox.x
  fox.startY = fox.y
  fox.targetX = target.x
  fox.targetY = target.y
  fox.facing = target.x >= fox.x ? 1 : -1
  fox.trail = []
  const dist = Math.hypot(target.x - fox.x, target.y - fox.y)
  const duration = Math.max(0.24, Math.min(0.40, dist / 420))
  fox.pounceTimer = duration
  fox.pounceDuration = duration
  fox.damage = damage || (game.petDamage || 42)
}

function drawPetFox(ctx, elapsed) {
  if (isHeadless || !game.pets || game.pets.length === 0 || !game.petFox) return

  const fox = game.petFox
  const fy = fox.y + (fox.arcY || 0)

  // 飞扑残影：平滑衰减，在生命周期内渐隐消失
  if (fox.trail && fox.trail.length > 0) {
    ctx.save()
    for (const t of fox.trail) {
      const alpha = Math.max(0, Math.min(0.45, (t.life / 0.16) * 0.45))
      if (alpha <= 0.01) continue
      ctx.save()
      ctx.translate(t.x, t.y)
      ctx.scale(t.facing, 1)
      ctx.globalAlpha = alpha
      ctx.shadowColor = '#64e8cb'
      ctx.shadowBlur = 10
      const spriteObj = (typeof skillSprites !== 'undefined') ? skillSprites.fox : null
      if (spriteObj && spriteObj.loaded && spriteObj.img) {
        ctx.drawImage(spriteObj.img, -20, -22, 40, 44)
      }
      ctx.restore()
    }
    ctx.restore()
  }

  ctx.save()
  ctx.translate(fox.x, fy)
  ctx.scale(fox.facing, 1)

  const isAirborne = fox.state === 'pounce'
  const tilt = isAirborne ? -0.35 : Math.sin(elapsed * 4) * 0.06
  ctx.rotate(tilt)

  ctx.shadowColor = '#64e8cb'
  ctx.shadowBlur = 14

  const spriteObj = (typeof skillSprites !== 'undefined') ? skillSprites.fox : null
  if (spriteObj && spriteObj.loaded && spriteObj.img) {
    ctx.drawImage(spriteObj.img, -22, -24, 44, 48)
  } else {
    // 矢量备用绘制：青羽灵狐
    ctx.fillStyle = '#ecfeff'
    ctx.beginPath()
    ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#a5f3fc'
    ctx.lineWidth = 1.2
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(8, -6, 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#06b6d4'
    ctx.beginPath()
    ctx.moveTo(8, -12)
    ctx.lineTo(13, -19)
    ctx.lineTo(15, -10)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#67e8f9'
    ctx.beginPath()
    ctx.moveTo(-10, -2)
    ctx.quadraticCurveTo(-24, -14, -16, -22)
    ctx.quadraticCurveTo(-10, -18, -8, 2)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(11, -7, 1.8, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}


/* ==========================================================================
   秘境领主 Boss 系统 (Xianxia Boss System)
   - 四大修仙境界领主：千年赤炼蛟 (筑基), 幽冥白骨尸皇 (结丹), 九天噬魂魔尊 (元婴), 巡天金翅大鹏 (化神)
   - 包含近战突袭 (冲锋带预警线)、弹幕攻击 (扇形/环形/追踪)、范围法阵 (地火熔岩/尸毒死域/虚空引力/天雷破空)
   - 多阶段血条与狂暴机制 (Phase Transitions)
   - 顶置领主血条 UI 替代倒计时，平滑受击残影条 (Lag Bar)
   - 击杀全屏祥瑞金雨，爆出海量高阶灵气与稀世法宝，丝滑神识吸纳与清点结算
   ========================================================================== */

const BOSS_CONFIGS = {
  red_dragon: {
    id: 'red_dragon',
    name: '千年赤炼蛟',
    title: '筑基境领主 · 赤焰火煞',
    lore: '隐伏于赤焰熔渊深处修道千年的凶煞恶蛟。吞吐地心熔岩，赤鳞如烈火燎原，头顶独角蕴含狂暴火毒。',
    r: 44,
    color: '#e63946',
    secondaryColor: '#ffbe0b',
    auraColor: 'rgba(230, 57, 70, 0.45)',
    spriteKey: 'red_dragon',
    phases: [
      {
        phaseIndex: 0,
        name: '游龙翻江',
        hp: 4500,
        speed: 70,
        damage: 18,
        rushSpeed: 440,
        rushDuration: 0.42,
        telegraphTime: 0.75,
        attackCooldowns: { melee: 4.8, barrage: 3.5, aoe: 5.5 },
        barrageCount: 5,
        aoeCount: 3,
        aoeRadius: 48
      },
      {
        phaseIndex: 1,
        name: '焚天蛟煞 · 狂暴',
        hp: 6500,
        speed: 95,
        damage: 26,
        rushSpeed: 520,
        rushDuration: 0.48,
        telegraphTime: 0.55,
        attackCooldowns: { melee: 3.2, barrage: 2.2, aoe: 3.8 },
        barrageCount: 9,
        aoeCount: 6,
        aoeRadius: 56,
        multiRush: 2
      }
    ]
  },
  corpse_emperor: {
    id: 'corpse_emperor',
    name: '幽冥白骨尸皇',
    title: '结丹境领主 · 幽冥玄煞',
    lore: '万千上古神魔残骸与九幽怨煞孕育而成的白骨暴君。本体由分散的巨型魔骨构筑，双臂拱卫，骨盾牢不可破。',
    r: 46,
    color: '#06d6a0',
    secondaryColor: '#f8f9fa',
    auraColor: 'rgba(6, 214, 160, 0.45)',
    spriteKey: 'corpse_emperor',
    phases: [
      {
        phaseIndex: 0,
        name: '幽冥神颅 · 双骨镇煞',
        hp: 12000,
        armCount: 2,
        armHp: 3200,
        speed: 55,
        damage: 22,
        defenseRatio: 0.10, // 未击杀手臂时巨量防御 (90% 减伤)
        vulnerabilityRatio: 1.25, // 击杀手臂后防御大幅下降 (125% 易伤)
        rushSpeed: 460,
        rushDuration: 0.38,
        telegraphTime: 0.8,
        attackCooldowns: { melee: 5.0, barrage: 3.5, aoe: 5.0 }
      },
      {
        phaseIndex: 1,
        name: '极恶三首 · 六臂狂怒',
        hp: 18000,
        armCount: 6,
        armHp: 2400,
        speed: 70,
        berserkSpeed: 105,
        damage: 30,
        defenseRatio: 0.10,
        vulnerabilityRatio: 1.25,
        rushSpeed: 540,
        rushDuration: 0.44,
        telegraphTime: 0.55,
        attackCooldowns: { melee: 4.6, barrage: 3.2, aoe: 4.2 }
      }
    ]
  },
  asura_demon: {
    id: 'asura_demon',
    name: '九天噬魂魔尊',
    title: '元婴境领主 · 虚空真魔',
    lore: '撕裂域外虚空降临凡界的元神巨魔，吞纳万千修士精魂。三头六臂，魔气滔天，擅使空间崩塌与魔魂弹幕。',
    r: 50,
    color: '#7209b7',
    secondaryColor: '#f72585',
    auraColor: 'rgba(114, 9, 183, 0.5)',
    spriteKey: 'asura_demon',
    phases: [
      {
        phaseIndex: 0,
        name: '天魔幻象',
        hp: 18000,
        speed: 70,
        damage: 28,
        rushSpeed: 480,
        rushDuration: 0.4,
        telegraphTime: 0.75,
        attackCooldowns: { melee: 5.2, barrage: 3.8, aoe: 6.0 },
        barrageCount: 8,
        aoeCount: 3,
        aoeRadius: 65
      },
      {
        phaseIndex: 1,
        name: '噬魂魔躯',
        hp: 26000,
        speed: 90,
        damage: 38,
        rushSpeed: 560,
        rushDuration: 0.45,
        telegraphTime: 0.6,
        attackCooldowns: { melee: 3.8, barrage: 2.6, aoe: 4.5 },
        barrageCount: 14,
        aoeCount: 5,
        aoeRadius: 75,
        singularity: true
      },
      {
        phaseIndex: 2,
        name: '天崩地裂 · 终焉天魔',
        hp: 36000,
        speed: 105,
        damage: 48,
        rushSpeed: 620,
        rushDuration: 0.5,
        telegraphTime: 0.45,
        attackCooldowns: { melee: 2.6, barrage: 1.8, aoe: 3.0 },
        barrageCount: 22,
        aoeCount: 7,
        aoeRadius: 85,
        singularity: true,
        teleport: true
      }
    ]
  },
  celestial_peng: {
    id: 'celestial_peng',
    name: '巡天金翅大鹏',
    title: '化神境领主 · 太古神禽',
    lore: '水击三千里，抟扶摇而上九万里！太古金翅神禽，羽化神雷，飞扑破空如金虹贯日，执掌天地太乙罡风。',
    r: 48,
    color: '#ffb703',
    secondaryColor: '#ffffff',
    auraColor: 'rgba(255, 183, 3, 0.5)',
    spriteKey: 'celestial_peng',
    phases: [
      {
        phaseIndex: 0,
        name: '扶摇九霄',
        hp: 35000,
        speed: 80,
        damage: 34,
        rushSpeed: 540,
        rushDuration: 0.42,
        telegraphTime: 0.7,
        attackCooldowns: { melee: 4.4, barrage: 3.0, aoe: 4.8 },
        barrageCount: 15,
        aoeCount: 4,
        aoeRadius: 60
      },
      {
        phaseIndex: 1,
        name: '大鹏搏龙 · 极速金芒',
        hp: 55000,
        speed: 110,
        damage: 48,
        rushSpeed: 680,
        rushDuration: 0.48,
        telegraphTime: 0.45,
        attackCooldowns: { melee: 2.4, barrage: 1.8, aoe: 3.0 },
        barrageCount: 24,
        aoeCount: 6,
        aoeRadius: 75,
        stormTornadoes: true
      }
    ]
  },
  primordial_god: {
    id: 'primordial_god',
    name: '混沌太虚道祖',
    title: '终极飞升天劫 · 天道化身',
    lore: '执掌太虚万界造化之天道本源！引动九霄玄刹神雷与混沌太极法则，破尽万法者方可白日飞升、超脱轮回！',
    r: 54,
    color: '#4cc9f0',
    secondaryColor: '#f72585',
    auraColor: 'rgba(76, 201, 240, 0.55)',
    spriteKey: 'primordial_god',
    phases: [
      {
        phaseIndex: 0,
        name: '混沌初开 · 阴阳玄极',
        hp: 50000,
        speed: 85,
        damage: 36,
        rushSpeed: 560,
        rushDuration: 0.45,
        telegraphTime: 0.65,
        attackCooldowns: { melee: 4.0, barrage: 2.8, aoe: 4.8 },
        barrageCount: 16,
        aoeCount: 4,
        aoeRadius: 70
      },
      {
        phaseIndex: 1,
        name: '九天玄刹 · 诸天星陨',
        hp: 75000,
        speed: 105,
        damage: 46,
        rushSpeed: 640,
        rushDuration: 0.5,
        telegraphTime: 0.48,
        attackCooldowns: { melee: 2.6, barrage: 2.0, aoe: 3.4 },
        barrageCount: 24,
        aoeCount: 6,
        aoeRadius: 85,
        singularity: true,
        multiRush: 2
      },
      {
        phaseIndex: 2,
        name: '万道归一 · 终极飞升劫',
        hp: 110000,
        speed: 125,
        damage: 58,
        rushSpeed: 720,
        rushDuration: 0.52,
        telegraphTime: 0.38,
        attackCooldowns: { melee: 2.0, barrage: 1.5, aoe: 2.6 },
        barrageCount: 32,
        aoeCount: 8,
        aoeRadius: 95,
        singularity: true,
        teleport: true,
        stormTornadoes: true
      }
    ]
  }
}

// 领主贴图缓存
let bossRedDragonImg = null
let bossRedDragonLoaded = false
let bossRedDragonSheetImg = null
let bossRedDragonSheetLoaded = false
let bossDragonFireballImg = null
let bossDragonFireballLoaded = false
let bossDragonLavaImg = null
let bossDragonLavaLoaded = false

// 幽冥白骨尸皇专属序列帧与弹幕贴图
let bossCorpseSkullSheetImg = null
let bossCorpseSkullSheetLoaded = false
let bossCorpseTriSkullSheetImg = null
let bossCorpseTriSkullSheetLoaded = false
let bossCorpseArmSheetImg = null
let bossCorpseArmSheetLoaded = false
let bossCorpseKnuckleImg = null
let bossCorpseKnuckleLoaded = false
let bossCorpseGhostFireImg = null
let bossCorpseGhostFireLoaded = false
let bossCorpsePoisonPoolImg = null
let bossCorpsePoisonPoolLoaded = false

if (typeof Image !== 'undefined') {
  bossRedDragonImg = new Image()
  bossRedDragonImg.src = './boss_red_dragon.png'
  bossRedDragonImg.onload = () => { bossRedDragonLoaded = true }

  bossRedDragonSheetImg = new Image()
  bossRedDragonSheetImg.src = './boss_red_dragon_sheet.png'
  bossRedDragonSheetImg.onload = () => { bossRedDragonSheetLoaded = true }

  bossDragonFireballImg = new Image()
  bossDragonFireballImg.src = './effect_dragon_fireball.png'
  bossDragonFireballImg.onload = () => { bossDragonFireballLoaded = true }

  bossDragonLavaImg = new Image()
  bossDragonLavaImg.src = './effect_dragon_lava.png'
  bossDragonLavaImg.onload = () => { bossDragonLavaLoaded = true }

  bossCorpseSkullSheetImg = new Image()
  bossCorpseSkullSheetImg.src = './boss_corpse_skull_sheet.png'
  bossCorpseSkullSheetImg.onload = () => { bossCorpseSkullSheetLoaded = true }

  bossCorpseTriSkullSheetImg = new Image()
  bossCorpseTriSkullSheetImg.src = './boss_corpse_tri_skull_sheet.png'
  bossCorpseTriSkullSheetImg.onload = () => { bossCorpseTriSkullSheetLoaded = true }

  bossCorpseArmSheetImg = new Image()
  bossCorpseArmSheetImg.src = './boss_corpse_arm_sheet.png'
  bossCorpseArmSheetImg.onload = () => { bossCorpseArmSheetLoaded = true }

  bossCorpseKnuckleImg = new Image()
  bossCorpseKnuckleImg.src = './effect_corpse_knuckle.png'
  bossCorpseKnuckleImg.onload = () => { bossCorpseKnuckleLoaded = true }

  bossCorpseGhostFireImg = new Image()
  bossCorpseGhostFireImg.src = './effect_corpse_ghost_fire.png'
  bossCorpseGhostFireImg.onload = () => { bossCorpseGhostFireLoaded = true }

  bossCorpsePoisonPoolImg = new Image()
  bossCorpsePoisonPoolImg.src = './effect_corpse_poison_pool.png'
  bossCorpsePoisonPoolImg.onload = () => { bossCorpsePoisonPoolLoaded = true }
}

/* ---------- 领主状态与生成逻辑 ---------- */

function getBossConfigForRealm(realm) {
  if (realm === 1) return BOSS_CONFIGS.red_dragon
  if (realm === 2) return BOSS_CONFIGS.corpse_emperor
  if (realm === 3) return BOSS_CONFIGS.asura_demon
  if (realm >= 4) {
    if (game.primordialGodEncountered || (typeof isMaxRealmMaxLevel === 'function' && isMaxRealmMaxLevel() && (game.bossesDefeated && game.bossesDefeated >= 4))) {
      return BOSS_CONFIGS.primordial_god
    }
    return BOSS_CONFIGS.celestial_peng
  }
  return BOSS_CONFIGS.red_dragon
}

/* ---------- 幽冥白骨尸皇：分散多部位与阶段攻击系统 ---------- */

function initCorpseEmperorArms(boss, phaseIndex) {
  if (!boss || boss.id !== 'corpse_emperor') return
  // 清理现有属于此领主的骨臂敌人
  game.enemies = game.enemies.filter(e => !(e.isBossPart && e.bossRef === boss))
  boss.arms = []

  const armHp = isHeadless
    ? (phaseIndex === 0 ? 30 : 22)
    : (phaseIndex === 0 ? 3200 : 2400)

  let armDefs = []
  if (phaseIndex === 0) {
    // 一阶段：左右两只巨型骷髅手臂，各自发射5枚指节，双臂合计10枚
    armDefs = [
      { index: 0, side: -1, type: 'knuckle', offsetX: -85, offsetY: 20, name: '左幽冥玄骨臂', cooldown: 2.5 },
      { index: 1, side: 1, type: 'knuckle', offsetX: 85, offsetY: 20, name: '右幽冥玄骨臂', cooldown: 5.0 }
    ]
  } else {
    // 二阶段：6只骨臂 (2只指节弹幕，2只拍击玩家，2只追踪鬼火)
    // 节奏大幅优化：错峰拉开初始 CD，循环间隔从 3~5 秒延长至 6~10 秒，杜绝开场瞬间全屏技能轰炸
    armDefs = [
      { index: 0, side: -1, type: 'knuckle', offsetX: -110, offsetY: -35, name: '左天枢指节臂', cooldown: 3.2 },
      { index: 1, side: 1, type: 'knuckle', offsetX: 110, offsetY: -35, name: '右天璇指节臂', cooldown: 7.2 },
      { index: 2, side: -1, type: 'slam', offsetX: -135, offsetY: 30, name: '左碎岳狂臂', cooldown: 5.2 },
      { index: 3, side: 1, type: 'slam', offsetX: 135, offsetY: 30, name: '右裂地狂臂', cooldown: 10.5 },
      { index: 4, side: -1, type: 'ghost_fire', offsetX: -80, offsetY: 95, name: '左噬魂幽臂', cooldown: 8.0 },
      { index: 5, side: 1, type: 'ghost_fire', offsetX: 80, offsetY: 95, name: '右黄泉幽臂', cooldown: 13.0 }
    ]
  }

  // 骷髅神颅一阶段主动反击计时器初始化
  boss.skullAttackCooldown = 4.5
  boss.skullWindup = 0
  boss.skullAttackCount = 0

  for (const def of armDefs) {
    const arm = {
      id: `corpse_arm_${phaseIndex}_${def.index}`,
      index: def.index,
      side: def.side,
      type: def.type,
      name: def.name,
      hp: armHp,
      maxHp: armHp,
      baseOffsetX: def.offsetX,
      baseOffsetY: def.offsetY,
      x: boss.x + def.offsetX,
      y: boss.y + def.offsetY,
      r: 26,
      hit: 0,
      destroyed: false,
      cooldown: def.cooldown || 3.0,
      state: 'idle',
      slamTarget: { x: 0, y: 0 },
      slamTimer: 0,
      telegraphTimer: 0,
      maxTelegraph: 0.75,
      sheetAnim: (typeof SpriteSheetAnimation !== 'undefined' && bossCorpseArmSheetImg) ? new SpriteSheetAnimation({
        img: bossCorpseArmSheetImg,
        frameW: 180,
        frameH: 180,
        cols: 4,
        rows: 2,
        totalFrames: 8,
        fps: 8,
        loop: true
      }) : null
    }

    const armEnemy = {
      isBossPart: true,
      bossPartType: 'arm',
      bossRef: boss,
      armRef: arm,
      partIndex: def.index,
      x: arm.x,
      y: arm.y,
      r: 26,
      hp: arm.hp,
      maxHp: arm.maxHp,
      speed: 0,
      damage: 12,
      color: '#06d6a0',
      hit: 0,
      kind: 'boss_part'
    }
    arm.enemyRef = armEnemy
    boss.arms.push(arm)
    game.enemies.push(armEnemy)
  }
}

function onCorpseEmperorArmDestroyed(arm) {
  if (!arm) return
  arm.hp = 0
  arm.destroyed = true
  const boss = game.boss
  if (!boss || boss.id !== 'corpse_emperor' || !boss.arms) return

  // 从普通怪列表中移除该骨臂
  game.enemies = game.enemies.filter(e => e.armRef !== arm)

  const livingArms = boss.arms.filter(a => a.hp > 0 && !a.destroyed)
  if (livingArms.length === 0) {
    if (boss.phaseIndex === 0) {
      addLog('【九幽骨盾崩解】白骨尸皇双臂尽毁，护体玄煞破散，头颅防御大幅衰减！速速破敌！', true)
      if (!isHeadless) {
        game.cameraShake = 0.5
        game.flash = 0.4
        if (typeof sound !== 'undefined' && sound.crash) sound.crash()
      }
      burst(boss.x, boss.y, '#06d6a0', 30, 130)
      burst(boss.x, boss.y, '#ffffff', 20, 100)
    } else {
      boss.isBerserk = true
      boss.speed = boss.currentPhase.berserkSpeed || 105
      boss.cooldowns.barrage = 1.0
      boss.cooldowns.melee = 2.5
      addLog('【万骨崩坏 · 三首狂暴】白骨尸皇六臂尽灭！三首融合巨颅彻底暴走，喷吐巨型鬼火与狂暴冲撞！', true)
      if (!isHeadless) {
        game.cameraShake = 0.65
        game.flash = 0.5
        if (typeof sound !== 'undefined') {
          sound.dragon()
          sound.crash()
        }
      }
      burst(boss.x, boss.y, '#06d6a0', 40, 160)
      burst(boss.x, boss.y, '#f8f9fa', 30, 140)
    }
  } else {
    addLog(`【斩断骨臂】领主【${arm.name}】被彻底斩灭！冥灵骨臂剩余 ${livingArms.length} 只！`, true)
  }
  updateBossHudUI()
}

function fireCorpseKnuckleBarrage(arm, count = 5) {
  if (!arm) return
  const targetAngle = Math.atan2(game.player.y - arm.y, game.player.x - arm.x)
  const spread = count > 1 ? Math.min(Math.PI * 0.45, (count - 1) * 0.08) : 0
  for (let i = 0; i < count; i++) {
    const angle = count > 1 ? (targetAngle - spread / 2 + (spread / (count - 1)) * i) : targetAngle
    const spd = 215 + (Math.random() - 0.5) * 20
    game.bossProjectiles.push({
      x: arm.x,
      y: arm.y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: 8,
      damage: 10,
      color: '#06d6a0',
      glowColor: '#06d6a0',
      life: 2.5,
      maxLife: 2.5,
      spin: i * 0.5,
      type: 'corpse_knuckle'
    })
  }
  if (!isHeadless && typeof sound !== 'undefined' && sound.whirlwind) {
    sound.whirlwind()
  }
}

function fireCorpseSkullBreath(boss) {
  if (!boss) return
  const targetAngle = Math.atan2(game.player.y - boss.y, game.player.x - boss.x)
  const count = 3
  const spread = Math.PI * 0.28
  for (let i = 0; i < count; i++) {
    const angle = targetAngle - spread / 2 + (spread / (count - 1)) * i
    const spd = 190 + (Math.random() - 0.5) * 20
    game.bossProjectiles.push({
      x: boss.x + Math.cos(angle) * (boss.r * 0.5),
      y: boss.y + Math.sin(angle) * (boss.r * 0.5) + 10,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: 11,
      damage: 15,
      color: '#06d6a0',
      glowColor: '#2ec4b6',
      life: 3.2,
      maxLife: 3.2,
      homing: false,
      type: 'corpse_ghost_fire'
    })
  }
  burst(boss.x, boss.y + 12, '#06d6a0', 16, 75)
  if (!isHeadless && typeof sound !== 'undefined' && sound.dragon) {
    sound.dragon()
  }
}

function fireCorpseSkullSpikeBurst(boss) {
  if (!boss) return
  const count = 8
  const baseAngle = Math.atan2(game.player.y - boss.y, game.player.x - boss.x)
  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (i / count) * Math.PI * 2
    const spd = 205
    game.bossProjectiles.push({
      x: boss.x + Math.cos(angle) * (boss.r * 0.5),
      y: boss.y + Math.sin(angle) * (boss.r * 0.5) + 8,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: 8,
      damage: 11,
      color: '#06d6a0',
      glowColor: '#06d6a0',
      life: 2.4,
      maxLife: 2.4,
      spin: i * 0.5,
      type: 'corpse_knuckle'
    })
  }
  burst(boss.x, boss.y + 10, '#f8f9fa', 14, 85)
  if (!isHeadless && typeof sound !== 'undefined' && sound.whirlwind) {
    sound.whirlwind()
  }
}

function fireCorpseGhostFire(arm) {
  if (!arm) return
  const angle = Math.atan2(game.player.y - arm.y, game.player.x - arm.x)
  game.bossProjectiles.push({
    x: arm.x,
    y: arm.y,
    vx: Math.cos(angle) * 145,
    vy: Math.sin(angle) * 145,
    r: 12,
    damage: 16,
    color: '#06d6a0',
    glowColor: '#2ec4b6',
    life: 3.6,
    maxLife: 3.6,
    homing: true,
    turnSpeed: 1.6,
    type: 'corpse_ghost_fire'
  })
}

function fireTriSkullGiantGhostFire(boss) {
  if (!boss) return
  const baseAngle = Math.atan2(game.player.y - boss.y, game.player.x - boss.x)
  const count = 9
  const spread = Math.PI * 0.72 // 约 130 度的幽冥九幽扇形弹幕
  for (let i = 0; i < count; i++) {
    const angle = count > 1 ? (baseAngle - spread / 2 + (spread / (count - 1)) * i) : baseAngle
    // 三首融合魔颅：左、中、右三具骷髅头各喷吐3枚 (合计9枚)
    const headGroup = Math.floor(i / 3) // 0: 左颅, 1: 中颅, 2: 右颅
    const headAngleOffset = (headGroup - 1) * 0.32
    const spawnAngle = baseAngle + headAngleOffset
    const spawnDist = boss.r * 0.65

    game.bossProjectiles.push({
      x: boss.x + Math.cos(spawnAngle) * spawnDist,
      y: boss.y + Math.sin(spawnAngle) * spawnDist,
      vx: Math.cos(angle) * 190,
      vy: Math.sin(angle) * 190,
      r: 18,
      damage: 22,
      color: '#06d6a0',
      glowColor: '#2ec4b6',
      life: 3.6,
      maxLife: 3.6,
      homing: false,
      type: 'corpse_giant_ghost_fire'
    })
  }
  burst(boss.x, boss.y, '#06d6a0', 20, 110)
  if (!isHeadless) {
    game.cameraShake = 0.45
    if (typeof sound !== 'undefined' && sound.dragon) sound.dragon()
  }
}

function updateCorpseEmperor(boss, dt) {
  if (boss.sheetAnim) boss.sheetAnim.update(dt)

  // 更新所有骨臂状态与位置
  if (boss.arms && boss.arms.length > 0) {
    for (const arm of boss.arms) {
      if (arm.destroyed || arm.hp <= 0) continue

      if (arm.sheetAnim) arm.sheetAnim.update(dt)
      if (arm.hit > 0) arm.hit -= dt

      if (arm.state === 'idle') {
        const floatY = Math.sin(boss.animTimer * 2.8 + arm.index) * 6
        arm.x = boss.x + arm.baseOffsetX
        arm.y = boss.y + arm.baseOffsetY + floatY

        // 攻击计时
        arm.cooldown -= dt
        if (arm.cooldown <= 0) {
          if (arm.type === 'knuckle') {
            // 每只手臂发射5枚指节，双臂加一起合计10枚
            fireCorpseKnuckleBarrage(arm, 5)
            arm.cooldown = (boss.phaseIndex === 0 ? 4.6 : 6.0) + Math.random() * 1.5
          } else if (arm.type === 'slam') {
            // 防重叠拍击：若已有另一只手臂正在拍击蓄力或下砸，则错峰顺延
            const otherSlamming = boss.arms.some(a => a !== arm && (a.state === 'telegraph_slam' || a.state === 'slamming'))
            if (otherSlamming) {
              arm.cooldown = 2.5 + Math.random() * 1.0
            } else {
              // 开始飞出拍击蓄力预警 (预警时长延长至 1.05s，给予充裕走位反应时间)
              arm.state = 'telegraph_slam'
              arm.slamTarget = { x: game.player.x, y: game.player.y }
              arm.telegraphTimer = 1.05
              arm.maxTelegraph = 1.05
              game.bossAoEs.push({
                x: arm.slamTarget.x,
                y: arm.slamTarget.y,
                r: 72,
                telegraphTimer: 1.05,
                maxTelegraph: 1.05,
                activeTimer: 0.25,
                color: '#e63946',
                secondaryColor: '#06d6a0',
                damage: 24,
                isSlamTelegraph: true,
                armIndex: arm.index
              })
            }
          } else if (arm.type === 'ghost_fire') {
            fireCorpseGhostFire(arm)
            // 追踪鬼火攻击间隔从 4.2s 适度延长至 7.5s ~ 9.0s
            arm.cooldown = 7.5 + Math.random() * 1.5
          }
        }
      } else if (arm.state === 'telegraph_slam') {
        arm.telegraphTimer -= dt
        arm.y -= 15 * dt
        if (arm.telegraphTimer <= 0) {
          arm.state = 'slamming'
          arm.x = arm.slamTarget.x
          arm.y = arm.slamTarget.y
          arm.slamTimer = 0.4
          if (!isHeadless) {
            game.cameraShake = 0.4
            if (typeof sound !== 'undefined' && sound.slam) sound.slam()
          }
          burst(arm.x, arm.y, '#06d6a0', 18, 95)
          burst(arm.x, arm.y, '#f8f9fa', 12, 70)

          const dPlayer = Math.hypot(game.player.x - arm.x, game.player.y - arm.y)
          if (dPlayer < 72 + game.player.r && game.player.invuln <= 0) {
            const slamPct = 0.22
            const dmg = Math.max(isHeadless ? 8 : 22, Math.round(game.maxHp * slamPct))
            game.hp -= dmg
            game.player.invuln = 0.8
            burst(game.player.x, game.player.y, '#06d6a0', 10, 60)
            addLog(`被白骨巨臂狂暴拍击命中，受到 ${Math.round(dmg)} 点范围伤害！`, true)
            if (game.hp <= 0) {
              endRun()
              return
            }
          }
        }
      } else if (arm.state === 'slamming') {
        arm.slamTimer -= dt
        if (arm.slamTimer <= 0) {
          arm.state = 'returning'
        }
      } else if (arm.state === 'returning') {
        const targetX = boss.x + arm.baseOffsetX
        const targetY = boss.y + arm.baseOffsetY
        const dx = targetX - arm.x
        const dy = targetY - arm.y
        const dist = Math.hypot(dx, dy) || 1
        const returnSpeed = 440
        if (dist < returnSpeed * dt || dist < 12) {
          arm.x = targetX
          arm.y = targetY
          arm.state = 'idle'
          // 拍击冷却大幅放缓至 7.5s ~ 9.5s
          arm.cooldown = 7.5 + Math.random() * 2.0
        } else {
          arm.x += (dx / dist) * returnSpeed * dt
          arm.y += (dy / dist) * returnSpeed * dt
        }
      }

      // 同步 enemy 坐标与血量
      if (arm.enemyRef) {
        arm.enemyRef.x = arm.x
        arm.enemyRef.y = arm.y
        arm.enemyRef.hp = arm.hp
        arm.enemyRef.hit = arm.hit
      }
    }
  }

  // 检查是否处于二阶段狂暴绝境 (所有6只骨臂已毁灭)
  const livingArms = boss.arms ? boss.arms.filter(a => a.hp > 0 && !a.destroyed) : []
  const allArmsDead = livingArms.length === 0
  if (boss.phaseIndex === 1 && allArmsDead) {
    boss.isBerserk = true
  }

  // 一阶段骷髅神颅主动反击行为 (避免被断双臂后成为纯活靶子)
  if (boss.phaseIndex === 0) {
    boss.skullAttackCooldown = (boss.skullAttackCooldown != null ? boss.skullAttackCooldown : 4.5) - dt
    if (boss.skullWindup > 0) {
      boss.skullWindup -= dt
      if (boss.skullWindup <= 0) {
        if (allArmsDead) {
          // 双臂皆断后的狂怒反扑：交替喷吐三发幽冥鬼火或八荒骨刺激射
          boss.skullAttackCount = (boss.skullAttackCount || 0) + 1
          if (boss.skullAttackCount % 2 === 1) {
            fireCorpseSkullBreath(boss)
          } else {
            fireCorpseSkullSpikeBurst(boss)
          }
          boss.skullAttackCooldown = 3.2 + Math.random() * 0.8
        } else {
          // 双臂健在时：偶尔辅助吐出幽冥吐息
          fireCorpseSkullBreath(boss)
          boss.skullAttackCooldown = 5.8 + Math.random() * 1.2
        }
      }
    } else if (boss.skullAttackCooldown <= 0) {
      // 触发蓄力预警 (0.55s 蓄力摇前，带有神颅颤动与下颌魂火外溢)
      boss.skullWindup = 0.55
    }
  }

  // 领主骷髅头游弋移动
  const dx = game.player.x - boss.x
  const dy = game.player.y - boss.y
  const dist = Math.hypot(dx, dy) || 1
  boss.angle = Math.atan2(dy, dx)

  if (boss.state === 'idle') {
    const idealDist = boss.isBerserk ? 150 : 210
    let moveDirX = dx / dist
    let moveDirY = dy / dist
    if (dist < idealDist - 30) {
      moveDirX = -moveDirX
      moveDirY = -moveDirY
    } else if (dist < idealDist + 40) {
      const tangentX = -moveDirY
      const tangentY = moveDirX
      moveDirX = tangentX * 0.7
      moveDirY = tangentY * 0.7
    }

    const curSpeed = boss.isBerserk ? (boss.currentPhase.berserkSpeed || 105) : boss.speed
    boss.x += moveDirX * curSpeed * dt
    boss.y += moveDirY * curSpeed * dt
    clampBossPosition(boss)

    // 二阶段狂暴绝境下的两大专属技能：三头巨型鬼火弹幕与周期冲撞
    if (boss.isBerserk) {
      boss.cooldowns.barrage -= dt
      boss.cooldowns.melee -= dt

      if (boss.cooldowns.melee <= 0 && dist < 380) {
        startTelegraphRush(boss)
        boss.cooldowns.melee = 4.8
        return
      }
      if (boss.cooldowns.barrage <= 0) {
        fireTriSkullGiantGhostFire(boss)
        boss.cooldowns.barrage = 3.2
        return
      }
    }
  } else if (boss.state === 'telegraph_rush') {
    boss.telegraphTimer -= dt
    boss.x -= boss.rushDir.x * (boss.speed * 0.35) * dt
    boss.y -= boss.rushDir.y * (boss.speed * 0.35) * dt
    clampBossPosition(boss)

    if (boss.telegraphTimer <= 0) {
      boss.state = 'rushing'
      boss.rushTimeRemaining = boss.currentPhase.rushDuration || 0.45
      if (typeof sound !== 'undefined') sound.whirlwind()
    }
    return
  } else if (boss.state === 'rushing') {
    boss.rushTimeRemaining -= dt
    const rushV = boss.currentPhase.rushSpeed || 540
    boss.x += boss.rushDir.x * rushV * dt
    boss.y += boss.rushDir.y * rushV * dt
    clampBossPosition(boss)

    // 碰撞玩家
    const dPlayer = Math.hypot(game.player.x - boss.x, game.player.y - boss.y)
    if (dPlayer < boss.r + game.player.r && game.player.invuln <= 0) {
      const rushPct = 0.32
      const dmg = Math.max(isHeadless ? 12 : 32, Math.round(game.maxHp * rushPct))
      game.hp -= dmg
      game.player.invuln = 0.85
      game.cameraShake = 0.5
      if (typeof sound !== 'undefined') sound.crash()
      burst(game.player.x, game.player.y, '#06d6a0', 16, 90)
      addLog(`【魔颅冲撞】三首融合骨皇蛮横冲撞，受到 ${Math.round(dmg)} 点巨额接触伤害！`, true)
      if (game.hp <= 0) {
        endRun()
        return
      }
    }

    if (boss.rushTimeRemaining <= 0) {
      boss.state = 'brake'
      boss.brakeTimer = 0.25
    }
    return
  } else if (boss.state === 'brake') {
    boss.brakeTimer -= dt
    if (boss.brakeTimer <= 0) {
      boss.state = 'idle'
    }
    return
  }
}

function spawnBoss(config) {
  if (typeof config === 'string') {
    config = BOSS_CONFIGS[config] || BOSS_CONFIGS.corpse_emperor || BOSS_CONFIGS.red_dragon
  } else if (!config) {
    config = BOSS_CONFIGS.red_dragon
  }
  const phase0 = config.phases[0]

  const boss = {
    config,
    id: config.id,
    name: config.name,
    title: config.title,
    lore: config.lore,
    r: config.r,
    color: config.color,
    secondaryColor: config.secondaryColor,
    auraColor: config.auraColor,
    phaseIndex: 0,
    currentPhase: phase0,
    hp: isHeadless ? 120 : phase0.hp,
    maxHp: isHeadless ? 120 : phase0.hp,
    lagHp: isHeadless ? 120 : phase0.hp,
    speed: phase0.speed,
    damage: phase0.damage,
    x: ARENA_WIDTH / 2,
    y: 95, // 领主初始高踞于地图顶部中央，与玩家拉开充分对决纵深
    angle: Math.PI / 2,
    state: isHeadless ? 'idle' : 'entrance',
    entranceTimer: isHeadless ? 0 : 1.8,
    animTimer: 0,
    cooldowns: {
      melee: 4.5, // 初始冲锋充足冷却，杜绝开局突袭
      barrage: 2.2,
      aoe: 3.8
    },
    // 近战冲锋数据
    rushTarget: { x: 0, y: 0 },
    rushDir: { x: 0, y: 1 },
    rushDist: 0,
    rushSpeed: phase0.rushSpeed,
    telegraphTimer: 0,
    maxTelegraph: phase0.telegraphTime,
    rushTimeRemaining: 0,
    brakeTimer: 0,
    pendingMultiRush: 0,
    // 施法数据
    castTimer: 0,
    castType: null,
    // 阶段转换数据
    transitionTimer: 0,
    invuln: false,
    hit: 0,
    defeated: false,
    segments: [],
    sheetAnim: (config.id === 'red_dragon' && typeof SpriteSheetAnimation !== 'undefined' && bossRedDragonSheetImg) ? new SpriteSheetAnimation({
      img: bossRedDragonSheetImg,
      frameW: 180,
      frameH: 180,
      cols: 4,
      rows: 2,
      totalFrames: 8,
      fps: 9,
      loop: true
    }) : (config.id === 'corpse_emperor' && typeof SpriteSheetAnimation !== 'undefined' && bossCorpseSkullSheetImg) ? new SpriteSheetAnimation({
      img: bossCorpseSkullSheetImg,
      frameW: 180,
      frameH: 180,
      cols: 4,
      rows: 2,
      totalFrames: 8,
      fps: 9,
      loop: true
    }) : null,
    arms: [],
    isBerserk: false
  }

  // 确保领主战开场玩家居于安全下半区并享有2秒无敌保护，彻底杜绝出场重叠接触伤害
  if (game.player) {
    if (distance(game.player, { x: boss.x, y: boss.y }) < 260) {
      game.player.x = ARENA_WIDTH / 2
      game.player.y = ARENA_HEIGHT - 90
    }
    game.player.invuln = Math.max(game.player.invuln || 0, 2.0)
  }

  game.boss = boss
  game.isBossStage = true
  game.bossProjectiles = []
  game.bossAoEs = []

  // 在 game.enemies 中注册领主实体，使常规投射物与武器能自动索敌与命中
  const bossEnemy = {
    isBoss: true,
    bossRef: boss,
    x: boss.x,
    y: boss.y,
    r: boss.r,
    hp: boss.hp,
    maxHp: boss.maxHp,
    speed: boss.speed,
    damage: boss.damage,
    color: boss.color,
    hit: 0,
    kind: 'boss'
  }
  // 领主放在首位
  game.enemies.unshift(bossEnemy)

  // 专属初始化：幽冥白骨尸皇骨臂
  if (config.id === 'corpse_emperor') {
    initCorpseEmperorArms(boss, 0)
  }

  // 更新 HUD
  updateBossHudUI()
  if (typeof ui !== 'undefined') {
    if (ui.timer) ui.timer.classList.add('hidden')
    const bossHudBar = document.querySelector('#boss-hud-bar')
    if (bossHudBar) bossHudBar.classList.remove('hidden')
    if (ui.arena) ui.arena.textContent = `第 ${game.stage} 关 · 【秘境领主】${boss.name}`
  }

  // 震撼入场视听效果
  game.flash = 0.5
  game.cameraShake = 0.45
  if (typeof sound !== 'undefined') {
    sound.dragon()
  }
  addLog(`【天象剧变】虚空撕裂，秘境领主「${boss.name}」降临！气压九霄，唯死战可出！`, true)

  return boss
}

function startBossStage(specificBossId = null) {
  game.isBossStage = true
  // 领主对决开局纵深：玩家移至战场下半区安全阵位，开启2秒防接触无敌护体
  if (game.player) {
    game.player.x = ARENA_WIDTH / 2
    game.player.y = ARENA_HEIGHT - 90
    game.player.invuln = Math.max(game.player.invuln || 0, 2.0)
  }

  let config = null
  if (specificBossId && BOSS_CONFIGS[specificBossId]) {
    config = BOSS_CONFIGS[specificBossId]
  } else {
    config = getBossConfigForRealm(game.realm)
  }
  spawnBoss(config)
  if (!isHeadless) {
    game.cameraShake = 0.35
    addLog(`【秘境领主现世】天地变色！${game.boss.title}「${game.boss.name}」破空降临！`, true)
  }
}

function stopBossStage() {
  game.isBossStage = false
  game.pendingBossStage = false
  game.boss = null
  game.bossProjectiles = []
  game.bossAoEs = []
  if (game.enemies) {
    game.enemies = game.enemies.filter(e => !e.isBoss && !e.isBossPart)
  }
  if (typeof initStageDropTracker === 'function') {
    initStageDropTracker()
  }
  if (typeof ui !== 'undefined') {
    if (ui.timer) ui.timer.classList.remove('hidden')
    const bossHudBar = document.querySelector('#boss-hud-bar')
    if (bossHudBar) bossHudBar.classList.add('hidden')
    if (ui.arenaRealm && typeof realmLabel === 'function') {
      ui.arenaRealm.textContent = `第 ${game.stage} 关 · ${realmLabel()}`
    }
  }
}

/* ---------- 领主状态机与攻击驱动 ---------- */

function updateBoss(dt) {
  const boss = game.boss
  if (!boss || boss.defeated) return

  boss.animTimer += dt
  boss.hit = Math.max(0, boss.hit - dt)

  // 领主序列帧动画平滑更新与状态自适应调速
  if (boss.sheetAnim) {
    const isEnraged = boss.phaseIndex >= 1
    const isAction = boss.state === 'rushing' || boss.state === 'casting_barrage' || boss.state === 'casting_aoe'
    boss.sheetAnim.fps = isAction ? 14 : (isEnraged ? 11 : 8.5)
    boss.sheetAnim.update(dt)
  }

  // 同步关联的 bossEnemy
  const bossEnemy = game.enemies.find(e => e.isBoss)
  if (bossEnemy) {
    bossEnemy.x = boss.x
    bossEnemy.y = boss.y
    bossEnemy.r = boss.r
    bossEnemy.hp = boss.hp
    bossEnemy.maxHp = boss.maxHp
    bossEnemy.hit = boss.hit
  }

  // 平滑残影血条 (Lag Bar)
  if (boss.lagHp > boss.hp) {
    boss.lagHp = Math.max(boss.hp, boss.lagHp - (boss.maxHp * 0.4) * dt)
  } else {
    boss.lagHp = boss.hp
  }
  updateBossHudUI()

  // 阶段转换硬直
  if (boss.state === 'phase_transition') {
    boss.transitionTimer -= dt
    boss.invuln = true
    if (Math.random() < 0.4) {
      burst(boss.x + (Math.random() - 0.5) * 60, boss.y + (Math.random() - 0.5) * 60, boss.secondaryColor, 3, 40)
    }
    if (boss.transitionTimer <= 0) {
      boss.invuln = false
      boss.state = 'idle'
    }
    return
  }

  // 领主入场降临状态 (1.8秒登场威仪，不造成接触伤害，冲锋处于冷却)
  if (boss.state === 'entrance') {
    boss.entranceTimer -= dt
    boss.invuln = true
    if (Math.random() < 0.35) {
      burst(boss.x + (Math.random() - 0.5) * 50, boss.y + (Math.random() - 0.5) * 50, boss.color || '#e63946', 2, 35)
    }
    if (boss.entranceTimer <= 0) {
      boss.invuln = false
      boss.state = 'idle'
      if (!isHeadless) {
        addLog(`【决战开幕】秘境领主「${boss.name}」气机锁定道友，万千小心！`, true)
      }
    }
    return
  }

  // 幽冥白骨尸皇专属多部位与攻击逻辑
  if (boss.id === 'corpse_emperor') {
    updateCorpseEmperor(boss, dt)
    return
  }

  // 1. 待机寻敌巡弋 (idle)
  if (boss.state === 'idle') {
    boss.cooldowns.melee -= dt
    boss.cooldowns.barrage -= dt
    boss.cooldowns.aoe -= dt

    const dx = game.player.x - boss.x
    const dy = game.player.y - boss.y
    const dist = Math.hypot(dx, dy) || 1
    boss.angle = Math.atan2(dy, dx)

    // 平滑游弋向玩家保持中距施法拉扯
    const idealDist = 200
    let moveDirX = dx / dist
    let moveDirY = dy / dist
    if (dist < idealDist - 30) {
      moveDirX = -moveDirX
      moveDirY = -moveDirY
    } else if (dist < idealDist + 40) {
      // 绕圈盘旋
      const tangentX = -moveDirY
      const tangentY = moveDirX
      moveDirX = tangentX * 0.8
      moveDirY = tangentY * 0.8
    }

    boss.x += moveDirX * boss.speed * dt
    boss.y += moveDirY * boss.speed * dt
    clampBossPosition(boss)
    updateBossSegments(boss, dt)

    // 攻击决策优先顺序：近战突袭 -> 范围法阵 -> 弹幕齐射
    if (boss.cooldowns.melee <= 0 && dist < 380) {
      startTelegraphRush(boss)
      return
    }
    if (boss.cooldowns.aoe <= 0) {
      startCastAoE(boss)
      return
    }
    if (boss.cooldowns.barrage <= 0) {
      startCastBarrage(boss)
      return
    }
  }

  // 2. 蓄力突刺预警 (telegraph_rush)
  if (boss.state === 'telegraph_rush') {
    boss.telegraphTimer -= dt
    // 蓄力微退蓄力感
    boss.x -= boss.rushDir.x * (boss.speed * 0.4) * dt
    boss.y -= boss.rushDir.y * (boss.speed * 0.4) * dt
    clampBossPosition(boss)
    updateBossSegments(boss, dt)

    if (Math.random() < 0.3) {
      game.particles.push({
        x: boss.x + (Math.random() - 0.5) * 30,
        y: boss.y + (Math.random() - 0.5) * 30,
        vx: -boss.rushDir.x * 60,
        vy: -boss.rushDir.y * 60,
        life: 0.3,
        color: boss.color
      })
    }

    if (boss.telegraphTimer <= 0) {
      boss.state = 'rushing'
      boss.rushTimeRemaining = boss.currentPhase.rushDuration || 0.42
      if (typeof sound !== 'undefined') sound.whirlwind()
    }
    return
  }

  // 3. 高速近战冲锋 (rushing)
  if (boss.state === 'rushing') {
    boss.rushTimeRemaining -= dt
    const rushV = boss.currentPhase.rushSpeed || 460
    boss.x += boss.rushDir.x * rushV * dt
    boss.y += boss.rushDir.y * rushV * dt
    clampBossPosition(boss)
    updateBossSegments(boss, dt, true)

    // 冲锋残影与火焰
    for (let k = 0; k < 2; k++) {
      game.particles.push({
        x: boss.x + (Math.random() - 0.5) * 26,
        y: boss.y + (Math.random() - 0.5) * 26,
        vx: -boss.rushDir.x * 40 + (Math.random() - 0.5) * 30,
        vy: -boss.rushDir.y * 40 + (Math.random() - 0.5) * 30,
        life: 0.28,
        color: boss.secondaryColor
      })
    }

    // 碰撞玩家判定
    const dPlayer = Math.hypot(game.player.x - boss.x, game.player.y - boss.y)
    if (dPlayer < boss.r + game.player.r && game.player.invuln <= 0) {
      const rushPct = boss.phaseIndex >= 1 ? 0.35 : 0.28
      const dmg = Math.max(isHeadless ? 10 : Math.round(boss.damage || 25), Math.round(game.maxHp * rushPct))
      game.hp -= dmg
      game.player.invuln = 0.8
      game.cameraShake = 0.35
      if (typeof sound !== 'undefined') sound.crash()
      if (typeof pulseGamepad === 'function') pulseGamepad(0.5, 0.7, 250)
      burst(game.player.x, game.player.y, '#e63946', 12, 80)
      // 强击退玩家
      game.player.x = Math.max(24, Math.min(ARENA_WIDTH - 24, game.player.x + boss.rushDir.x * 55))
      game.player.y = Math.max(24, Math.min(ARENA_HEIGHT - 24, game.player.y + boss.rushDir.y * 55))
      addLog(`领主【${boss.name}】蛮横冲撞，受到 ${Math.round(dmg)} 点巨额伤害（约 ${Math.round(rushPct * 100)}% 生命）！`)
      if (game.hp <= 0) {
        endRun()
        return
      }
    }

    if (boss.rushTimeRemaining <= 0) {
      boss.state = 'brake'
      boss.brakeTimer = 0.22
    }
    return
  }

  // 4. 冲锋刹车减速与连环冲刺判定 (brake)
  if (boss.state === 'brake') {
    boss.brakeTimer -= dt
    updateBossSegments(boss, dt)
    if (boss.brakeTimer <= 0) {
      if (boss.pendingMultiRush > 0) {
        boss.pendingMultiRush--
        startTelegraphRush(boss, true)
      } else {
        boss.state = 'idle'
        boss.cooldowns.melee = boss.currentPhase.attackCooldowns.melee
      }
    }
    return
  }

  // 5. 弹幕吟唱 (casting_barrage)
  if (boss.state === 'casting_barrage') {
    boss.castTimer -= dt
    updateBossSegments(boss, dt)
    if (boss.castTimer <= 0) {
      executeBarrageAttack(boss)
      boss.state = 'idle'
      boss.cooldowns.barrage = boss.currentPhase.attackCooldowns.barrage
    }
    return
  }

  // 6. 范围法阵吟唱 (casting_aoe)
  if (boss.state === 'casting_aoe') {
    boss.castTimer -= dt
    updateBossSegments(boss, dt)
    if (boss.castTimer <= 0) {
      executeAoEAttack(boss)
      boss.state = 'idle'
      boss.cooldowns.aoe = boss.currentPhase.attackCooldowns.aoe
    }
    return
  }
}

function clampBossPosition(boss) {
  const m = boss.r + 10
  boss.x = Math.max(m, Math.min(ARENA_WIDTH - m, boss.x))
  boss.y = Math.max(m, Math.min(ARENA_HEIGHT - m, boss.y))
}

function updateBossSegments(boss, dt, fast = false) {
  let leaderX = boss.x
  let leaderY = boss.y
  const spacing = 15
  for (let i = 0; i < boss.segments.length; i++) {
    const seg = boss.segments[i]
    const dx = leaderX - seg.x
    const dy = leaderY - seg.y
    const d = Math.hypot(dx, dy) || 1
    const targetDist = spacing
    const factor = fast ? 0.35 : 0.2
    seg.x += (dx / d) * (d - targetDist) * factor
    seg.y += (dy / d) * (d - targetDist) * factor
    leaderX = seg.x
    leaderY = seg.y
  }
}

/* ---------- 技能发动函数 ---------- */

function startTelegraphRush(boss, isMulti = false) {
  boss.state = 'telegraph_rush'
  boss.telegraphTimer = isMulti ? 0.45 : boss.currentPhase.telegraphTime
  boss.maxTelegraph = boss.telegraphTimer

  // 锁定玩家当前坐标作为冲刺向量
  boss.rushTarget = { x: game.player.x, y: game.player.y }
  const dx = boss.rushTarget.x - boss.x
  const dy = boss.rushTarget.y - boss.y
  const dist = Math.hypot(dx, dy) || 1
  boss.rushDir = { x: dx / dist, y: dy / dist }
  boss.rushDist = Math.min(360, dist + 120)

  if (!isMulti && boss.currentPhase.multiRush) {
    boss.pendingMultiRush = boss.currentPhase.multiRush - 1
  }
}

function startCastBarrage(boss) {
  boss.state = 'casting_barrage'
  boss.castTimer = 0.35
  if (typeof sound !== 'undefined') sound.shoot()
}

function executeBarrageAttack(boss) {
  const count = boss.currentPhase.barrageCount || 8
  const baseAngle = Math.atan2(game.player.y - boss.y, game.player.x - boss.x)

  if (boss.id === 'red_dragon') {
    // 扇形散射赤炼龙火弹 (赤炼火弹)
    const spread = Math.PI * 0.4
    const startAngle = baseAngle - spread / 2
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (spread / Math.max(1, count - 1)) * i
      game.bossProjectiles.push({
        bossId: 'red_dragon',
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * 230,
        vy: Math.sin(angle) * 230,
        r: 8,
        damage: boss.damage * 0.65,
        color: '#ff4d4f',
        glowColor: '#ffbe0b',
        life: 2.2,
        maxLife: 2.2,
        type: 'fireball',
        spin: (i * 0.7)
      })
    }
  } else if (boss.id === 'corpse_emperor') {
    // 幽冥骨刺：双环旋转齐射
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + boss.animTimer
      game.bossProjectiles.push({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * 210,
        vy: Math.sin(angle) * 210,
        r: 6,
        damage: boss.damage * 0.6,
        color: '#06d6a0',
        glowColor: '#f8f9fa',
        life: 2.5,
        maxLife: 2.5,
        type: 'bonespike'
      })
    }
  } else if (boss.id === 'asura_demon') {
    // 天魔噬魂弹：微追踪幽冥骷髅
    for (let i = 0; i < count; i++) {
      const offset = (i - count / 2) * 0.22
      const angle = baseAngle + offset
      game.bossProjectiles.push({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * 200,
        vy: Math.sin(angle) * 200,
        r: 8,
        damage: boss.damage * 0.7,
        color: '#7209b7',
        glowColor: '#f72585',
        life: 2.6,
        maxLife: 2.6,
        homing: true,
        type: 'voidorb'
      })
    }
  } else if (boss.id === 'celestial_peng') {
    // 巡天金翅大鹏：极速太乙金羽剑雨
    const spread = Math.PI * 0.5
    for (let i = 0; i < count; i++) {
      const angle = baseAngle - spread / 2 + (spread / count) * i + (Math.random() - 0.5) * 0.08
      game.bossProjectiles.push({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * 310,
        vy: Math.sin(angle) * 310,
        r: 6,
        damage: boss.damage * 0.55,
        color: '#ffb703',
        glowColor: '#ffffff',
        life: 2.0,
        maxLife: 2.0,
        type: 'feather'
      })
    }
  } else if (boss.id === 'primordial_god') {
    // 混沌太虚道祖：旋转阴阳混沌星辰弹与太虚诛仙剑雨
    for (let i = 0; i < count; i++) {
      const spinAngle = (i / count) * Math.PI * 2 + (boss.animTimer * 2.5)
      const isBlade = boss.phaseIndex >= 2 || (i % 2 === 0)
      game.bossProjectiles.push({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(spinAngle) * (isBlade ? 280 : 220),
        vy: Math.sin(spinAngle) * (isBlade ? 280 : 220),
        r: isBlade ? 7 : 9,
        damage: boss.damage * 0.65,
        color: i % 2 === 0 ? '#4cc9f0' : '#f72585',
        glowColor: '#ffd700',
        life: 2.8,
        maxLife: 2.8,
        type: isBlade ? 'cosmic_blade' : 'yin_yang_orb'
      })
    }
  }
}

function startCastAoE(boss) {
  boss.state = 'casting_aoe'
  boss.castTimer = 0.4
}

function executeAoEAttack(boss) {
  const count = boss.currentPhase.aoeCount || 3
  const aoeRadius = boss.currentPhase.aoeRadius || 52

  // 必定在玩家脚下生成 1 个
  game.bossAoEs.push({
    bossId: boss.id,
    x: game.player.x,
    y: game.player.y,
    r: aoeRadius,
    telegraphTimer: 1.1,
    maxTelegraph: 1.1,
    activeTimer: 0.55,
    maxActive: 0.55,
    damage: boss.damage * 1.1,
    color: boss.color,
    secondaryColor: boss.secondaryColor,
    exploded: false
  })

  // 其余散落在玩家周边或战场随机区域
  for (let i = 1; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = 70 + Math.random() * 140
    const tx = Math.max(60, Math.min(ARENA_WIDTH - 60, game.player.x + Math.cos(angle) * dist))
    const ty = Math.max(60, Math.min(ARENA_HEIGHT - 60, game.player.y + Math.sin(angle) * dist))
    game.bossAoEs.push({
      bossId: boss.id,
      x: tx,
      y: ty,
      r: aoeRadius,
      telegraphTimer: 1.1 + i * 0.15,
      maxTelegraph: 1.1 + i * 0.15,
      activeTimer: 0.55,
      maxActive: 0.55,
      damage: boss.damage * 1.1,
      color: boss.color,
      secondaryColor: boss.secondaryColor,
      exploded: false
    })
  }

  // 结丹领主二阶段额外召唤 3 只白骨怨灵
  if (boss.currentPhase.summonMinions) {
    for (let k = 0; k < 3; k++) {
      const mang = (k / 3) * Math.PI * 2
      game.enemies.push({
        x: boss.x + Math.cos(mang) * 55,
        y: boss.y + Math.sin(mang) * 55,
        r: 12,
        hp: 35,
        maxHp: 35,
        speed: 65,
        damage: 10,
        color: '#83c5be',
        kind: 'wisp',
        hit: 0
      })
    }
  }
}

function fireMagmaBarrage(enemy) {
  if (!game.player) return
  if (!game.bossProjectiles) game.bossProjectiles = []

  const baseAngle = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x)
  const count = 3
  const spread = 0.28
  const spd = 185

  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (i - (count - 1) / 2) * spread
    game.bossProjectiles.push({
      x: enemy.x + Math.cos(angle) * (enemy.r + 6),
      y: enemy.y + Math.sin(angle) * (enemy.r + 6),
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: 6.5,
      type: 'fireball',
      color: '#ffbe0b',
      glowColor: '#ff5400',
      spin: Math.random() * Math.PI * 2,
      life: 3.2,
      damage: Math.round(enemy.damage ? enemy.damage * 0.75 : 12),
      source: 'elite_brute'
    })
  }

  burst(enemy.x, enemy.y, '#ffbe0b', 14, 65)
  burst(enemy.x, enemy.y, '#d62828', 10, 50)
  if (!isHeadless) {
    if (typeof sound !== 'undefined' && sound.shoot) sound.shoot()
    game.cameraShake = Math.max(game.cameraShake || 0, 0.16)
  }
}

function fireFrostCrystalBarrage(enemy) {
  if (!game.player) return
  if (!game.bossProjectiles) game.bossProjectiles = []

  const baseAngle = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x)
  const count = 5 // 5 发高速冰棱晶，呈扇面破空穿刺
  const spread = 0.22 // 扇形夹角更密集尖锐
  const spd = 230 // 230 px/s 疾速破空

  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (i - (count - 1) / 2) * spread
    game.bossProjectiles.push({
      x: enemy.x + Math.cos(angle) * (enemy.r + 8),
      y: enemy.y + Math.sin(angle) * (enemy.r + 8),
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: 6.0,
      type: 'frost_crystal',
      color: '#38bdf8',
      glowColor: '#0ea5e9',
      spin: angle,
      life: 2.8,
      damage: Math.round(enemy.damage ? enemy.damage * 0.65 : 10),
      source: 'elite_frost_brute'
    })
  }

  burst(enemy.x, enemy.y, '#38bdf8', 16, 75)
  burst(enemy.x, enemy.y, '#ffffff', 12, 60)
  if (!isHeadless) {
    if (typeof sound !== 'undefined' && sound.shoot) sound.shoot()
    game.cameraShake = Math.max(game.cameraShake || 0, 0.14)
  }
}

/* ---------- 领主与精英怪投射物驱动 ---------- */

function updateBossProjectiles(dt) {
  if (!game.bossProjectiles || !game.bossProjectiles.length) return

  for (const proj of [...game.bossProjectiles]) {
    // 追踪弹修正航向
    if (proj.homing && game.player) {
      const targetAngle = Math.atan2(game.player.y - proj.y, game.player.x - proj.x)
      const curAngle = Math.atan2(proj.vy, proj.vx)
      let diff = targetAngle - curAngle
      while (diff < -Math.PI) diff += Math.PI * 2
      while (diff > Math.PI) diff -= Math.PI * 2
      const turnSpeed = 2.4 * dt
      const newAngle = curAngle + Math.max(-turnSpeed, Math.min(turnSpeed, diff))
      const spd = Math.hypot(proj.vx, proj.vy)
      proj.vx = Math.cos(newAngle) * spd
      proj.vy = Math.sin(newAngle) * spd
    }

    proj.x += proj.vx * dt
    proj.y += proj.vy * dt
    proj.life -= dt

    // 赤炼火弹飞行动态微火星拖尾 (轻量零GC，数量受控)
    if (proj.type === 'fireball' && !isHeadless && Math.random() < 0.35 && game.particles && game.particles.length < 90) {
      game.particles.push({
        x: proj.x + (Math.random() - 0.5) * 6,
        y: proj.y + (Math.random() - 0.5) * 6,
        vx: -proj.vx * 0.15 + (Math.random() - 0.5) * 20,
        vy: -proj.vy * 0.15 + (Math.random() - 0.5) * 20,
        life: 0.22,
        color: Math.random() < 0.5 ? '#ffbe0b' : '#ff4d4f'
      })
    }

    // 冰棱晶飞行动态冰屑霜星拖尾
    if (proj.type === 'frost_crystal' && !isHeadless && Math.random() < 0.4 && game.particles && game.particles.length < 90) {
      game.particles.push({
        x: proj.x + (Math.random() - 0.5) * 5,
        y: proj.y + (Math.random() - 0.5) * 5,
        vx: -proj.vx * 0.12 + (Math.random() - 0.5) * 20,
        vy: -proj.vy * 0.12 + (Math.random() - 0.5) * 20,
        life: 0.2,
        color: Math.random() < 0.6 ? '#38bdf8' : '#e0f2fe'
      })
    }

    // 幽冥指节与鬼火粒子拖尾
    if (proj.type === 'corpse_knuckle' && !isHeadless && Math.random() < 0.35 && game.particles && game.particles.length < 90) {
      game.particles.push({
        x: proj.x + (Math.random() - 0.5) * 5,
        y: proj.y + (Math.random() - 0.5) * 5,
        vx: -proj.vx * 0.1 + (Math.random() - 0.5) * 15,
        vy: -proj.vy * 0.1 + (Math.random() - 0.5) * 15,
        life: 0.2,
        color: Math.random() < 0.5 ? '#06d6a0' : '#f8f9fa'
      })
    }
    if ((proj.type === 'corpse_ghost_fire' || proj.type === 'corpse_giant_ghost_fire') && !isHeadless && Math.random() < 0.45 && game.particles && game.particles.length < 90) {
      game.particles.push({
        x: proj.x + (Math.random() - 0.5) * 8,
        y: proj.y + (Math.random() - 0.5) * 8,
        vx: -proj.vx * 0.1 + (Math.random() - 0.5) * 20,
        vy: -proj.vy * 0.1 + (Math.random() - 0.5) * 20,
        life: 0.25,
        color: Math.random() < 0.5 ? '#06d6a0' : '#2ec4b6'
      })
    }

    // 幽冥鬼火贴身引爆与地脉火沼生成 (接近玩家时爆炸造成持续范围伤害)
    if (proj.type === 'corpse_ghost_fire' || proj.type === 'corpse_giant_ghost_fire') {
      const isGiant = proj.type === 'corpse_giant_ghost_fire'
      const triggerDist = isGiant ? 48 : 36
      const dPlayer = Math.hypot(game.player.x - proj.x, game.player.y - proj.y)
      if (dPlayer < triggerDist || proj.life <= dt) {
        proj.life = 0
        burst(proj.x, proj.y, '#06d6a0', isGiant ? 22 : 14, isGiant ? 90 : 60)
        burst(proj.x, proj.y, '#f8f9fa', isGiant ? 16 : 8, isGiant ? 70 : 45)
        if (!isHeadless && typeof sound !== 'undefined' && sound.slam) sound.slam()

        // 放置持续造成范围伤害的幽冥地火毒沼
        game.bossAoEs.push({
          x: proj.x,
          y: proj.y,
          r: isGiant ? 68 : 50,
          telegraphTimer: 0,
          activeTimer: isGiant ? 3.8 : 3.2,
          maxActive: isGiant ? 3.8 : 3.2,
          tickTimer: 0,
          isHazardPool: true,
          hazardType: 'corpse_ghost_fire',
          damage: isGiant ? 12 : 8,
          color: '#06d6a0',
          secondaryColor: '#2ec4b6',
          exploded: true
        })

        // 爆炸直接伤害判定
        if (dPlayer < (isGiant ? 55 : 42) + game.player.r && game.player.invuln <= 0) {
          const dmgPct = isGiant ? 0.18 : 0.12
          const dmg = Math.max(isHeadless ? 6 : (isGiant ? 18 : 12), Math.round(game.maxHp * dmgPct))
          game.hp -= dmg
          game.player.invuln = 0.65
          game.cameraShake = isGiant ? 0.35 : 0.2
          burst(game.player.x, game.player.y, '#06d6a0', 10, 50)
          addLog(`【鬼火轰爆】被幽冥鬼火贴身引爆，受到 ${Math.round(dmg)} 点范围伤害！`, true)
        }
        continue
      }
    }

    // 碰撞玩家
    const dPlayer = Math.hypot(game.player.x - proj.x, game.player.y - proj.y)
    if (dPlayer < proj.r + game.player.r && game.player.invuln <= 0) {
      if (game.testGodMode) {
        proj.life = 0
        continue
      }
      const boss = game.boss
      const isEnraged = boss && boss.phaseIndex >= 1
      const isEliteBrute = proj.source === 'elite_brute'
      const isEliteFrost = proj.source === 'elite_frost_brute' || proj.type === 'frost_crystal'
      const isElite = isEliteBrute || isEliteFrost
      // 火系直接伤害调整为 6%（后续带 6% 持续灼烧），冰系直接伤害为 7%（后续带 45% 减速或冰冻）
      const projPct = isElite ? (isEliteFrost ? 0.07 : 0.06) : (0.08 + (isEnraged ? 0.03 : 0))
      const dmg = Math.max(isHeadless ? 4 : Math.round(proj.damage || (isElite ? 10 : 8)), Math.round(game.maxHp * projPct))
      game.hp -= dmg
      game.player.invuln = 0.65
      proj.life = 0
      burst(proj.x, proj.y, proj.glowColor || '#38bdf8', 6, 40)
      if (typeof sound !== 'undefined') sound.hit()
      if (typeof pulseGamepad === 'function') pulseGamepad(0.35, 0.5, 150)
      if (isEliteFrost) {
        if ((game.playerChillTimer || 0) > 0) {
          // 减速期间再次受创 -> 触发 0.9 秒绝对冰冻！
          game.playerFreezeTimer = 0.9
          game.playerChillTimer = 2.2
          addLog(`【绝对冰结】极寒冰棱侵骨，行动被坚冰冻结！受到 ${Math.round(dmg)} 点伤害！`, true)
          burst(game.player.x, game.player.y, '#bae6fd', 16, 80)
        } else {
          // 初次中弹 -> 移速迟滞 45%，持续 2.2 秒
          game.playerChillTimer = 2.2
          game.playerChillSlow = 0.45
          addLog(`【玄霜减速】极寒之气透体，移速迟滞 45%！受到 ${Math.round(dmg)} 点伤害！`, true)
          burst(game.player.x, game.player.y, '#38bdf8', 12, 50)
        }
      } else if (isEliteBrute) {
        // 火系：直接伤害 + 施加持续 2.4 秒地火灼烧 (共 5 跳，每跳 1.2% 最大生命)
        game.playerBurnTimer = 2.4
        game.playerBurnTick = 0.48
        game.playerBurnDmg = Math.max(1, Math.round(game.maxHp * 0.012))
        addLog(`【地火灼烧】被赤炼熔岩弹命中！受到 ${Math.round(dmg)} 点伤害并陷入持续灼烧！`, true)
      } else {
        addLog(`被领主弹幕命中，受到 ${Math.round(dmg)} 点伤害（约 ${Math.round(projPct * 100)}% 生命）！`)
      }
      if (game.hp <= 0) {
        if (game.isTestLevel || game.testGodMode) {
          game.hp = game.maxHp
          continue
        }
        endRun()
        return
      }
    }
  }
  game.bossProjectiles = game.bossProjectiles.filter(p => p.life > 0)
}

function updateBossAoEs(dt) {
  if (!game.bossAoEs || !game.bossAoEs.length) return

  for (const aoe of [...game.bossAoEs]) {
    if (aoe.isHazardPool) {
      aoe.activeTimer -= dt
      aoe.tickTimer = (aoe.tickTimer || 0) + dt
      if (aoe.tickTimer >= 0.35) {
        aoe.tickTimer = 0
        const dPlayer = Math.hypot(game.player.x - aoe.x, game.player.y - aoe.y)
        if (dPlayer < aoe.r + game.player.r && game.player.invuln <= 0) {
          const dmg = Math.max(2, Math.round(game.maxHp * 0.025))
          game.hp -= dmg
          game.player.invuln = 0.25
          burst(game.player.x, game.player.y, '#06d6a0', 5, 35)
          addLog(`【鬼火灼魂】陷入幽冥地火毒沼，受到 ${dmg} 点持续煞气伤害！`)
          if (game.hp <= 0) {
            endRun()
            return
          }
        }
      }
      continue
    }

    if (aoe.telegraphTimer > 0) {
      aoe.telegraphTimer -= dt
    } else if (aoe.activeTimer > 0) {
      if (!aoe.exploded) {
        aoe.exploded = true
        if (typeof sound !== 'undefined') sound.slam()
        burst(aoe.x, aoe.y, aoe.secondaryColor, 18, 90)

        // 判定法阵爆发伤害
        const dPlayer = Math.hypot(game.player.x - aoe.x, game.player.y - aoe.y)
        if (dPlayer < aoe.r + game.player.r && game.player.invuln <= 0) {
          const boss = game.boss
          const isEnraged = boss && boss.phaseIndex >= 1
          const aoePct = aoe.isSlamTelegraph ? 0.24 : (0.18 + (isEnraged ? 0.06 : 0))
          const dmg = Math.max(isHeadless ? 6 : Math.round(aoe.damage || 16), Math.round(game.maxHp * aoePct))
          game.hp -= dmg
          game.player.invuln = 0.75
          game.cameraShake = 0.28
          burst(game.player.x, game.player.y, aoe.color, 12, 60)
          if (typeof pulseGamepad === 'function') pulseGamepad(0.4, 0.6, 200)
          addLog(aoe.isSlamTelegraph ? `被白骨巨臂狂暴拍击命中，受到 ${Math.round(dmg)} 点范围伤害！` : `触碰领主地脉煞气法阵，承受 ${Math.round(dmg)} 点范围伤害（约 ${Math.round(aoePct * 100)}% 生命）！`)
          if (game.hp <= 0) {
            endRun()
            return
          }
        }
      }
      aoe.activeTimer -= dt
    }
  }
  game.bossAoEs = game.bossAoEs.filter(a => a.activeTimer > 0 || a.telegraphTimer > 0)
}

/* ---------- 领主受击、多阶段转阶段与击杀掉落 ---------- */

function damageBoss(amount) {
  const boss = game.boss
  if (!boss || boss.defeated || boss.invuln) return

  let effectiveAmount = amount
  let hasLivingArms = false
  if (boss.id === 'corpse_emperor' && boss.arms && boss.arms.length > 0) {
    const livingArms = boss.arms.filter(a => a.hp > 0 && !a.destroyed)
    if (livingArms.length > 0) {
      hasLivingArms = true
      // 未击杀手臂时，骷髅头有巨量防御 (90% 减伤)
      effectiveAmount = Math.max(1, Math.round(amount * (boss.currentPhase.defenseRatio || 0.10)))
    } else {
      // 击杀全部手臂后，骷髅头防御大幅下降 (125% 易伤)
      effectiveAmount = Math.max(1, Math.round(amount * (boss.currentPhase.vulnerabilityRatio || 1.25)))
    }
  }

  const dmg = Math.max(1, Math.round(effectiveAmount))
  boss.hp -= dmg
  boss.hit = 0.16

  if (!isHeadless && typeof spawnHitImpact === 'function') {
    spawnHitImpact(boss.x, boss.y, hasLivingArms ? '#06d6a0' : '#ffbe0b', 8)
  }

  if (!isHeadless && game.damageNumbers) {
    game.damageNumbers.push({
      x: boss.x + (Math.random() - 0.5) * 24,
      y: boss.y - boss.r - 12,
      text: hasLivingArms ? `${dmg} (格挡90%)` : dmg,
      color: hasLivingArms ? '#2ec4b6' : '#ff9f1c',
      life: 0.7,
      maxLife: 0.7
    })
  }

  // 血量降为0，转阶段或伏诛
  if (boss.hp <= 0) {
    if (boss.phaseIndex < boss.config.phases.length - 1) {
      triggerBossPhaseTransition()
    } else {
      defeatBoss()
    }
  }
}

function triggerBossPhaseTransition() {
  const boss = game.boss
  if (!boss) return

  boss.phaseIndex++
  const nextPhase = boss.config.phases[boss.phaseIndex]
  boss.currentPhase = nextPhase
  const nextHp = isHeadless ? 150 : nextPhase.hp
  boss.hp = nextHp
  boss.maxHp = nextHp
  boss.lagHp = nextHp
  boss.speed = nextPhase.speed
  boss.damage = nextPhase.damage
  boss.state = 'phase_transition'
  boss.transitionTimer = 1.4
  boss.invuln = true

  // 幽冥白骨尸皇转入第二阶段：三首融合巨骷髅 + 6只骨臂
  if (boss.id === 'corpse_emperor') {
    boss.r = 52
    boss.isBerserk = false
    if (typeof SpriteSheetAnimation !== 'undefined' && bossCorpseTriSkullSheetImg) {
      boss.sheetAnim = new SpriteSheetAnimation({
        img: bossCorpseTriSkullSheetImg,
        frameW: 180,
        frameH: 180,
        cols: 4,
        rows: 2,
        totalFrames: 8,
        fps: 9,
        loop: true
      })
    }
    initCorpseEmperorArms(boss, 1)
  }

  // 狂暴特效与道音
  game.flash = 0.65
  game.cameraShake = 0.55
  if (typeof sound !== 'undefined') {
    sound.dragon()
    sound.crash()
  }
  burst(boss.x, boss.y, boss.secondaryColor, 35, 140)
  addLog(`【领主狂暴】「${boss.name}」气血逆流，突破进入第 ${boss.phaseIndex + 1} 阶段「${nextPhase.name}」！煞威暴增！`, true)

  updateBossHudUI()
}

function defeatBoss() {
  const boss = game.boss
  if (!boss || boss.defeated) return

  if (boss.flameBrand && (game.blazingFireLevel || 0) > 0 && !boss._blazingDetonated) {
    triggerBlazingDetonation(boss, boss.flameBrandDmg)
  }

  boss.defeated = true
  boss.hp = 0
  boss.lagHp = 0
  updateBossHudUI()

  game.flash = 0.85
  game.cameraShake = 0.7
  if (typeof sound !== 'undefined') {
    sound.defeat()
    sound.levelUp()
  }
  burst(boss.x, boss.y, '#ffd700', 45, 180)
  burst(boss.x, boss.y, boss.color, 35, 150)
  addLog(`【除魔证道】天地同庆！秘境领主「${boss.name}」已被斩灭！天道降下丰厚秘宝祥瑞！`, true)

  // 从普通怪列表中移除领主与领主分体部位
  game.enemies = game.enemies.filter(e => !e.isBoss && !e.isBossPart)
  game.bossProjectiles = []
  game.bossAoEs = []
  game.bossesDefeated = (game.bossesDefeated || 0) + 1
  if (boss.id === 'red_dragon') {
    game.defeatedRedDragon = true
  }

  // 1. 爆出海量灵气宝珠（32枚环形散落）
  // 根据领主对应大境界分级配置掉落灵气总量
  const bossQiTable = {
    red_dragon: 384,        // 筑基领主 (Stage 3, 32枚 x 12点)
    corpse_emperor: 5120,    // 结丹领主 (Stage 6, 32枚 x 160点)
    asura_demon: 38400,     // 元婴领主 (Stage 10, 32枚 x 1200点)
    celestial_peng: 256000, // 化神领主 (Stage 15, 32枚 x 8000点)
    primordial_god: 888888  // 终极飞升领主
  }
  const totalBossQi = bossQiTable[boss.id] || 1120
  const orbCount = 32
  const singleOrbQi = Math.max(7, Math.round(totalBossQi / orbCount))

  for (let i = 0; i < orbCount; i++) {
    const angle = (i / orbCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
    const dist = 35 + Math.random() * 95
    const ox = Math.max(30, Math.min(ARENA_WIDTH - 30, boss.x + Math.cos(angle) * dist))
    const oy = Math.max(30, Math.min(ARENA_HEIGHT - 30, boss.y + Math.sin(angle) * dist))
    spawnDrop(ox, oy, 'xp', null, isHeadless ? 7 : singleOrbQi)
  }

  // 2. 必定爆出极品秘境珍宝 (无头模式1件保障掉率统计，浏览器3件豪爽爆落)
  const dropItemCount = isHeadless ? 1 : 3
  for (let k = 0; k < dropItemCount; k++) {
    const angle = (k / 3) * Math.PI * 2 + Math.PI / 6
    const dist = 55 + Math.random() * 40
    const ix = Math.max(40, Math.min(ARENA_WIDTH - 40, boss.x + Math.cos(angle) * dist))
    const iy = Math.max(40, Math.min(ARENA_HEIGHT - 40, boss.y + Math.sin(angle) * dist))
    const item = isHeadless
      ? { id: 'spirit_herb', name: '凝神草', icon: '🌿', type: '灵药', desc: '安神定魄。', qi: 20, apply() {} }
      : (pickItem() || {
          id: 'cinnabar',
          name: '纯阳赤血参',
          icon: '🌿',
          type: '灵药',
          desc: '服用后气血奔涌，生命上限增加。',
          qi: 60,
          apply() { game.bonusHp += 30; recomputeMaxHp(); }
        })
    spawnDrop(ix, iy, 'item', item)
  }

  // 终极领主斩灭判定：若击败混沌太虚道祖，触发化神飞升大圆满
  if (boss.id === 'primordial_god') {
    game.isAscended = true
    if (!isHeadless) {
      setTimeout(() => {
        showAscensionModal()
      }, 700)
      return
    }
  }

  // 领主战结束，进入结算流程 (浏览器端立即进入神识吸附与清点；无头模式等待本关倒计时结束进入结算)
  if (!isHeadless) {
    startStageClearSequence()
  }
}

function showAscensionModal() {
  game.paused = true
  if (typeof sound !== 'undefined' && sound.levelUp) sound.levelUp()

  const modal = document.querySelector('#modal-ascension')
  if (!modal) return

  const stageEl = document.querySelector('#asc-stage')
  const killsEl = document.querySelector('#asc-kills')
  const timeEl = document.querySelector('#asc-time')
  const weaponEl = document.querySelector('#asc-weapon')
  const lootCountEl = document.querySelector('#asc-loot-count')

  if (stageEl) stageEl.textContent = `第 ${game.stage} 关 · 终极飞升劫`
  if (killsEl) killsEl.textContent = `${game.kills} 尊`
  if (timeEl) timeEl.textContent = typeof formatTime === 'function' ? formatTime(game.elapsed || 0) : `${Math.floor(game.elapsed || 0)}秒`
  if (weaponEl) {
    const pw = (game.weapons && game.weapons[0]) || {}
    weaponEl.textContent = `${pw.name || '本命神兵'} (×${pw.count || 1})`
  }
  if (lootCountEl) {
    const totalTreasures = (game.treasures ? game.treasures.length : 0) + (game.passives ? game.passives.length : 0) + (game.formations ? game.formations.length : 0)
    lootCountEl.textContent = `${totalTreasures} 件`
  }

  const btnSettle = document.querySelector('#btn-ascend-settle')
  if (btnSettle) {
    btnSettle.onclick = () => {
      if (typeof sound !== 'undefined' && sound.click) sound.click()
      modal.classList.add('hidden')
      stopBossStage()
      showScreen('title')
    }
  }

  const btnEndless = document.querySelector('#btn-ascend-endless')
  if (btnEndless) {
    btnEndless.onclick = () => {
      if (typeof sound !== 'undefined' && sound.click) sound.click()
      modal.classList.add('hidden')
      startEndlessMode()
    }
  }

  modal.classList.remove('hidden')
}

function startEndlessMode() {
  game.isEndlessMode = true
  game.endlessElapsed = 0
  game.endlessKills = 0
  game.stageTime = Infinity
  game.paused = false
  stopBossStage()
  game.isBossStage = false
  game.hp = game.maxHp
  const modal = document.querySelector('#modal-ascension')
  if (modal) modal.classList.add('hidden')
  if (typeof ui !== 'undefined' && ui.timer) ui.timer.classList.remove('hidden')
  const bossHud = document.querySelector('#boss-hud-bar')
  if (bossHud) bossHud.classList.add('hidden')
  addLog('【破界飞升】时间桎梏已解！太虚万界妖魔永无止境地蜂拥而至！', true)
  burst(game.player.x, game.player.y, '#ffd700', 50, 200)
  updateUI()
}

/* ---------- 顶置 Boss 血条 HUD 驱动 ---------- */

function updateBossHudUI() {
  if (isHeadless) return
  const boss = game.boss
  const hudBar = document.querySelector('#boss-hud-bar')
  if (!hudBar) return

  if (!boss || !game.isBossStage) {
    hudBar.classList.add('hidden')
    return
  }

  hudBar.classList.remove('hidden')
  const titleEl = document.querySelector('#boss-hud-title')
  const phaseEl = document.querySelector('#boss-hud-phase')
  const fillEl = document.querySelector('#boss-hp-fill')
  const lagEl = document.querySelector('#boss-hp-lag')
  const valEl = document.querySelector('#boss-hp-val')

  if (titleEl) titleEl.textContent = boss.name
  if (phaseEl) {
    const totalPhases = boss.config.phases.length
    if (boss.id === 'corpse_emperor' && boss.arms) {
      const living = boss.arms.filter(a => a.hp > 0 && !a.destroyed).length
      const total = boss.arms.length
      const statusText = living > 0 ? `骨臂 ${living}/${total}` : '【骨盾已破 · 极度易伤】'
      const berserkText = (boss.phaseIndex === 1 && boss.isBerserk) ? '【万骨狂暴】' : ''
      phaseEl.textContent = `阶段 ${boss.phaseIndex + 1}/${totalPhases} · ${boss.currentPhase.name} (${statusText}${berserkText})`
    } else {
      phaseEl.textContent = `阶段 ${boss.phaseIndex + 1}/${totalPhases} · ${boss.currentPhase.name}`
    }
  }

  const curHp = Math.max(0, Math.ceil(boss.hp))
  const maxHp = boss.maxHp
  const hpPct = Math.max(0, Math.min(100, (curHp / maxHp) * 100))
  const lagPct = Math.max(0, Math.min(100, (boss.lagHp / maxHp) * 100))

  if (fillEl) fillEl.style.width = `${hpPct}%`
  if (lagEl) lagEl.style.width = `${lagPct}%`
  if (valEl) valEl.textContent = `${curHp} / ${maxHp} (${Math.round(hpPct)}%)`
}

/* ---------- 领主、法阵与弹幕 Canvas 绘制系统 ---------- */

function drawBossAoEs(ctx) {
  if (!game.bossAoEs || !game.bossAoEs.length) return

  for (const aoe of game.bossAoEs) {
    ctx.save()
    if (aoe.isHazardPool) {
      // 绘制持续幽冥毒沼 (Lingering Ghost Fire Poison Pool with Dedicated Sprite)
      ctx.translate(aoe.x, aoe.y)
      const maxLife = aoe.maxActive || 3.2
      const timeLeft = Math.max(0, aoe.activeTimer)
      const elapsed = maxLife - timeLeft

      // 平滑淡入 (前0.25秒) 与淡出 (后0.6秒)
      let alpha = 1.0
      if (elapsed < 0.25) alpha = elapsed / 0.25
      if (timeLeft < 0.6) alpha = Math.min(alpha, timeLeft / 0.6)
      ctx.globalAlpha = Math.max(0, Math.min(0.96, alpha * 0.92))

      const poolSize = aoe.r * 2.35
      if (typeof bossCorpsePoisonPoolLoaded !== 'undefined' && bossCorpsePoisonPoolLoaded && bossCorpsePoisonPoolImg) {
        ctx.save()
        // 缓速水墨自旋与微幅呼吸律动
        ctx.rotate((aoe.spin || 0) + game.elapsed * 0.16)
        const pulse = 1.0 + Math.sin(game.elapsed * 3.2 + (aoe.spin || 0)) * 0.035
        ctx.scale(pulse, pulse)
        // 采用 source-over 绘制，完美呈现毒沼内部沸腾青绿酸蚀浆液、骷髅蒸气与黑色水墨边缘
        ctx.drawImage(bossCorpsePoisonPoolImg, -poolSize / 2, -poolSize / 2, poolSize, poolSize)
        ctx.restore()
      } else {
        // 降级矢量渲染
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        const hGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, aoe.r)
        hGrad.addColorStop(0, 'rgba(6, 214, 160, 0.8)')
        hGrad.addColorStop(0.5, 'rgba(46, 196, 182, 0.4)')
        hGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = hGrad
        ctx.beginPath()
        ctx.arc(0, 0, aoe.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      ctx.restore()
      continue
    }

    if (aoe.telegraphTimer > 0) {
      // 预警阶段：符文阵法光环与向内收缩充能
      const progress = 1 - aoe.telegraphTimer / aoe.maxTelegraph
      ctx.translate(aoe.x, aoe.y)

      if (aoe.bossId === 'red_dragon' && typeof bossDragonLavaLoaded !== 'undefined' && bossDragonLavaLoaded && bossDragonLavaImg) {
        // 赤炼地脉火煞高清贴图绘制 (带缓慢旋转与煞气涌动)
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.rotate(progress * Math.PI * 0.4)
        ctx.globalAlpha = 0.25 + progress * 0.65
        const dSize = (aoe.r || 52) * 2.25
        ctx.drawImage(bossDragonLavaImg, -dSize / 2, -dSize / 2, dSize, dSize)
        ctx.restore()

        // 危险边界虚线外环
        ctx.strokeStyle = '#ff4d4f'
        ctx.lineWidth = 2
        ctx.setLineDash([8, 6])
        ctx.beginPath()
        ctx.arc(0, 0, aoe.r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // 向内聚拢的龙火吸力线
        ctx.strokeStyle = '#ffd166'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(4, aoe.r * (1 - progress * 0.75)), 0, Math.PI * 2)
        ctx.stroke()
      } else {
        // 常规领主阵法底盘旋转
        ctx.rotate(progress * Math.PI)
        ctx.strokeStyle = aoe.color
        ctx.lineWidth = 2
        ctx.setLineDash([8, 6])
        ctx.beginPath()
        ctx.arc(0, 0, aoe.r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // 阵眼聚煞填充 (使用规范 globalAlpha 保持半透明，避免十六进制颜色替换失效变成实心大红圈)
        ctx.save()
        ctx.globalAlpha = 0.22
        ctx.fillStyle = aoe.color
        ctx.beginPath()
        ctx.arc(0, 0, aoe.r * progress, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // 八卦阵纹点缀
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2
          ctx.fillStyle = aoe.secondaryColor
          ctx.beginPath()
          ctx.arc(Math.cos(ang) * (aoe.r - 6), Math.sin(ang) * (aoe.r - 6), 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (aoe.activeTimer > 0) {
      // 爆发阶段：地裂通天光柱 / 地脉火煞冲天
      const p = Math.max(0, Math.min(1, aoe.activeTimer / (aoe.maxActive || 0.55)))
      ctx.translate(aoe.x, aoe.y)

      if (aoe.bossId === 'red_dragon' && typeof bossDragonLavaLoaded !== 'undefined' && bossDragonLavaLoaded && bossDragonLavaImg) {
        // 赤炼地脉火煞爆发贴图 (冲天放大与白炽金光)
        const burstScale = 1.0 + (1 - p) * 0.45
        const dSize = (aoe.r || 52) * 2.35 * burstScale
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = Math.min(1, p * 1.5)
        ctx.drawImage(bossDragonLavaImg, -dSize / 2, -dSize / 2, dSize, dSize)
        ctx.restore()

        // 中心熔岩爆发炽烈金红光圈
        const maxR = Math.max(12, (aoe.r || 52) * 1.35)
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, maxR)
        grad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.95 * p) + ')')
        grad.addColorStop(0.35, 'rgba(255, 190, 11, ' + (0.85 * p) + ')')
        grad.addColorStop(0.7, 'rgba(230, 57, 70, ' + (0.5 * p) + ')')
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(0, 0, maxR, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.globalAlpha = p

        const maxR = Math.max(12, (aoe.r || 52) * 1.2)
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, maxR)
        grad.addColorStop(0, aoe.secondaryColor)
        grad.addColorStop(0.5, aoe.color)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(0, 0, (aoe.r || 52) * (1 + (1 - p) * 0.3), 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }
}

function drawBoss(ctx) {
  const boss = game.boss
  if (!boss || boss.defeated) return

  ctx.save()

  // 1. 绘制近战冲刺预警线 (telegraph_rush)
  if (boss.state === 'telegraph_rush') {
    ctx.save()
    const p = 1 - boss.telegraphTimer / boss.maxTelegraph
    const endX = boss.x + boss.rushDir.x * boss.rushDist
    const endY = boss.y + boss.rushDir.y * boss.rushDist

    // 预警长方形带
    ctx.translate(boss.x, boss.y)
    const rushAngle = Math.atan2(boss.rushDir.y, boss.rushDir.x)
    ctx.rotate(rushAngle)

    // 预警光槽
    ctx.fillStyle = 'rgba(230, 57, 70, 0.18)'
    ctx.fillRect(0, -boss.r * 0.8, boss.rushDist, boss.r * 1.6)

    // 充能推进条
    ctx.fillStyle = 'rgba(255, 190, 11, 0.45)'
    ctx.fillRect(0, -boss.r * 0.8, boss.rushDist * p, boss.r * 1.6)

    // 边缘危险线
    ctx.strokeStyle = '#e63946'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 6])
    ctx.strokeRect(0, -boss.r * 0.8, boss.rushDist, boss.r * 1.6)
    ctx.restore()
  }

  // 2. 领主主体
  ctx.translate(boss.x, boss.y)

  // 狂暴/光环
  const auraPulse = Math.sin(boss.animTimer * 5) * 6
  ctx.save()
  const auraGrad = ctx.createRadialGradient(0, 0, boss.r * 0.5, 0, 0, boss.r + 20 + auraPulse)
  auraGrad.addColorStop(0, boss.auraColor)
  auraGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = auraGrad
  ctx.beginPath()
  ctx.arc(0, 0, boss.r + 22 + auraPulse, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 贴图或矢量精细渲染
  if (boss.id === 'red_dragon') {
    if ((bossRedDragonSheetLoaded && bossRedDragonSheetImg) || (bossRedDragonLoaded && bossRedDragonImg)) {
      ctx.save()
      const facingRight = (game.player ? game.player.x >= boss.x : Math.cos(boss.angle) >= 0)
      ctx.scale(facingRight ? 1 : -1, 1)

      // 灵动浮动波浪与飞行侧倾
      const floatY = Math.sin(boss.animTimer * 3.5) * 7
      const tilt = (facingRight ? 1 : -1) * (Math.sin(boss.animTimer * 2.2) * 0.06 + (boss.state === 'rushing' ? 0.18 : 0))
      ctx.rotate(tilt)

      // 弹性呼吸与受击形变 (Squash & Stretch)
      const bossHitSquash = boss.hit > 0 ? Math.sin((boss.hit / 0.16) * Math.PI) * 0.14 : 0
      const bossBreath = Math.sin(boss.animTimer * 3) * 0.035
      ctx.scale(1 + bossBreath + bossHitSquash, 1 - bossBreath * 0.5 - bossHitSquash * 0.6)

      // 战场地面深影投影
      ctx.save()
      ctx.fillStyle = 'rgba(10, 15, 20, 0.35)'
      ctx.beginPath()
      ctx.ellipse(0, boss.r * 1.05 - floatY, boss.r * 1.35, boss.r * 0.42, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // 绘制完整的千年赤炼蛟神躯 (优先使用8帧序列帧，呈现生动游龙起伏、龙睛耀芒与龙须灵动游弋)
      const sz = boss.r * 3.3
      if (bossRedDragonSheetLoaded && bossRedDragonSheetImg) {
        if (!boss.sheetAnim && typeof SpriteSheetAnimation !== 'undefined') {
          boss.sheetAnim = new SpriteSheetAnimation({
            img: bossRedDragonSheetImg,
            frameW: 180,
            frameH: 180,
            cols: 4,
            rows: 2,
            totalFrames: 8,
            fps: 9,
            loop: true
          })
        }
        if (boss.sheetAnim) {
          boss.sheetAnim.draw(ctx, 0, floatY, sz / 180, 0)
        } else {
          ctx.drawImage(bossRedDragonImg || bossRedDragonSheetImg, -sz / 2, -sz / 2 + floatY, sz, sz)
        }
      } else if (bossRedDragonLoaded && bossRedDragonImg) {
        ctx.drawImage(bossRedDragonImg, -sz / 2, -sz / 2 + floatY, sz, sz)
      }

      // 受击神体真形白金流光 (替换原本生硬粗暴的白色大实心圆盘，按神龙真容轮廓加色闪烁)
      if (boss.hit > 0) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        const hitAlpha = Math.min(0.45, (boss.hit / 0.16) * 0.4)
        if (boss.sheetAnim && bossRedDragonSheetLoaded && bossRedDragonSheetImg) {
          boss.sheetAnim.draw(ctx, 0, floatY, sz / 180, 0, hitAlpha)
        } else if (bossRedDragonLoaded && bossRedDragonImg) {
          ctx.globalAlpha = hitAlpha
          ctx.drawImage(bossRedDragonImg, -sz / 2, -sz / 2 + floatY, sz, sz)
        }
        ctx.restore()
      }

      ctx.restore()
    } else {
      drawRedDragonHeadModel(ctx, boss)
    }
  } else if (boss.id === 'corpse_emperor') {
    drawCorpseEmperorModel(ctx, boss)
  } else if (boss.id === 'asura_demon') {
    drawAsuraDemonModel(ctx, boss)
  } else if (boss.id === 'celestial_peng') {
    drawCelestialPengModel(ctx, boss)
  } else if (boss.id === 'primordial_god') {
    drawPrimordialGodModel(ctx, boss)
  } else {
    // 默认高品质矢量巨妖
    drawGenericBossModel(ctx, boss)
  }

  ctx.restore()
}

function drawRedDragonHeadModel(ctx, boss) {
  ctx.save()
  ctx.rotate(boss.angle)
  const t = boss.animTimer
  const isEnraged = boss.phaseIndex >= 1

  // 1. 烈焰龙鬃 (向后流动的火灵鬃毛)
  for (let i = 0; i < 6; i++) {
    const maneLen = 25 + (i % 3) * 12 + Math.sin(t * 8 + i) * 6
    const maneAng = Math.PI - 0.7 + i * 0.28
    const mx = Math.cos(maneAng) * (boss.r * 0.8)
    const my = Math.sin(maneAng) * (boss.r * 0.8)
    ctx.save()
    ctx.translate(mx, my)
    ctx.rotate(maneAng + Math.PI / 2 + Math.sin(t * 6 + i) * 0.2)
    ctx.fillStyle = i % 2 === 0 ? '#ffbe0b' : '#fb5607'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(8, -maneLen)
    ctx.lineTo(-8, -maneLen * 0.6)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // 2. 纯阳龙角 (Golden Branching Dragon Horns)
  for (let side of [-1, 1]) {
    ctx.save()
    ctx.scale(1, side)
    const hornGrad = ctx.createLinearGradient(-15, -10, -45, -35)
    hornGrad.addColorStop(0, '#ffd166')
    hornGrad.addColorStop(0.5, '#f77f00')
    hornGrad.addColorStop(1, '#d62828')
    ctx.fillStyle = hornGrad
    ctx.beginPath()
    ctx.moveTo(-10, -14)
    ctx.quadraticCurveTo(-28, -25, -45, -36)
    ctx.quadraticCurveTo(-30, -20, -18, -10)
    ctx.closePath()
    ctx.fill()

    // 龙角分叉
    ctx.beginPath()
    ctx.moveTo(-25, -20)
    ctx.quadraticCurveTo(-32, -32, -38, -35)
    ctx.quadraticCurveTo(-28, -26, -20, -16)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // 3. 巨蛟龙头骨骼与赤炼龙鳞 (Crimson Scaled Dragon Skull)
  const headGrad = ctx.createRadialGradient(8, 0, 5, 0, 0, boss.r)
  headGrad.addColorStop(0, isEnraged ? '#ff4d4f' : '#e63946')
  headGrad.addColorStop(0.65, '#9d0208')
  headGrad.addColorStop(1, '#370617')
  ctx.fillStyle = headGrad
  ctx.beginPath()
  ctx.moveTo(boss.r + 6, 0)
  ctx.quadraticCurveTo(boss.r * 0.6, -boss.r * 0.7, -boss.r * 0.4, -boss.r * 0.65)
  ctx.quadraticCurveTo(-boss.r * 0.8, 0, -boss.r * 0.4, boss.r * 0.65)
  ctx.quadraticCurveTo(boss.r * 0.6, boss.r * 0.7, boss.r + 6, 0)
  ctx.closePath()
  ctx.fill()

  // 龙鳞铠纹
  ctx.strokeStyle = isEnraged ? '#ffbe0b' : 'rgba(255, 190, 11, 0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(-5, 0, boss.r * 0.5, -0.9, 0.9)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(-15, 0, boss.r * 0.65, -0.8, 0.8)
  ctx.stroke()

  // 4. 额间火煞真核 / 龙晶 (Forehead Fire Gem)
  const gemGrad = ctx.createRadialGradient(5, 0, 1, 5, 0, 10)
  gemGrad.addColorStop(0, '#ffffff')
  gemGrad.addColorStop(0.4, '#ffbe0b')
  gemGrad.addColorStop(1, '#d00000')
  ctx.fillStyle = gemGrad
  ctx.shadowColor = '#ffbe0b'
  ctx.shadowBlur = 15
  ctx.beginPath()
  ctx.ellipse(6, 0, 10, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // 5. 蛟龙利齿与巨吻 (Dragon Fangs)
  ctx.fillStyle = '#f8f9fa'
  for (let side of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(boss.r - 2, side * 7)
    ctx.lineTo(boss.r + 10, side * 5)
    ctx.lineTo(boss.r + 2, side * 12)
    ctx.closePath()
    ctx.fill()
  }

  // 6. 凶煞龙目 (Fierce Golden Dragon Eyes)
  for (let side of [-1, 1]) {
    const eyeY = side * 14
    ctx.save()
    ctx.fillStyle = '#10002b'
    ctx.beginPath()
    ctx.ellipse(8, eyeY, 9, 5, side * 0.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffbe0b'
    ctx.shadowColor = '#ffbe0b'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.ellipse(9, eyeY, 6, 3.5, side * 0.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#780000'
    ctx.beginPath()
    ctx.ellipse(9, eyeY, 1.5, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 7. 游弋龙须 (Undulating Golden Whiskers)
  const whiskerWave1 = Math.sin(t * 7) * 8
  const whiskerWave2 = Math.cos(t * 7) * 8
  for (let side of [-1, 1]) {
    ctx.save()
    ctx.strokeStyle = '#ffd166'
    ctx.lineWidth = 2.2
    ctx.shadowColor = '#ffbe0b'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(boss.r - 4, side * 10)
    ctx.bezierCurveTo(
      boss.r + 20, side * 24 + whiskerWave1 * side,
      boss.r + 35, side * 12 - whiskerWave2 * side,
      boss.r + 55, side * 28 + (side > 0 ? whiskerWave1 : whiskerWave2)
    )
    ctx.stroke()
    ctx.restore()
  }

  ctx.restore()
}

function drawCorpseEmperorModel(ctx, boss) {
  ctx.save()

  // 1. 幽冥灵骨锁链：连接中心神颅与各个悬浮骨臂
  if (boss.arms && boss.arms.length > 0) {
    for (const arm of boss.arms) {
      if (arm.hp <= 0 || arm.destroyed) continue
      const armRelX = arm.x - boss.x
      const armRelY = arm.y - boss.y

      ctx.save()
      ctx.strokeStyle = 'rgba(6, 214, 160, 0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(armRelX * 0.5, armRelY * 0.5 + Math.sin(boss.animTimer * 4 + arm.index) * 8, armRelX, armRelY)
      ctx.stroke()

      // 骨节能量珠
      for (let k = 1; k <= 3; k++) {
        const tRatio = k / 4
        const bx = armRelX * tRatio
        const by = armRelY * tRatio + Math.sin(boss.animTimer * 4 + arm.index + k) * 5
        ctx.fillStyle = '#f8f9fa'
        ctx.beginPath()
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    // 2. 绘制各个独立白骨手臂 (序列帧动画、独立血条、受击形变)
    for (const arm of boss.arms) {
      if (arm.hp <= 0 || arm.destroyed) continue
      ctx.save()
      ctx.translate(arm.x - boss.x, arm.y - boss.y)
      const armFacing = arm.side || 1
      ctx.scale(armFacing, 1)

      const armTilt = Math.sin(boss.animTimer * 3 + arm.index) * 0.08
      ctx.rotate(armTilt)

      // 地面深影
      ctx.save()
      ctx.fillStyle = 'rgba(10, 15, 20, 0.35)'
      ctx.beginPath()
      ctx.ellipse(0, arm.r * 1.1, arm.r * 1.1, arm.r * 0.4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // 绘制8帧骨臂贴图
      const armSize = arm.r * 3.8
      if (bossCorpseArmSheetLoaded && bossCorpseArmSheetImg) {
        if (!arm.sheetAnim && typeof SpriteSheetAnimation !== 'undefined') {
          arm.sheetAnim = new SpriteSheetAnimation({
            img: bossCorpseArmSheetImg,
            frameW: 180,
            frameH: 180,
            cols: 4,
            rows: 2,
            totalFrames: 8,
            fps: 8,
            loop: true
          })
        }
        if (arm.sheetAnim) {
          arm.sheetAnim.draw(ctx, 0, 0, armSize / 180, 0)
        } else {
          ctx.drawImage(bossCorpseArmSheetImg, -armSize / 2, -armSize / 2, armSize, armSize)
        }
      } else {
        ctx.fillStyle = '#f8f9fa'
        ctx.strokeStyle = '#06d6a0'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, arm.r * 0.8, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      // 骨臂受击白光流光
      if (arm.hit > 0) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        const hitAlpha = Math.min(0.5, (arm.hit / 0.16) * 0.45)
        if (arm.sheetAnim && bossCorpseArmSheetLoaded && bossCorpseArmSheetImg) {
          arm.sheetAnim.draw(ctx, 0, 0, armSize / 180, 0, hitAlpha)
        }
        ctx.restore()
      }

      // 独立微型浮动血条
      ctx.save()
      ctx.scale(armFacing, 1) // 保持血条正向不镜像
      const barW = 34
      const barH = 4
      const barY = -arm.r - 12
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
      ctx.fillRect(-barW / 2, barY, barW, barH)
      const armHpRatio = Math.max(0, Math.min(1, arm.hp / arm.maxHp))
      ctx.fillStyle = '#06d6a0'
      ctx.fillRect(-barW / 2, barY, barW * armHpRatio, barH)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 0.8
      ctx.strokeRect(-barW / 2, barY, barW, barH)
      ctx.restore()

      ctx.restore()
    }
  }

  // 3. 绘制中心骷髅神颅 (一阶段单首神颅 / 二阶段三首融合狂骨)
  ctx.save()
  const facingRight = (game.player ? game.player.x >= boss.x : Math.cos(boss.angle) >= 0)
  ctx.scale(facingRight ? 1 : -1, 1)

  const skullWindupShake = (boss.skullWindup > 0) ? (Math.sin(boss.skullWindup * 60) * 3.5) : 0
  const floatY = Math.sin(boss.animTimer * 3.2) * 6 + skullWindupShake
  const tilt = (facingRight ? 1 : -1) * (Math.sin(boss.animTimer * 2.0) * 0.05 + (boss.state === 'rushing' ? 0.15 : 0))
  ctx.rotate(tilt)

  const bossHitSquash = boss.hit > 0 ? Math.sin((boss.hit / 0.16) * Math.PI) * 0.12 : 0
  const bossBreath = Math.sin(boss.animTimer * 2.8) * 0.03
  ctx.scale(1 + bossBreath + bossHitSquash, 1 - bossBreath * 0.5 - bossHitSquash * 0.5)

  // 地面深影
  ctx.save()
  ctx.fillStyle = 'rgba(10, 15, 20, 0.38)'
  ctx.beginPath()
  ctx.ellipse(0, boss.r * 1.15 - floatY, boss.r * 1.25, boss.r * 0.45, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const isPhase2 = boss.phaseIndex >= 1
  const headSize = boss.r * (isPhase2 ? 3.6 : 3.3)
  const currentSheetImg = isPhase2 ? bossCorpseTriSkullSheetImg : bossCorpseSkullSheetImg
  const currentSheetLoaded = isPhase2 ? bossCorpseTriSkullSheetLoaded : bossCorpseSkullSheetLoaded

  if (currentSheetLoaded && currentSheetImg) {
    if (!boss.sheetAnim && typeof SpriteSheetAnimation !== 'undefined') {
      boss.sheetAnim = new SpriteSheetAnimation({
        img: currentSheetImg,
        frameW: 180,
        frameH: 180,
        cols: 4,
        rows: 2,
        totalFrames: 8,
        fps: 9,
        loop: true
      })
    }
    if (boss.sheetAnim) {
      boss.sheetAnim.draw(ctx, 0, floatY, headSize / 180, 0)
    } else {
      ctx.drawImage(currentSheetImg, -headSize / 2, -headSize / 2 + floatY, headSize, headSize)
    }
  } else {
    ctx.fillStyle = '#e0e1dd'
    ctx.beginPath()
    ctx.arc(0, floatY, boss.r * 0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#06d6a0'
    ctx.beginPath()
    ctx.arc(-10, floatY - 4, 5, 0, Math.PI * 2)
    ctx.arc(10, floatY - 4, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 一阶段神颅蓄力前摇光效 (幽冥魔焰于颅骨口颌凝聚沸腾)
  if (boss.skullWindup > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const gatherR = boss.r * (0.6 + 0.4 * Math.sin(boss.skullWindup * 35))
    const grad = ctx.createRadialGradient(0, floatY + boss.r * 0.28, 2, 0, floatY + boss.r * 0.28, gatherR)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.35, '#06d6a0')
    grad.addColorStop(0.75, 'rgba(46, 196, 182, 0.4)')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(0, floatY + boss.r * 0.28, gatherR, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 受击真容轮廓流光
  if (boss.hit > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const hitAlpha = Math.min(0.45, (boss.hit / 0.16) * 0.4)
    if (boss.sheetAnim && currentSheetLoaded && currentSheetImg) {
      boss.sheetAnim.draw(ctx, 0, floatY, headSize / 180, 0, hitAlpha)
    }
    ctx.restore()
  }

  // 二阶段狂暴绝境额外魔焰
  if (isPhase2 && boss.isBerserk) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.35 + Math.sin(boss.animTimer * 8) * 0.15
    const fGrad = ctx.createRadialGradient(0, floatY, boss.r * 0.3, 0, floatY, boss.r * 1.3)
    fGrad.addColorStop(0, '#06d6a0')
    fGrad.addColorStop(0.7, '#2ec4b6')
    fGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = fGrad
    ctx.beginPath()
    ctx.arc(0, floatY, boss.r * 1.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()

  // 4. 九幽玄阴骨盾 (未优先击杀手臂时，巨量防御90%减伤结界)
  const livingArms = boss.arms ? boss.arms.filter(a => a.hp > 0 && !a.destroyed) : []
  if (livingArms.length > 0) {
    ctx.save()
    const shieldR = boss.r * 1.55
    ctx.rotate(boss.animTimer * 1.2)
    ctx.strokeStyle = '#06d6a0'
    ctx.lineWidth = 2.5
    ctx.setLineDash([12, 8])
    ctx.beginPath()
    ctx.arc(0, 0, shieldR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.globalAlpha = 0.2 + (boss.hit > 0 ? 0.3 : 0) + Math.sin(boss.animTimer * 4) * 0.08
    const sGrad = ctx.createRadialGradient(0, 0, boss.r * 0.5, 0, 0, shieldR)
    sGrad.addColorStop(0, 'transparent')
    sGrad.addColorStop(0.7, 'rgba(6, 214, 160, 0.2)')
    sGrad.addColorStop(1, 'rgba(6, 214, 160, 0.65)')
    ctx.fillStyle = sGrad
    ctx.beginPath()
    ctx.arc(0, 0, shieldR, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.font = 'bold 11px sans-serif'
    ctx.fillStyle = '#06d6a0'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#06d6a0'
    ctx.shadowBlur = 8
    ctx.fillText('【九幽骨盾 减伤90%】', 0, -boss.r - 22)
    ctx.restore()
  } else {
    ctx.save()
    ctx.font = 'bold 11px sans-serif'
    ctx.fillStyle = '#ffbe0b'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#ffbe0b'
    ctx.shadowBlur = 8
    ctx.fillText('【极度易伤 +25%】', 0, -boss.r - 22)
    ctx.restore()
  }

  ctx.restore()
}

function drawAsuraDemonModel(ctx, boss) {
  ctx.save()
  const t = boss.animTimer
  const isEnraged = boss.phaseIndex >= 1

  // 六臂魔影
  const armCount = isEnraged ? 6 : 4
  for (let i = 0; i < armCount; i++) {
    const angle = (i / armCount) * Math.PI * 2 + Math.sin(t * 3 + i) * 0.2
    ctx.save()
    ctx.rotate(angle)
    ctx.fillStyle = '#3a0ca3'
    ctx.fillRect(boss.r * 0.6, -6, 24, 12)
    // 魔爪爪尖
    ctx.fillStyle = '#f72585'
    ctx.beginPath()
    ctx.moveTo(boss.r * 0.6 + 24, -8)
    ctx.lineTo(boss.r * 0.6 + 34, 0)
    ctx.lineTo(boss.r * 0.6 + 24, 8)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // 魔尊核心
  const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, boss.r * 0.8)
  grad.addColorStop(0, '#f72585')
  grad.addColorStop(0.6, '#7209b7')
  grad.addColorStop(1, '#10002b')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(0, 0, boss.r * 0.8, 0, Math.PI * 2)
  ctx.fill()

  // 极恶魔角
  ctx.fillStyle = '#240046'
  ctx.beginPath()
  ctx.moveTo(-18, -boss.r * 0.5)
  ctx.quadraticCurveTo(-35, -boss.r - 20, -12, -boss.r - 16)
  ctx.lineTo(-8, -boss.r * 0.5)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(18, -boss.r * 0.5)
  ctx.quadraticCurveTo(35, -boss.r - 20, 12, -boss.r - 16)
  ctx.lineTo(8, -boss.r * 0.5)
  ctx.closePath()
  ctx.fill()

  // 三目血瞳
  ctx.fillStyle = '#f72585'
  ctx.shadowColor = '#f72585'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(-10, -6, 4, 0, Math.PI * 2)
  ctx.arc(10, -6, 4, 0, Math.PI * 2)
  ctx.arc(0, -16, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawCelestialPengModel(ctx, boss) {
  ctx.save()
  const t = boss.animTimer
  const wingBeat = Math.sin(t * 8) * 0.35

  // 纯阳太乙金翼
  for (let side of [-1, 1]) {
    ctx.save()
    ctx.scale(side, 1)
    ctx.rotate(wingBeat)
    const wingGrad = ctx.createLinearGradient(0, 0, boss.r + 40, 0)
    wingGrad.addColorStop(0, '#ffffff')
    wingGrad.addColorStop(0.5, '#ffb703')
    wingGrad.addColorStop(1, '#fb8500')
    ctx.fillStyle = wingGrad
    ctx.beginPath()
    ctx.moveTo(12, -10)
    ctx.lineTo(boss.r + 45, -boss.r - 15)
    ctx.lineTo(boss.r + 25, 10)
    ctx.lineTo(boss.r + 40, 30)
    ctx.lineTo(15, 15)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // 金鹏神躯
  const bodyGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, boss.r * 0.75)
  bodyGrad.addColorStop(0, '#ffffff')
  bodyGrad.addColorStop(0.7, '#ffb703')
  bodyGrad.addColorStop(1, '#b08900')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.arc(0, 0, boss.r * 0.75, 0, Math.PI * 2)
  ctx.fill()

  // 神鹰金冠与神目
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#ffea00'
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.arc(-9, -8, 4.5, 0, Math.PI * 2)
  ctx.arc(9, -8, 4.5, 0, Math.PI * 2)
  ctx.fill()

  // 金色神喙
  ctx.fillStyle = '#fb8500'
  ctx.beginPath()
  ctx.moveTo(-6, -4)
  ctx.lineTo(0, 16)
  ctx.lineTo(6, -4)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

function drawGenericBossModel(ctx, boss) {
  ctx.save()
  const t = boss.animTimer
  // 环形护体魔煞刺
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + t * 2
    ctx.save()
    ctx.rotate(ang)
    ctx.fillStyle = boss.secondaryColor || '#ffbe0b'
    ctx.beginPath()
    ctx.moveTo(boss.r * 0.7, -4)
    ctx.lineTo(boss.r + 14, 0)
    ctx.lineTo(boss.r * 0.7, 4)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // 核心魔煞真躯
  const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, boss.r)
  grad.addColorStop(0, boss.secondaryColor || '#ffd166')
  grad.addColorStop(0.7, boss.color || '#e63946')
  grad.addColorStop(1, '#1b0000')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(0, 0, boss.r, 0, Math.PI * 2)
  ctx.fill()

  // 魔煞符文外圈
  ctx.strokeStyle = boss.secondaryColor || '#ffbe0b'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.arc(0, 0, boss.r * 0.85, t, t + Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // 幽煞神目
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = boss.secondaryColor || '#ffbe0b'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(-boss.r * 0.3, -boss.r * 0.15, 5, 0, Math.PI * 2)
  ctx.arc(boss.r * 0.3, -boss.r * 0.15, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawPrimordialGodModel(ctx, boss) {
  ctx.save()
  const t = boss.animTimer
  const isEnraged = boss.phaseIndex >= 1
  const isFinalPhase = boss.phaseIndex >= 2

  // 1. 周身旋转九天玄黄太极八卦星环
  const ringRadius = boss.r * 1.55
  ctx.save()
  ctx.rotate(t * 0.7)
  ctx.strokeStyle = 'rgba(76, 201, 240, 0.45)'
  ctx.lineWidth = 2.5
  ctx.setLineDash([12, 8])
  ctx.beginPath()
  ctx.arc(0, 0, ringRadius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // 2. 八方阵位流转道纹 (8个旋转星宿灵光)
  const trigramCount = 8
  for (let i = 0; i < trigramCount; i++) {
    const angle = (i / trigramCount) * Math.PI * 2 + t * 0.7
    const tx = Math.cos(angle) * ringRadius
    const ty = Math.sin(angle) * ringRadius
    ctx.save()
    ctx.fillStyle = i % 2 === 0 ? '#ffd700' : '#4cc9f0'
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(tx, ty, 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 3. 护体悬浮太极图 (核心阴阳双鱼反向飞转)
  ctx.save()
  ctx.rotate(-t * 1.2)
  // 阳鱼 (天青)
  ctx.fillStyle = '#4cc9f0'
  ctx.beginPath()
  ctx.arc(0, 0, boss.r * 0.72, -Math.PI / 2, Math.PI / 2)
  ctx.arc(0, boss.r * 0.36, boss.r * 0.36, Math.PI / 2, -Math.PI / 2, true)
  ctx.arc(0, -boss.r * 0.36, boss.r * 0.36, Math.PI / 2, -Math.PI / 2)
  ctx.closePath()
  ctx.fill()
  // 阴鱼 (品红)
  ctx.fillStyle = '#f72585'
  ctx.beginPath()
  ctx.arc(0, 0, boss.r * 0.72, Math.PI / 2, -Math.PI / 2)
  ctx.arc(0, -boss.r * 0.36, boss.r * 0.36, -Math.PI / 2, Math.PI / 2, true)
  ctx.arc(0, boss.r * 0.36, boss.r * 0.36, -Math.PI / 2, Math.PI / 2)
  ctx.closePath()
  ctx.fill()
  // 鱼眼
  ctx.fillStyle = '#f72585'
  ctx.beginPath()
  ctx.arc(0, -boss.r * 0.36, 4.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4cc9f0'
  ctx.beginPath()
  ctx.arc(0, boss.r * 0.36, 4.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 4. 周身外侧悬浮的太虚诛仙飞剑御阵 (4/6把流光飞剑绕体)
  const swordCount = isFinalPhase ? 6 : 4
  for (let s = 0; s < swordCount; s++) {
    const sAngle = (s / swordCount) * Math.PI * 2 + t * 1.6
    const sx = Math.cos(sAngle) * (boss.r + 26)
    const sy = Math.sin(sAngle) * (boss.r + 26)
    ctx.save()
    ctx.translate(sx, sy)
    ctx.rotate(sAngle + Math.PI / 2)
    ctx.fillStyle = '#ffd700'
    ctx.shadowColor = '#4cc9f0'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.moveTo(0, -14)
    ctx.lineTo(3.5, 8)
    ctx.lineTo(0, 12)
    ctx.lineTo(-3.5, 8)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // 5. 神道法相尊容 (额间开天神目与金冠霞帔)
  ctx.fillStyle = '#ffd700'
  ctx.shadowColor = '#ffd700'
  ctx.shadowBlur = 12
  // 神冠
  ctx.beginPath()
  ctx.moveTo(-16, -boss.r * 0.72)
  ctx.lineTo(-8, -boss.r * 0.72 - 16)
  ctx.lineTo(0, -boss.r * 0.72 - 8)
  ctx.lineTo(8, -boss.r * 0.72 - 16)
  ctx.lineTo(16, -boss.r * 0.72)
  ctx.closePath()
  ctx.fill()

  // 开天神目
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(0, -4, 4.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawBossProjectiles(ctx) {
  if (!game.bossProjectiles || !game.bossProjectiles.length) return

  for (const proj of game.bossProjectiles) {
    ctx.save()
    ctx.translate(proj.x, proj.y)
    ctx.shadowColor = proj.glowColor || proj.color
    ctx.shadowBlur = 12

    if (proj.type === 'fireball') {
      if (typeof bossDragonFireballLoaded !== 'undefined' && bossDragonFireballLoaded && bossDragonFireballImg) {
        const ang = Math.atan2(proj.vy, proj.vx)
        ctx.rotate(ang + (game.elapsed * 5) + (proj.spin || 0))
        const pSize = Math.max(26, proj.r * 4.2)
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(bossDragonFireballImg, -pSize / 2, -pSize / 2, pSize, pSize)
      } else {
        ctx.fillStyle = proj.glowColor
        ctx.beginPath()
        ctx.arc(0, 0, proj.r * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = proj.color
        ctx.beginPath()
        ctx.arc(0, 0, proj.r, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (proj.type === 'frost_crystal') {
      const ang = Math.atan2(proj.vy, proj.vx)
      ctx.rotate(ang)
      if (typeof frostCrystalLoaded !== 'undefined' && frostCrystalLoaded && frostCrystalImg) {
        const pSize = Math.max(28, proj.r * 4.6)
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(frostCrystalImg, -pSize / 2, -pSize / 2, pSize, pSize)
      } else {
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)'
        ctx.beginPath()
        ctx.arc(0, 0, proj.r * 1.8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#bae6fd'
        ctx.beginPath()
        ctx.moveTo(proj.r * 2.8, 0)
        ctx.lineTo(0, -proj.r * 0.9)
        ctx.lineTo(-proj.r * 2.0, 0)
        ctx.lineTo(0, proj.r * 0.9)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    } else if (proj.type === 'corpse_knuckle') {
      const ang = Math.atan2(proj.vy, proj.vx)
      // 尖锐指骨沿实际飞行矢量破空疾射 (effect_corpse_knuckle.png 骨针尖端朝向为 135 度)
      const tipAngleOffset = (3 * Math.PI) / 4
      const flutter = Math.sin(game.elapsed * 20 + (proj.spin || 0) * 8) * 0.04
      ctx.rotate(ang - tipAngleOffset + flutter)

      // 柔和幽绿光影，杜绝纯白高光过曝冲蚀
      ctx.shadowColor = 'rgba(6, 214, 160, 0.45)'
      ctx.shadowBlur = 5

      if (typeof bossCorpseKnuckleLoaded !== 'undefined' && bossCorpseKnuckleLoaded && bossCorpseKnuckleImg) {
        const kSize = Math.max(32, proj.r * 4.2)
        // 关键修复：采用 source-over 正常图层混合，清晰完整呈现白骨关节、深色水墨轮廓线与缠绕碧火
        ctx.globalCompositeOperation = 'source-over'
        ctx.drawImage(bossCorpseKnuckleImg, -kSize / 2, -kSize / 2, kSize, kSize)
      } else {
        ctx.fillStyle = '#f8f9fa'
        ctx.fillRect(-proj.r * 1.2, -proj.r * 0.5, proj.r * 2.4, proj.r)
        ctx.fillStyle = '#06d6a0'
        ctx.beginPath()
        ctx.arc(0, 0, proj.r * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (proj.type === 'corpse_ghost_fire' || proj.type === 'corpse_giant_ghost_fire') {
      const isGiant = proj.type === 'corpse_giant_ghost_fire'
      const ang = Math.atan2(proj.vy, proj.vx)
      ctx.rotate(ang + game.elapsed * 4)
      ctx.shadowColor = 'rgba(6, 214, 160, 0.65)'
      ctx.shadowBlur = 8
      if (typeof bossCorpseGhostFireLoaded !== 'undefined' && bossCorpseGhostFireLoaded && bossCorpseGhostFireImg) {
        const fSize = Math.max(32, proj.r * (isGiant ? 3.6 : 3.0))
        // 采用 source-over 清晰显现鬼火内部咆哮的百鬼骷髅鬼面与外围水墨气浪
        ctx.globalCompositeOperation = 'source-over'
        ctx.drawImage(bossCorpseGhostFireImg, -fSize / 2, -fSize / 2, fSize, fSize)
      } else {
        ctx.fillStyle = '#06d6a0'
        ctx.beginPath()
        ctx.arc(0, 0, proj.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#f8f9fa'
        ctx.beginPath()
        ctx.arc(0, 0, proj.r * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (proj.type === 'bonespike') {
      const ang = Math.atan2(proj.vy, proj.vx)
      ctx.rotate(ang)
      ctx.fillStyle = proj.glowColor
      ctx.fillRect(-proj.r * 1.5, -2, proj.r * 3, 4)
      ctx.fillStyle = proj.color
      ctx.beginPath()
      ctx.arc(0, 0, proj.r * 0.8, 0, Math.PI * 2)
      ctx.fill()
    } else if (proj.type === 'feather') {
      const ang = Math.atan2(proj.vy, proj.vx)
      ctx.rotate(ang)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(proj.r * 2, 0)
      ctx.lineTo(-proj.r, -4)
      ctx.lineTo(-proj.r, 4)
      ctx.closePath()
      ctx.fill()
    } else if (proj.type === 'cosmic_blade') {
      const ang = Math.atan2(proj.vy, proj.vx)
      ctx.rotate(ang)
      ctx.fillStyle = proj.glowColor
      ctx.fillRect(-proj.r * 2, -2, proj.r * 4, 4)
      ctx.fillStyle = proj.color
      ctx.beginPath()
      ctx.moveTo(proj.r * 2.5, 0)
      ctx.lineTo(-proj.r * 1.5, -4)
      ctx.lineTo(-proj.r, 0)
      ctx.lineTo(-proj.r * 1.5, 4)
      ctx.closePath()
      ctx.fill()
    } else if (proj.type === 'yin_yang_orb') {
      ctx.rotate(game.elapsed * 6)
      ctx.fillStyle = proj.color
      ctx.beginPath()
      ctx.arc(0, 0, proj.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = proj.glowColor
      ctx.beginPath()
      ctx.arc(proj.r * 0.35, 0, proj.r * 0.4, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // 幽冥魔魂弹
      ctx.fillStyle = proj.color
      ctx.beginPath()
      ctx.arc(0, 0, proj.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

/* ==========================================================================
   修仙 2D 动画引擎与动态视效系统 (Xianxia 2D Animation & Visual Juice Engine)
   - 包含：呼吸律动与受击弹性形变 (Squash & Stretch)
   - 包含：神行高速残影拖尾 (Ghost Trails / Motion Blur)
   - 包含：受击冲击光环与暴击火花 (Hit Rings & Spark Emitters)
   - 包含：2D 序列帧/程序化法术斩击特效播放器 (Sprite & Procedural VFX Player)
   - 包含：地面阴影与游弋浮动物理 (Floating Waves & Dynamic Shadows)
   ========================================================================== */

class SpriteSheetAnimation {
  constructor(options) {
    this.img = options.img || null
    this.frameW = options.frameW || 64
    this.frameH = options.frameH || 64
    this.cols = options.cols || 4
    this.rows = options.rows || 1
    this.totalFrames = options.totalFrames || (this.cols * this.rows)
    this.fps = options.fps || 12
    this.loop = options.loop !== false
    this.currentFrame = 0
    this.timer = 0
    this.finished = false
    this.onComplete = options.onComplete || null
  }

  update(dt) {
    if (this.finished) return
    this.timer += dt
    const frameDuration = 1 / this.fps
    while (this.timer >= frameDuration && !this.finished) {
      this.timer -= frameDuration
      this.currentFrame++
      if (this.currentFrame >= this.totalFrames) {
        if (this.loop) {
          this.currentFrame = 0
        } else {
          this.currentFrame = this.totalFrames - 1
          this.finished = true
          if (this.onComplete) this.onComplete()
          break
        }
      }
    }
  }

  draw(ctx, x, y, scale = 1, rotation = 0, alpha = 1) {
    if (!this.img || (typeof this.img.complete !== 'undefined' && !this.img.complete) || this.finished) return
    const col = this.currentFrame % this.cols
    const row = Math.floor(this.currentFrame / this.cols)
    const sx = col * this.frameW
    const sy = row * this.frameH

    ctx.save()
    ctx.translate(x, y)
    if (rotation !== 0) ctx.rotate(rotation)
    if (scale !== 1) ctx.scale(scale, scale)
    if (alpha !== 1) ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
    ctx.drawImage(this.img, sx, sy, this.frameW, this.frameH, -this.frameW / 2, -this.frameH / 2, this.frameW, this.frameH)
    ctx.restore()
  }
}

function initVFXSystem() {
  if (!game.ghostTrails) game.ghostTrails = []
  if (!game.hitRings) game.hitRings = []
  if (!game.spriteAnimations) game.spriteAnimations = []
}

function getSpriteSquash(elapsed, isMoving, isAttacking, attackProgress, hitTimer = 0) {
  // 1. 待机悠缓呼吸或走动脚步弹性律动
  const breathFreq = isMoving ? 13 : 3.4
  const breathAmp = isMoving ? 0.06 : 0.03
  const breathY = Math.sin(elapsed * breathFreq) * breathAmp
  const breathX = -breathY * 0.65

  // 2. 出招前冲弹性形变
  const attackStretch = isAttacking ? Math.sin((1 - attackProgress) * Math.PI) * 0.12 : 0

  // 3. 受击瞬间挤压震颤 (Squash & Spring back)
  let hitSquashX = 0
  let hitSquashY = 0
  if (hitTimer > 0) {
    const hitP = hitTimer / 0.35
    hitSquashX = Math.sin(hitP * Math.PI) * 0.16
    hitSquashY = -hitSquashX * 0.8
  }

  return {
    scaleX: 1 + breathX + attackStretch + hitSquashX,
    scaleY: 1 + breathY - (attackStretch * 0.4) + hitSquashY
  }
}

function spawnPlayerGhostTrail(force = false) {
  if (isHeadless && !force) return
  initVFXSystem()
  const p = game.player
  if (!p) return

  const charId = p.charId || 'sword'
  const sprite = (typeof charSprites !== 'undefined') ? (charSprites[charId] || charSprites.sword) : null
  const weaponSheet = (typeof getPlayerWeaponSheet === 'function') ? getPlayerWeaponSheet(p) : null

  let ghostColor = 'rgba(100, 232, 203, 0.45)'
  if (charId === 'spell') ghostColor = 'rgba(56, 189, 248, 0.45)'
  else if (charId === 'body') ghostColor = 'rgba(245, 158, 11, 0.45)'
  else if (charId === 'beast') ghostColor = 'rgba(16, 185, 129, 0.45)'
  else if (charId === 'formation_master') ghostColor = 'rgba(192, 132, 252, 0.45)'
  else if (charId === 'alchemist') ghostColor = 'rgba(132, 204, 22, 0.45)'
  else if (charId === 'demon') ghostColor = 'rgba(239, 68, 68, 0.45)'
  else if (charId === 'ghost') ghostColor = 'rgba(45, 212, 191, 0.45)'
  else if (charId === 'sword') {
    const curWeapon = (game.weapons && game.weapons[0]) || {}
    const wType = p.weaponType || curWeapon.weaponType || curWeapon.type || 'sword'
    if (wType === 'thunder_sword' || curWeapon.id === 'sword_benlei') {
      ghostColor = 'rgba(165, 189, 248, 0.45)'
    } else if (wType === 'daggers' || curWeapon.id === 'sword_jifeng') {
      ghostColor = 'rgba(110, 231, 183, 0.45)'
    }
  }

  let facingRight = true
  const target = (typeof nearestEnemy === 'function') ? nearestEnemy(p) : null
  if (target) {
    facingRight = target.x >= p.x
  } else if (p.facing !== undefined) {
    facingRight = Math.cos(p.facing) >= 0
  }

  game.ghostTrails.push({
    x: p.x,
    y: p.y,
    sprite: sprite,
    sheet: weaponSheet && weaponSheet.loaded ? weaponSheet : null,
    frameIndex: p._actionFrameIdx || 0,
    facingRight,
    color: ghostColor,
    life: 0.26,
    maxLife: 0.26
  })
}

function spawnBossGhostTrail(boss) {
  if (isHeadless || !boss) return
  initVFXSystem()
  game.ghostTrails.push({
    x: boss.x,
    y: boss.y,
    isBoss: true,
    bossId: boss.id,
    facingRight: game.player ? game.player.x >= boss.x : true,
    color: boss.phaseIndex >= 1 ? 'rgba(255, 190, 11, 0.55)' : 'rgba(230, 57, 70, 0.55)',
    life: 0.32,
    maxLife: 0.32
  })
}

function spawnHitImpact(x, y, color = '#ffd166', count = 5) {
  if (isHeadless) return
  initVFXSystem()

  // 1. 锐利受击火花向外迸射
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2
    const spd = 70 + Math.random() * 140
    game.particles.push({
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      life: 0.16 + Math.random() * 0.12,
      color: Math.random() < 0.5 ? color : '#ffffff'
    })
  }

  // 2. 扩散热浪灵光冲击环
  game.hitRings.push({
    x,
    y,
    r: 6,
    maxR: 26,
    color,
    life: 0.16,
    maxLife: 0.16
  })
}

function playVFXAnimation(type, x, y, options = {}) {
  if (isHeadless) return null
  initVFXSystem()
  const anim = {
    type,
    x,
    y,
    scale: options.scale || 1,
    rotation: options.rotation || 0,
    color: options.color || '#ffd166',
    secondaryColor: options.secondaryColor || '#ff4d4f',
    life: options.duration || 0.35,
    maxLife: options.duration || 0.35
  }
  game.spriteAnimations.push(anim)
  return anim
}

function updateVFXSystem(dt) {
  if (isHeadless) return
  initVFXSystem()

  // 1. 更新神行残影
  for (let i = game.ghostTrails.length - 1; i >= 0; i--) {
    const g = game.ghostTrails[i]
    g.life -= dt
    if (g.life <= 0) game.ghostTrails.splice(i, 1)
  }

  // 2. 更新受击冲击光环
  for (let i = game.hitRings.length - 1; i >= 0; i--) {
    const r = game.hitRings[i]
    r.life -= dt
    if (r.life <= 0) game.hitRings.splice(i, 1)
  }

  // 3. 更新动态法术动画
  for (let i = game.spriteAnimations.length - 1; i >= 0; i--) {
    const a = game.spriteAnimations[i]
    a.life -= dt
    if (a.life <= 0) game.spriteAnimations.splice(i, 1)
  }

  // 4. 玩家走动 / 疾行灵动残影生成
  if (typeof keys !== 'undefined' && game.player && !game.clearingStage) {
    const isMoving = keys.has('w') || keys.has('s') || keys.has('a') || keys.has('d') ||
                     keys.has('arrowup') || keys.has('arrowdown') || keys.has('arrowleft') || keys.has('arrowright')
    if (isMoving) {
      game.playerGhostTimer = (game.playerGhostTimer || 0) + dt
      const interval = (game.moveSpeed > 230 ? 0.07 : 0.13)
      if (game.playerGhostTimer >= interval) {
        game.playerGhostTimer = 0
        spawnPlayerGhostTrail()
      }
    }
  }

  // 5. Boss 冲锋 / 狂暴神龙残影生成
  if (game.isBossStage && game.boss && !game.boss.defeated) {
    const boss = game.boss
    if (boss.state === 'rushing' || (boss.phaseIndex >= 1 && Math.random() < 0.28)) {
      boss.ghostTimer = (boss.ghostTimer || 0) + dt
      if (boss.ghostTimer >= 0.05) {
        boss.ghostTimer = 0
        spawnBossGhostTrail(boss)
      }
    }
  }
}

function drawGhostTrails(ctx) {
  if (isHeadless || !game.ghostTrails || !game.ghostTrails.length) return
  for (const g of game.ghostTrails) {
    const alpha = Math.max(0, Math.min(1, g.life / g.maxLife)) * 0.4
    ctx.save()
    ctx.translate(g.x, g.y)
    ctx.scale(g.facingRight ? 1 : -1, 1)
    ctx.globalAlpha = alpha

    if (g.isBoss && g.bossId === 'red_dragon' && typeof bossRedDragonLoaded !== 'undefined' && bossRedDragonLoaded && typeof bossRedDragonImg !== 'undefined' && bossRedDragonImg) {
      const sz = 44 * 3.3
      ctx.drawImage(bossRedDragonImg, -sz / 2, -sz / 2, sz, sz)
      ctx.fillStyle = g.color
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillRect(-sz / 2, -sz / 2, sz, sz)
    } else if (g.sheet && g.sheet.loaded && g.sheet.img) {
      const fw = g.sheet.frameW || 180
      const fh = g.sheet.frameH || 180
      const cols = g.sheet.cols || 3
      const fi = g.frameIndex || 0
      const sx = (fi % cols) * fw
      const sy = Math.floor(fi / cols) * fh
      const dw = 72, dh = 72
      ctx.drawImage(g.sheet.img, sx, sy, fw, fh, -dw * 0.5, -dh * 0.82, dw, dh)
      ctx.fillStyle = g.color
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillRect(-dw * 0.5, -dh * 0.82, dw, dh)
    } else if (g.sprite && g.sprite.loaded && g.sprite.img) {
      const sw = g.sprite.w || 64
      const sh = g.sprite.h || 64
      ctx.drawImage(g.sprite.img, -sw * 0.5, -sh * 0.86, sw, sh)
      ctx.fillStyle = g.color
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillRect(-sw * 0.5, -sh * 0.86, sw, sh)
    }
    ctx.restore()
  }
}

function drawHitRings(ctx) {
  if (isHeadless || !game.hitRings || !game.hitRings.length) return
  for (const r of game.hitRings) {
    const p = 1 - r.life / r.maxLife
    const currentR = r.r + (r.maxR - r.r) * p
    const alpha = Math.max(0, 1 - p) * 0.85

    ctx.save()
    ctx.strokeStyle = r.color || '#ffd166'
    ctx.lineWidth = 2 * (1 - p * 0.5)
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.arc(r.x, r.y, currentR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

function drawSpriteAnimations(ctx) {
  if (isHeadless || !game.spriteAnimations || !game.spriteAnimations.length) return
  for (const a of game.spriteAnimations) {
    const p = 1 - a.life / a.maxLife
    ctx.save()
    ctx.translate(a.x, a.y)
    if (a.rotation !== 0) ctx.rotate(a.rotation)
    ctx.scale(a.scale, a.scale)

    if (a.type === 'sword_slash') {
      // 灵剑弧形真气斩
      const slashAngle = -Math.PI * 0.4 + p * Math.PI * 0.8
      ctx.strokeStyle = a.color
      ctx.lineWidth = 3.5 * (1 - p * 0.6)
      ctx.globalAlpha = Math.max(0, 1 - p)
      ctx.beginPath()
      ctx.arc(0, 0, 30 + p * 15, slashAngle - 0.5, slashAngle + 0.5)
      ctx.stroke()
    } else if (a.type === 'fire_burst') {
      // 地火熔岩爆裂
      const currentR = 10 + p * 38
      ctx.globalAlpha = Math.max(0, 1 - p)
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, currentR)
      grad.addColorStop(0, a.secondaryColor || '#ffffff')
      grad.addColorStop(0.5, a.color || '#ffbe0b')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(0, 0, currentR, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

/* ==========================================================================
   问道 · 仙法手柄控制系统 (Xianxia Gamepad Controller System)
   - 支持全类型标准手柄 (Xbox, PlayStation DualSense/DualShock, Nintendo Switch Pro, 通用蓝牙/USB手柄)
   - 360° 无级平滑御风摇杆移动与死区自适应算法
   - 战斗内操作：摇杆/十字键移动、Start 调息暂停、Back/Select 洞察面板
   - 局外全 UI 深度适配 (100% 免鼠标全功能操作)：
     * 标题界面：十字键上下导航、A 键确定进入
     * 角色选择：LB/RB 或左右切换 8 大弟子，LT/RT 或上下/X/Y 切换本命法宝，A 键启程，B 键返回主页
     * 问道图鉴：LB/RB 或左右切换 5 大类别标签，上下键平滑翻滚浏览全部道法条目并展示详情，B 键或选中返回按钮退出
     * 系统设置：上下选择各项参数（音效、音量滑块、震动、飘字、全屏等），左右调节音量增减或开关，A 键操作，B/Start 键保存返回
     * 修行入定 (暂停)：上下切换继续、设置、放弃，A 键确认，B/Start 键继续，Y 键设置，X 键放弃
     * 战利品清点：左右/上下切换「收纳囊中」与「熔炼化气」，A 键确认，Y 键一键保留，X 键一键化气
     * 关卡结算：LB/RB 或左右切换 3 张天道卡片，A/Start 确认进入下一关
     * 飞升弹窗：左右切换「结算归隐」与「开启无尽」，A 键确认，B 归隐，X/Y 无尽
   - 仙灵震动反馈 (Haptic Dual-Rumble Vibration)：受击轻震、领主狂暴重震、飞升天劫共鸣
   - 优雅的仙侠法印 HUD 提示与手柄按键指引图标
   ========================================================================== */

const gamepadState = {
  connected: false,
  padId: '',
  padType: 'xbox', // 'xbox' | 'playstation' | 'nintendo' | 'generic'
  moveX: 0,
  moveY: 0,
  stickMag: 0,
  prevButtons: new Map(),
  axisDebounceTimer: 0,
  titleMenuIndex: 0,
  settingsIndex: 0,
  pauseMenuIndex: 0,
  lootReviewIndex: 0, // 0 = keep, 1 = drop
  settlementLootIndex: 0,
  ascensionChoiceIndex: 0, // 0 = settle, 1 = endless
  codexTabIndex: 0,
  rumbleEnabled: true,
  lastInputTime: 0,
  active: false
}

// 仙灵触感震动反馈
function pulseGamepad(weak = 0.3, strong = 0.4, durationMs = 150) {
  if (!gamepadState.rumbleEnabled || typeof navigator === 'undefined' || !navigator.getGamepads) return
  try {
    const pads = navigator.getGamepads()
    for (const pad of pads) {
      if (pad && pad.vibrationActuator && typeof pad.vibrationActuator.playEffect === 'function') {
        pad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude: Math.min(1, Math.max(0, weak)),
          strongMagnitude: Math.min(1, Math.max(0, strong))
        }).catch(() => {})
      }
    }
  } catch (e) {}
}

function detectPadType(id) {
  const lower = (id || '').toLowerCase()
  if (lower.includes('playstation') || lower.includes('dualshock') || lower.includes('dualsense') || lower.includes('054c')) {
    return 'playstation'
  }
  if (lower.includes('nintendo') || lower.includes('switch') || lower.includes('pro controller') || lower.includes('057e')) {
    return 'nintendo'
  }
  return 'xbox'
}

function updateGamepadUIBadge(connected, padId = '') {
  if (typeof document === 'undefined') return
  const badge = document.querySelector('#hud-gamepad-badge')
  const nameEl = document.querySelector('#hud-gamepad-name')
  const charHints = document.querySelector('#char-gamepad-hints')
  const settleHints = document.querySelector('#settle-gamepad-hint')
  const ascensionHints = document.querySelector('#ascension-gamepad-hint')
  const codexHints = document.querySelector('#codex-gamepad-hints')
  const settingsHints = document.querySelector('#settings-gamepad-hints')
  const pauseHints = document.querySelector('#pause-gamepad-hints')
  const lootHints = document.querySelector('#loot-gamepad-hints')

  const hintEls = [charHints, settleHints, ascensionHints, codexHints, settingsHints, pauseHints, lootHints].filter(Boolean)

  if (connected) {
    if (badge) {
      badge.classList.remove('hidden')
      const shortName = padId.includes('Xbox') ? 'Xbox 手柄' :
                        padId.includes('Dual') ? 'PS 手柄' :
                        padId.includes('Nintendo') ? 'Switch 手柄' : '法印手柄'
      if (nameEl) nameEl.textContent = `${shortName} 已就绪`
    }
    hintEls.forEach(el => el.classList.remove('hidden'))
  } else {
    if (badge) badge.classList.add('hidden')
    hintEls.forEach(el => el.classList.add('hidden'))
  }
}

// 轮询手柄输入（每帧由主循环 frame(now) 驱动）
function pollGamepad(dt = 0.016) {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return
  const pads = navigator.getGamepads()
  let activePad = null
  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected) {
      activePad = pads[i]
      break
    }
  }

  if (!activePad) {
    if (gamepadState.connected) {
      gamepadState.connected = false
      gamepadState.moveX = 0
      gamepadState.moveY = 0
      gamepadState.stickMag = 0
      updateGamepadUIBadge(false)
    }
    return
  }

  if (!gamepadState.connected) {
    gamepadState.connected = true
    gamepadState.padId = activePad.id || '标准法印手柄'
    gamepadState.padType = detectPadType(activePad.id)
    updateGamepadUIBadge(true, activePad.id)
  }

  // 1. 读取摇杆与十字键位移
  let rawX = activePad.axes[0] || 0
  let rawY = activePad.axes[1] || 0

  // 十字键融入位移 (D-Pad: 12=Up, 13=Down, 14=Left, 15=Right)
  if (activePad.buttons[14] && activePad.buttons[14].pressed) rawX -= 1
  if (activePad.buttons[15] && activePad.buttons[15].pressed) rawX += 1
  if (activePad.buttons[12] && activePad.buttons[12].pressed) rawY -= 1
  if (activePad.buttons[13] && activePad.buttons[13].pressed) rawY += 1

  const mag = Math.hypot(rawX, rawY)
  const deadzone = 0.18
  if (mag < deadzone) {
    gamepadState.moveX = 0
    gamepadState.moveY = 0
    gamepadState.stickMag = 0
  } else {
    const normalizedMag = Math.min(1.0, (mag - deadzone) / (1.0 - deadzone))
    gamepadState.moveX = (rawX / mag) * normalizedMag
    gamepadState.moveY = (rawY / mag) * normalizedMag
    gamepadState.stickMag = normalizedMag
    gamepadState.active = true
  }

  // 2. 按键边缘检测 (Just Pressed)
  const isDown = (idx) => !!(activePad.buttons[idx] && activePad.buttons[idx].pressed)
  const justPressed = (idx) => {
    const pressed = isDown(idx)
    const prev = gamepadState.prevButtons.get(idx) || false
    return pressed && !prev
  }

  // 方向重复延迟机制 (用于菜单防连滚)
  if (gamepadState.axisDebounceTimer > 0) {
    gamepadState.axisDebounceTimer -= dt
  }

  let navLeft = justPressed(14) || ((activePad.axes[0] < -0.55) && gamepadState.axisDebounceTimer <= 0)
  let navRight = justPressed(15) || ((activePad.axes[0] > 0.55) && gamepadState.axisDebounceTimer <= 0)
  let navUp = justPressed(12) || ((activePad.axes[1] < -0.55) && gamepadState.axisDebounceTimer <= 0)
  let navDown = justPressed(13) || ((activePad.axes[1] > 0.55) && gamepadState.axisDebounceTimer <= 0)

  if (navLeft || navRight || navUp || navDown) {
    gamepadState.axisDebounceTimer = 0.22 // 220ms 防抖
    gamepadState.active = true
  }

  // 3. UI 界面手柄映射与导航分发
  dispatchGamepadUIEvents(activePad, justPressed, navLeft, navRight, navUp, navDown)

  // 4. 更新上一帧按键状态
  for (let b = 0; b < activePad.buttons.length; b++) {
    gamepadState.prevButtons.set(b, isDown(b))
  }
}

// UI 与全界面按键分发
function dispatchGamepadUIEvents(pad, justPressed, navLeft, navRight, navUp, navDown) {
  const btnA = justPressed(0)
  const btnB = justPressed(1)
  const btnX = justPressed(2)
  const btnY = justPressed(3)
  const btnLB = justPressed(4)
  const btnRB = justPressed(5)
  const btnLT = justPressed(6)
  const btnRT = justPressed(7)
  const btnSelect = justPressed(8)
  const btnStart = justPressed(9)

  // ==========================================
  // 1. 终极通关飞升大圆满弹窗 (#modal-ascension)
  // ==========================================
  const modalAscension = document.querySelector('#modal-ascension')
  if (modalAscension && !modalAscension.classList.contains('hidden')) {
    if (navLeft || navRight || btnLB || btnRB) {
      gamepadState.ascensionChoiceIndex = 1 - gamepadState.ascensionChoiceIndex
      if (typeof sound !== 'undefined' && sound.click) sound.click()
      highlightAscensionButtons(gamepadState.ascensionChoiceIndex)
    }
    if (btnA || btnStart) {
      if (gamepadState.ascensionChoiceIndex === 0) {
        const btnSettle = document.querySelector('#btn-ascend-settle')
        if (btnSettle) btnSettle.click()
      } else {
        const btnEndless = document.querySelector('#btn-ascend-endless')
        if (btnEndless) btnEndless.click()
      }
    }
    if (btnB) {
      const btnSettle = document.querySelector('#btn-ascend-settle')
      if (btnSettle) btnSettle.click()
    }
    if (btnX || btnY) {
      const btnEndless = document.querySelector('#btn-ascend-endless')
      if (btnEndless) btnEndless.click()
    }
    return
  }

  // ==========================================
  // 2. 逐件清点战利品模态窗口 (#modal-loot-review)
  // ==========================================
  const modalLootReview = document.querySelector('#modal-loot-review')
  if (modalLootReview && !modalLootReview.classList.contains('hidden')) {
    const btnKeep = document.querySelector('#btn-loot-keep')
    const btnDrop = document.querySelector('#btn-loot-drop')

    // 默认高亮首项
    if (btnKeep && !btnKeep.classList.contains('gamepad-focused') && btnDrop && !btnDrop.classList.contains('gamepad-focused')) {
      highlightLootReview(gamepadState.lootReviewIndex)
    }

    if (navLeft || btnLB) {
      gamepadState.lootReviewIndex = 0
      highlightLootReview(0)
      if (typeof sound !== 'undefined' && sound.click) sound.click()
    } else if (navRight || btnRB) {
      gamepadState.lootReviewIndex = 1
      highlightLootReview(1)
      if (typeof sound !== 'undefined' && sound.click) sound.click()
    } else if (navUp || navDown) {
      gamepadState.lootReviewIndex = 1 - gamepadState.lootReviewIndex
      highlightLootReview(gamepadState.lootReviewIndex)
      if (typeof sound !== 'undefined' && sound.click) sound.click()
    }

    // A 键确认当前选项
    if (btnA) {
      if (gamepadState.lootReviewIndex === 0 && btnKeep) {
        btnKeep.click()
      } else if (btnDrop) {
        btnDrop.click()
      }
    }

    // 快捷键支持：Y 键直接保留，X/B 键直接熔炼
    if (btnY || btnRT) {
      if (btnKeep) btnKeep.click()
    } else if (btnX || btnB || btnLT) {
      if (btnDrop) btnDrop.click()
    }
    return
  }

  // ==========================================
  // 3. 系统设置界面 (#modal-settings)
  // ==========================================
  const modalSettings = document.querySelector('#modal-settings')
  if (modalSettings && !modalSettings.classList.contains('hidden')) {
    const settingsSelectors = [
      '#sound-toggle',
      '#volume-slider',
      '#btn-test-sound',
      '#btn-toggle-rumble',
      '#btn-toggle-float-num',
      '#btn-toggle-fullscreen',
      '#btn-settings-save'
    ]

    // 初始高亮检测
    const hasFocus = settingsSelectors.some(sel => {
      const el = document.querySelector(sel)
      return el && el.classList.contains('gamepad-focused')
    })
    if (!hasFocus) {
      highlightSettingsItem(settingsSelectors, gamepadState.settingsIndex)
    }

    // 上下切换设置项
    if (navUp) {
      gamepadState.settingsIndex = (gamepadState.settingsIndex - 1 + settingsSelectors.length) % settingsSelectors.length
      highlightSettingsItem(settingsSelectors, gamepadState.settingsIndex)
      if (typeof sound !== 'undefined' && sound.click) sound.click()
    } else if (navDown) {
      gamepadState.settingsIndex = (gamepadState.settingsIndex + 1) % settingsSelectors.length
      highlightSettingsItem(settingsSelectors, gamepadState.settingsIndex)
      if (typeof sound !== 'undefined' && sound.click) sound.click()
    }

    const curSel = settingsSelectors[gamepadState.settingsIndex]
    const curEl = document.querySelector(curSel)

    // 左右调节
    if (curSel === '#volume-slider' && curEl) {
      if (navLeft) {
        const curVal = Number(curEl.value) || 0
        const nextVal = Math.max(0, curVal - 5)
        curEl.value = nextVal
        const evtInput = new Event('input', { bubbles: true })
        try { Object.defineProperty(evtInput, 'target', { value: curEl }) } catch (e) { evtInput.target = curEl }
        curEl.dispatchEvent(evtInput)
        const evtChange = new Event('change', { bubbles: true })
        try { Object.defineProperty(evtChange, 'target', { value: curEl }) } catch (e) { evtChange.target = curEl }
        curEl.dispatchEvent(evtChange)
      } else if (navRight) {
        const curVal = Number(curEl.value) || 0
        const nextVal = Math.min(150, curVal + 5)
        curEl.value = nextVal
        const evtInput = new Event('input', { bubbles: true })
        try { Object.defineProperty(evtInput, 'target', { value: curEl }) } catch (e) { evtInput.target = curEl }
        curEl.dispatchEvent(evtInput)
        const evtChange = new Event('change', { bubbles: true })
        try { Object.defineProperty(evtChange, 'target', { value: curEl }) } catch (e) { evtChange.target = curEl }
        curEl.dispatchEvent(evtChange)
      }
    } else if (navLeft || navRight) {
      // 对开关类按钮，按左右也可触发切换
      if (curSel === '#sound-toggle' || curSel === '#btn-toggle-rumble' || curSel === '#btn-toggle-float-num' || curSel === '#btn-toggle-fullscreen') {
        if (curEl) curEl.click()
      }
    }

    // A 键确认或触发
    if (btnA && curEl) {
      curEl.click()
    }

    // B 键 / Start 键：保存并返回
    if (btnB || btnStart) {
      const saveBtn = document.querySelector('#btn-settings-save') || document.querySelector('#btn-settings-close')
      if (saveBtn) saveBtn.click()
    }
    return
  }

  // ==========================================
  // 4. 暂停与洞察面板 (#modal-pause)
  // ==========================================
  const modalPause = document.querySelector('#modal-pause')
  if (modalPause && !modalPause.classList.contains('hidden')) {
    const pauseSelectors = [
      '#btn-pause-resume',
      '#btn-pause-settings',
      '#btn-pause-abandon'
    ]

    const hasFocus = pauseSelectors.some(sel => {
      const el = document.querySelector(sel)
      return el && el.classList.contains('gamepad-focused')
    })
    if (!hasFocus) {
      highlightPauseItem(pauseSelectors, gamepadState.pauseMenuIndex)
    }

    if (navUp) {
      gamepadState.pauseMenuIndex = (gamepadState.pauseMenuIndex - 1 + pauseSelectors.length) % pauseSelectors.length
      highlightPauseItem(pauseSelectors, gamepadState.pauseMenuIndex)
      if (typeof sound !== 'undefined' && sound.click) sound.click()
    } else if (navDown) {
      gamepadState.pauseMenuIndex = (gamepadState.pauseMenuIndex + 1) % pauseSelectors.length
      highlightPauseItem(pauseSelectors, gamepadState.pauseMenuIndex)
      if (typeof sound !== 'undefined' && sound.click) sound.click()
    }

    // A 键触发当前高亮选项
    if (btnA) {
      const targetBtn = document.querySelector(pauseSelectors[gamepadState.pauseMenuIndex])
      if (targetBtn) targetBtn.click()
    }

    // B 键 / Start 键 直接恢复游戏
    if (btnB || btnStart) {
      const resumeBtn = document.querySelector('#btn-pause-resume')
      if (resumeBtn) resumeBtn.click()
    } else if (btnY) {
      // Y 键快捷进入系统设置
      const settingsBtn = document.querySelector('#btn-pause-settings')
      if (settingsBtn) settingsBtn.click()
    } else if (btnX) {
      // X 键快捷放弃重修
      const abandonBtn = document.querySelector('#btn-pause-abandon')
      if (abandonBtn) abandonBtn.click()
    }
    return
  }

  // ==========================================
  // 5. 关卡天道结算与死亡界面 (#stage-overlay)
  // ==========================================
  const overlay = typeof ui !== 'undefined' && ui.overlay ? ui.overlay : document.querySelector('#stage-overlay')
  if (overlay && !overlay.classList.contains('hidden')) {
    // 死亡画面
    if (typeof game !== 'undefined' && game.gameOver) {
      if (btnA || btnStart || btnB) {
        if (typeof ui !== 'undefined' && ui.stageContinue) ui.stageContinue.click()
      }
      return
    }

    // 正常关卡结算 (game.settlement)
    if (typeof game !== 'undefined' && game.settlement) {
      // 左右切换天道卡片
      if (navLeft || btnLB) {
        cycleSettlementCard(-1)
      } else if (navRight || btnRB) {
        cycleSettlementCard(1)
      }

      // X 键：全部放弃转化为灵气 (老式 DOM 桥接)
      if (btnX) {
        const btnLootAll = document.querySelector('#stage-loot-all')
        if (btnLootAll) btnLootAll.click()
      }

      // Y 键：切换首个或选中掉落物品的保留状态
      if (btnY && game.settlement.loot && game.settlement.loot.length) {
        const itemIdx = gamepadState.settlementLootIndex % game.settlement.loot.length
        if (game.settlement.loot[itemIdx]) {
          game.settlement.loot[itemIdx].keep = !game.settlement.loot[itemIdx].keep
          if (typeof sound !== 'undefined' && sound.click) sound.click()
          if (typeof renderSettlement === 'function') renderSettlement()
        }
      }

      // 向上向下移动光标
      if ((navUp || navDown) && game.settlement.loot && game.settlement.loot.length) {
        const dir = navDown ? 1 : -1
        gamepadState.settlementLootIndex = (gamepadState.settlementLootIndex + dir + game.settlement.loot.length) % game.settlement.loot.length
        highlightSettlementLoot(gamepadState.settlementLootIndex)
      }

      // A 键或 Start 键：选择卡片或进入下一关
      if (btnA || btnStart) {
        if (game.settlement.chosen === null || game.settlement.chosen === undefined) {
          game.settlement.chosen = 0
          if (typeof sound !== 'undefined' && sound.click) sound.click()
          if (typeof renderSettlement === 'function') renderSettlement()
        } else {
          const continueBtn = document.querySelector('#stage-continue')
          if (continueBtn && !continueBtn.disabled) {
            continueBtn.click()
          }
        }
      }
      return
    }
  }

  // ==========================================
  // 6. 主菜单标题界面 ('title')
  // ==========================================
  if (typeof game !== 'undefined' && game.screen === 'title') {
    const titleBtns = [
      document.querySelector('#btn-title-start'),
      document.querySelector('#btn-title-codex'),
      document.querySelector('#btn-title-settings')
    ].filter(Boolean)

    if (titleBtns.length) {
      if (navUp) {
        gamepadState.titleMenuIndex = (gamepadState.titleMenuIndex - 1 + titleBtns.length) % titleBtns.length
        focusTitleButton(titleBtns, gamepadState.titleMenuIndex)
      } else if (navDown) {
        gamepadState.titleMenuIndex = (gamepadState.titleMenuIndex + 1) % titleBtns.length
        focusTitleButton(titleBtns, gamepadState.titleMenuIndex)
      }

      if (btnA || btnStart) {
        const targetBtn = titleBtns[gamepadState.titleMenuIndex] || titleBtns[0]
        if (targetBtn) targetBtn.click()
      }
    }
    return
  }

  // ==========================================
  // 7. 角色与武器选择界面 ('char' / 'char-select')
  // ==========================================
  if (typeof game !== 'undefined' && (game.screen === 'char' || game.screen === 'char-select')) {
    if (typeof characters !== 'undefined' && characters.length) {
      const step = typeof charSelectStep !== 'undefined' ? charSelectStep : 1

      if (step === 1) {
        // Step 1: 择定道号 (左右或 LB/RB 切换 8 大弟子)
        if (navLeft || btnLB) {
          if (typeof selectedCharIndex !== 'undefined') {
            selectedCharIndex = (selectedCharIndex - 1 + characters.length) % characters.length
            selectedWeaponIndex = 0
            if (typeof sound !== 'undefined' && sound.click) sound.click()
            if (typeof renderCharSelect === 'function') renderCharSelect()
          }
        } else if (navRight || btnRB) {
          if (typeof selectedCharIndex !== 'undefined') {
            selectedCharIndex = (selectedCharIndex + 1) % characters.length
            selectedWeaponIndex = 0
            if (typeof sound !== 'undefined' && sound.click) sound.click()
            if (typeof renderCharSelect === 'function') renderCharSelect()
          }
        }

        // 上下或 LT/RT 切换当前角色的起手本命法宝索引 (保持测试与快捷操作兼容性)
        if (navUp) {
          const curChar = characters[selectedCharIndex]
          if (curChar && curChar.weapons && curChar.weapons.length > 1) {
            selectedWeaponIndex = (selectedWeaponIndex - 1 + curChar.weapons.length) % curChar.weapons.length
            if (typeof sound !== 'undefined' && sound.click) sound.click()
            if (typeof renderCharSelect === 'function') renderCharSelect()
          }
        } else if (navDown || btnLT || btnRT || btnX || btnY) {
          const curChar = characters[selectedCharIndex]
          if (curChar && curChar.weapons && curChar.weapons.length > 1) {
            selectedWeaponIndex = (selectedWeaponIndex + 1) % curChar.weapons.length
            if (typeof sound !== 'undefined' && sound.click) sound.click()
            if (typeof renderCharSelect === 'function') renderCharSelect()
          }
        }

        // A 键 / Start 键：择定当前道号，进入二级界面选择武器
        if (btnA || btnStart) {
          const btnStep1 = document.querySelector('#btn-step1-confirm')
          if (btnStep1) {
            btnStep1.click()
          } else {
            const btnConfirm = document.querySelector('#btn-char-confirm')
            if (btnConfirm) btnConfirm.click()
          }
        }

        // B 键：返回主页
        if (btnB) {
          const btnBack = document.querySelector('#btn-char-back')
          if (btnBack) btnBack.click()
        }
      } else {
        // Step 2: 二级界面 · 挑选本命法宝 (上下/左右/LT/RT 切换 3 大起手神兵)
        if (navLeft || navUp || btnLB || btnLT) {
          const curChar = characters[selectedCharIndex]
          if (curChar && curChar.weapons && curChar.weapons.length > 1) {
            selectedWeaponIndex = (selectedWeaponIndex - 1 + curChar.weapons.length) % curChar.weapons.length
            if (typeof sound !== 'undefined' && sound.click) sound.click()
            if (typeof renderCharSelect === 'function') renderCharSelect()
          }
        } else if (navRight || navDown || btnRB || btnRT || btnX || btnY) {
          const curChar = characters[selectedCharIndex]
          if (curChar && curChar.weapons && curChar.weapons.length > 1) {
            selectedWeaponIndex = (selectedWeaponIndex + 1) % curChar.weapons.length
            if (typeof sound !== 'undefined' && sound.click) sound.click()
            if (typeof renderCharSelect === 'function') renderCharSelect()
          }
        }

        // A 键 / Start 键：确认本命神兵，踏入秘境进入战斗
        if (btnA || btnStart) {
          const btnConfirmStep2 = document.querySelector('#btn-char-confirm-step2') || document.querySelector('#btn-char-confirm')
          if (btnConfirmStep2) btnConfirmStep2.click()
        }

        // B 键：返回 Step 1 重选道号
        if (btnB) {
          const btnWeaponBack = document.querySelector('#btn-weapon-back')
          if (btnWeaponBack) {
            btnWeaponBack.click()
          } else {
            const btnBack = document.querySelector('#btn-char-back')
            if (btnBack) btnBack.click()
          }
        }
      }
    }
    return
  }

  // ==========================================
  // 8. 问道图鉴界面 ('codex')
  // ==========================================
  if (typeof game !== 'undefined' && game.screen === 'codex') {
    const backBtn = document.querySelector('#btn-codex-back') || document.querySelector('#btn-codex-close')

    // LB / RB 左右切换分类
    if (btnLB) {
      if (backBtn) backBtn.classList.remove('gamepad-focused')
      cycleCodexTab(-1)
    } else if (btnRB) {
      if (backBtn) backBtn.classList.remove('gamepad-focused')
      cycleCodexTab(1)
    } else if (navLeft) {
      if (backBtn && !backBtn.classList.contains('gamepad-focused')) {
        cycleCodexTab(-1)
      }
    } else if (navRight) {
      if (backBtn && !backBtn.classList.contains('gamepad-focused')) {
        cycleCodexTab(1)
      }
    }

    // 上下键滚动与条目选定
    if (navUp) {
      navigateCodex(-1)
    } else if (navDown) {
      navigateCodex(1)
    }

    // A 键：若当前停在「返回主页」按钮上，则返回主页；否则触发当前卡片
    if (btnA) {
      if (backBtn && backBtn.classList.contains('gamepad-focused')) {
        backBtn.click()
      } else {
        const activeCard = document.querySelector('#codex-grid .codex-item-card.active')
        if (activeCard) activeCard.click()
      }
    }

    // B 键 / Start 键 / Select 键 立即返回主页
    if (btnB || btnStart || btnSelect) {
      if (backBtn) backBtn.click()
    }
    return
  }

  // ==========================================
  // 9. 局内战斗控制 ('game')
  // ==========================================
  if (typeof game !== 'undefined' && game.screen === 'game') {
    if (btnStart || btnSelect) {
      if (typeof togglePause === 'function') togglePause()
    }
  }
}

// 辅助：结算卡片切换
function cycleSettlementCard(dir) {
  if (typeof game === 'undefined' || !game.settlement || !game.settlement.cards || !game.settlement.cards.length) return
  const count = game.settlement.cards.length
  let cur = (game.settlement.chosen === null || game.settlement.chosen === undefined) ? 0 : game.settlement.chosen
  cur = (cur + dir + count) % count
  game.settlement.chosen = cur
  if (typeof sound !== 'undefined' && sound.click) sound.click()
  if (typeof renderSettlement === 'function') renderSettlement()
}

// 辅助：高亮结算面板中的掉落项
function highlightSettlementLoot(index) {
  const lootBtns = document.querySelectorAll('#stage-loot button[data-loot]')
  lootBtns.forEach((btn, i) => {
    if (i === index) btn.classList.add('gamepad-focused')
    else btn.classList.remove('gamepad-focused')
  })
}

// 辅助：高亮战利品清点选项按钮
function highlightLootReview(index) {
  const btnKeep = document.querySelector('#btn-loot-keep')
  const btnDrop = document.querySelector('#btn-loot-drop')
  if (btnKeep) {
    if (index === 0) {
      btnKeep.classList.add('gamepad-focused')
      btnKeep.focus?.()
    } else {
      btnKeep.classList.remove('gamepad-focused')
    }
  }
  if (btnDrop) {
    if (index === 1) {
      btnDrop.classList.add('gamepad-focused')
      btnDrop.focus?.()
    } else {
      btnDrop.classList.remove('gamepad-focused')
    }
  }
}

// 辅助：高亮飞升弹窗按钮
function highlightAscensionButtons(index) {
  const btnSettle = document.querySelector('#btn-ascend-settle')
  const btnEndless = document.querySelector('#btn-ascend-endless')
  if (btnSettle) {
    if (index === 0) btnSettle.classList.add('gamepad-focused')
    else btnSettle.classList.remove('gamepad-focused')
  }
  if (btnEndless) {
    if (index === 1) btnEndless.classList.add('gamepad-focused')
    else btnEndless.classList.remove('gamepad-focused')
  }
}

// 辅助：高亮设置模态窗口项
function highlightSettingsItem(selectors, index) {
  selectors.forEach((sel, i) => {
    const el = document.querySelector(sel)
    if (!el) return
    if (i === index) {
      el.classList.add('gamepad-focused')
      if (typeof el.focus === 'function') el.focus()
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    } else {
      el.classList.remove('gamepad-focused')
    }
  })
}

// 辅助：高亮暂停面板操作按钮
function highlightPauseItem(selectors, index) {
  selectors.forEach((sel, i) => {
    const el = document.querySelector(sel)
    if (!el) return
    if (i === index) {
      el.classList.add('gamepad-focused')
      if (typeof el.focus === 'function') el.focus()
    } else {
      el.classList.remove('gamepad-focused')
    }
  })
}

// 辅助：高亮标题按钮
function focusTitleButton(btns, index) {
  btns.forEach((b, i) => {
    if (i === index) {
      b.classList.add('gamepad-focused')
      b.focus()
    } else {
      b.classList.remove('gamepad-focused')
    }
  })
  if (typeof sound !== 'undefined' && sound.click) sound.click()
}

// 辅助：滚动角色卡片进入可视区
function scrollCharCardIntoView(index) {
  const card = document.querySelector(`.char-card[data-char="${index}"]`)
  if (card && typeof card.scrollIntoView === 'function') {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

// 辅助：图鉴条目上下导航与滚动
function navigateCodex(dir) {
  const cards = Array.from(document.querySelectorAll('#codex-grid .codex-item-card'))
  const backBtn = document.querySelector('#btn-codex-back') || document.querySelector('#btn-codex-close')

  if (!cards.length) {
    if (backBtn) backBtn.classList.add('gamepad-focused')
    return
  }

  let activeIdx = cards.findIndex(c => c.classList.contains('active'))
  if (activeIdx < 0) activeIdx = 0

  if (backBtn && backBtn.classList.contains('gamepad-focused')) {
    if (dir > 0) {
      // 从返回按钮向下移入第一张卡片
      backBtn.classList.remove('gamepad-focused')
      cards[0].click()
      cards[0].classList.add('gamepad-focused')
      cards[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    return
  }

  if (dir < 0) {
    // 向上导航
    if (activeIdx <= 0) {
      // 已在最顶部卡片，再往上聚焦到「返回主页」按钮
      if (backBtn) {
        cards.forEach(c => c.classList.remove('gamepad-focused'))
        backBtn.classList.add('gamepad-focused')
        backBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        if (typeof sound !== 'undefined' && sound.click) sound.click()
      }
    } else {
      const prevCard = cards[activeIdx - 1]
      if (prevCard) {
        if (backBtn) backBtn.classList.remove('gamepad-focused')
        cards.forEach(c => c.classList.remove('gamepad-focused'))
        prevCard.click()
        prevCard.classList.add('gamepad-focused')
        prevCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  } else if (dir > 0) {
    // 向下导航
    if (backBtn) backBtn.classList.remove('gamepad-focused')
    const nextIdx = Math.min(cards.length - 1, activeIdx + 1)
    const nextCard = cards[nextIdx]
    if (nextCard) {
      cards.forEach(c => c.classList.remove('gamepad-focused'))
      nextCard.click()
      nextCard.classList.add('gamepad-focused')
      nextCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }
}

// 辅助：切换图鉴标签
function cycleCodexTab(dir) {
  const tabs = Array.from(document.querySelectorAll('.codex-tab'))
  if (!tabs.length) return
  const curIdx = tabs.findIndex(t => t.classList.contains('active'))
  const nextIdx = (curIdx + dir + tabs.length) % tabs.length
  tabs[nextIdx].click()
  // 切换标签后自动聚焦新分类的首张卡片
  setTimeout(() => {
    const firstCard = document.querySelector('#codex-grid .codex-item-card')
    if (firstCard) {
      firstCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, 30)
}

// 监听系统事件
if (typeof window !== 'undefined') {
  window.addEventListener('gamepadconnected', (e) => {
    gamepadState.connected = true
    gamepadState.padId = (e.gamepad && e.gamepad.id) || '标准法印手柄'
    gamepadState.padType = detectPadType(gamepadState.padId)
    gamepadState.active = true
    updateGamepadUIBadge(true, gamepadState.padId)
    if (typeof addLog === 'function') {
      addLog(`【仙灵通玄】感应到法印手柄连接：${gamepadState.padId.slice(0, 24)}...`, true)
    }
    pulseGamepad(0.2, 0.4, 200)
  })

  window.addEventListener('gamepaddisconnected', () => {
    gamepadState.connected = false
    gamepadState.active = false
    gamepadState.moveX = 0
    gamepadState.moveY = 0
    gamepadState.stickMag = 0
    updateGamepadUIBadge(false)
    if (typeof addLog === 'function') {
      addLog('【仙灵隐现】法印手柄连接已断开', true)
    }
  })
}


const realmNames = ['炼气', '筑基', '结丹', '元婴', '化神']
const subStageNames = ['初期', '中期', '后期']
const STAGE_SECONDS = 60
const BASE_HP = 100          // 炼气基础生命；每次大境界进阶翻倍
const FIRST_QI_COST = 100    // 炼气初期所需灵气；每个小阶段翻倍
const TELEGRAPH = .85        // 敌人现身前的特效提示时长（秒）
const SAFE_SPAWN = 110       // 现身瞬间与玩家保持的最小距离，避免贴脸生成
const SPAWN_MIN = 170        // 预兆出现位置与玩家的距离下限
const SPAWN_MAX = 440        // 预兆出现位置与玩家的距离上限（避免从地图另一头长途走来）
const keys = new Set()
const rand = (min, max) => Math.random() * (max - min) + min
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const shuffled = (list) => [...list].sort(() => Math.random() - .5)

const game = {
  last: performance.now(), elapsed: 0, paused: false, gameOver: false,
  stage: 1, stageTime: STAGE_SECONDS, stageElapsed: 0, stageKills: 0, stageItemDrops: 0, stageTargetDrops: 2, lastItemDropKill: -10, bossesDefeated: 0,
  spawnTimer: 0, shotTimer: 0, petTimer: 0, thunderTimer: 0, formationTimer: 0, fireTimer: 0,
  xp: 0, xpNeed: FIRST_QI_COST, kills: 0, realm: 0, subStage: 0,
  hp: BASE_HP, baseHp: BASE_HP, bonusHp: 0, maxHp: BASE_HP, attack: 18, attackSpeed: 1, moveSpeed: 220, pickup: 86,
  petDamage: 42, firePower: 1, formationPower: 1, thunderDamage: 0, flash: 0,
  weapons: [{ id: 'sword', name: '流云飞剑', icon: '✧', image: './weapon_sword.png', type: '法宝', detail: '追踪飞剑 · 伤害 18', count: 1 }],
  passives: [], formations: [], pets: [], treasures: [],
  enemies: [], projectiles: [], drops: [], particles: [], zaps: [], markers: [], lootBag: [],
  player: { x: 480, y: 270, r: 13, invuln: 0, attackTimer: 0, attackAngle: 0, charId: 'sword', weaponType: 'sword', charName: '凌虚子' },
  baseAttackRange: 140, bonusAttackRange: 0, attackRange: 140, specialAttacks: [],
  cameraShake: 0, _lastShakeTime: 0, hammerRadiusBonus: 0, dingRadiusBonus: 0, dragonRangeBonus: 0, daggerRangeBonus: 0, baozhuRadiusBonus: 0, baguaRadiusBonus: 0, fuchenRangeBonus: 0, thunderChainBonus: 0,
  chainArcLevel: 0, chainArcN: null, chainArcs: [], chainArcCooldown: 0, _currentAttackIsPrimary: false,
  blazingFireLevel: 0, blazingBursts: [], blazingMotes: [], blazingEmberParticles: [], pendingDetonations: [], _isDetonating: false,
  offensiveSlots: [null, null, null, null],
  settlement: null, logs: []
}

// ==========================================
// 进攻法宝与灵宠 4 槽位系统 (Offensive Weapon & Companion Slot System)
// ==========================================

const OFFENSIVE_ITEM_IDS = ['fire', 'pet', 'formation', 'thunder']

function isOffensiveItem(id) {
  return OFFENSIVE_ITEM_IDS.includes(id)
}

function getOffensiveSlotIndex(id) {
  if (!game.offensiveSlots) return -1
  return game.offensiveSlots.findIndex(slot => slot && slot.id === id)
}

function getAvailableOffensiveSlotIndex() {
  if (!game.offensiveSlots) return -1
  return game.offensiveSlots.findIndex(slot => slot === null)
}

function getOccupiedOffensiveSlotCount() {
  if (!game.offensiveSlots) return 0
  return game.offensiveSlots.filter(slot => slot !== null).length
}

const OFFENSIVE_ITEM_DEFS = {
  fire: {
    id: 'fire',
    name: '赤炎葫芦',
    type: '法宝',
    icon: '◈',
    image: './skill_gourd.png',
    getDetail: (lvl, g) => `灼热火线 · 威力 ${Math.round((g.firePower || 1) * 100)}% · 每 2.2 秒`,
    onEquip: (g) => {
      g.firePower = 1
      g.attack += 5
      if (!g.weapons.some(x => x.id === 'fire')) {
        g.weapons.push({ id: 'fire', name: '赤炎葫芦', icon: '◈', image: './skill_gourd.png', type: '法宝', detail: '灼热火线 · 每 2.2 秒', count: 1 })
      }
    },
    onUpgrade: (g, lvl) => {
      g.firePower = (g.firePower || 1) + 0.4
      const w = g.weapons.find(x => x.id === 'fire')
      if (w) {
        w.count = lvl
        w.detail = `灼热火线 · 威力 ${Math.round(g.firePower * 100)}%`
      }
    },
    onRemove: (g) => {
      g.weapons = g.weapons.filter(x => x.id !== 'fire')
      g.firePower = 1
      g.attack = Math.max(10, g.attack - 5)
    }
  },
  pet: {
    id: 'pet',
    name: '青羽灵狐',
    type: '灵兽',
    icon: '♢',
    image: './skill_fox.png',
    getDetail: (lvl, g) => `扑击伤害 ${g.petDamage || 42} · 每 4 秒`,
    onEquip: (g) => {
      g.petDamage = 42
      g.pets = [{ id: 'pet', name: '青羽灵狐', icon: '♢', image: './skill_fox.png', type: '灵兽', detail: '周期扑击 · 范围伤害', count: 1 }]
      if (typeof initPetFox === 'function') initPetFox()
    },
    onUpgrade: (g, lvl) => {
      g.petDamage = (g.petDamage || 42) + 26
      if (g.pets && g.pets[0]) {
        g.pets[0].count = lvl
        g.pets[0].detail = `扑击伤害 ${g.petDamage}`
      }
    },
    onRemove: (g) => {
      g.pets = []
      g.petFox = null
      g.petDamage = 42
    }
  },
  formation: {
    id: 'formation',
    name: '回风阵',
    type: '阵法',
    icon: '⌘',
    image: null,
    getDetail: (lvl, g) => `护体罡风 · 威力 ${Math.round((g.formationPower || 1) * 100)}%`,
    onEquip: (g) => {
      g.formationPower = 1
      g.formations = [{ id: 'formation', name: '回风阵', icon: '⌘', type: '阵法', detail: '周期性击退敌群', count: 1 }]
    },
    onUpgrade: (g, lvl) => {
      g.formationPower = (g.formationPower || 1) + 0.5
      if (g.formations && g.formations[0]) {
        g.formations[0].count = lvl
        g.formations[0].detail = `阵法威力 ${Math.round(g.formationPower * 100)}%`
      }
    },
    onRemove: (g) => {
      g.formations = []
      g.formationPower = 1
    }
  },
  thunder: {
    id: 'thunder',
    name: '昊天雷符',
    type: '符箓',
    icon: '⚡',
    image: './skill_chain_lightning.png',
    getDetail: (lvl, g) => `天雷轰顶 · 伤害 ${g.thunderDamage || 40} · 每 3 秒`,
    onEquip: (g) => {
      g.thunderDamage = 40
      if (!g.treasures.some(x => x.id === 'thunder')) {
        g.treasures.push({ id: 'thunder', name: '昊天雷符', icon: '⚡', type: '符箓', detail: '每 3 秒引落天雷轰击', count: 1 })
      }
    },
    onUpgrade: (g, lvl) => {
      g.thunderDamage = (g.thunderDamage || 40) + 20
      const t = g.treasures.find(x => x.id === 'thunder')
      if (t) {
        t.count = lvl
        t.detail = `天雷轰顶 · 伤害 ${g.thunderDamage}`
      }
    },
    onRemove: (g) => {
      g.thunderDamage = 0
      g.treasures = g.treasures.filter(x => x.id !== 'thunder')
    }
  }
}

function equipOrUpgradeOffensiveItem(id) {
  if (!game.offensiveSlots) game.offensiveSlots = [null, null, null, null]
  const def = OFFENSIVE_ITEM_DEFS[id]
  if (!def) return { success: false, reason: 'unknown_item' }

  const dirNames = ['上', '右', '下', '左']

  // 1. 检查是否已拥有同种进攻法宝/灵宠 -> 对应槽位直接升一级！
  const existingIdx = getOffensiveSlotIndex(id)
  if (existingIdx !== -1) {
    const slot = game.offensiveSlots[existingIdx]
    slot.level = (slot.level || 1) + 1
    def.onUpgrade(game, slot.level)
    slot.detail = def.getDetail(slot.level, game)
    addLog(`【${slot.name}】于${dirNames[existingIdx]}方槽位精进升阶，当前境界达 ${slot.level} 重！`, true)
    if (!isHeadless) updateWeaponSlotHUD()
    return { success: true, action: 'upgraded', slotIndex: existingIdx, level: slot.level }
  }

  // 2. 检查是否有空闲槽位
  const emptyIdx = getAvailableOffensiveSlotIndex()
  if (emptyIdx !== -1) {
    def.onEquip(game)
    game.offensiveSlots[emptyIdx] = {
      id: def.id,
      name: def.name,
      type: def.type,
      icon: def.icon,
      image: def.image,
      level: 1,
      detail: def.getDetail(1, game)
    }
    addLog(`纳得新法宝【${def.name}】，置入${dirNames[emptyIdx]}方进攻槽位！`, true)
    if (!isHeadless) updateWeaponSlotHUD()
    return { success: true, action: 'equipped', slotIndex: emptyIdx, level: 1 }
  }

  // 3. 4 个槽位已满，无法直接放入（需触发新旧替换）
  return { success: false, action: 'full' }
}

function replaceOffensiveSlot(slotIndex, newId) {
  if (!game.offensiveSlots || slotIndex < 0 || slotIndex >= 4) return false
  const dirNames = ['上', '右', '下', '左']
  const oldItem = game.offensiveSlots[slotIndex]
  if (oldItem && OFFENSIVE_ITEM_DEFS[oldItem.id]) {
    OFFENSIVE_ITEM_DEFS[oldItem.id].onRemove(game)
  }

  const def = OFFENSIVE_ITEM_DEFS[newId]
  if (!def) {
    game.offensiveSlots[slotIndex] = null
    if (!isHeadless) updateWeaponSlotHUD()
    return true
  }

  def.onEquip(game)
  game.offensiveSlots[slotIndex] = {
    id: def.id,
    name: def.name,
    type: def.type,
    icon: def.icon,
    image: def.image,
    level: 1,
    detail: def.getDetail(1, game)
  }

  addLog(`替换${dirNames[slotIndex]}方槽位：以新法宝【${def.name}】替换旧物【${oldItem ? oldItem.name : '无'}】！`, true)
  if (!isHeadless) updateWeaponSlotHUD()
  return true
}

function updateCharStatusHUD() {
  if (isHeadless) return
  const charAvatarEl = document.querySelector('#hud-char-avatar')
  if (charAvatarEl && game.player) {
    const avatarSrc = game.player.spriteUrl || (characters[selectedCharIndex] && characters[selectedCharIndex].spriteUrl) || './player_anime.png'
    if (charAvatarEl.getAttribute('src') !== avatarSrc) {
      charAvatarEl.src = avatarSrc
    }
  }
  const charNameEl = document.querySelector('#hud-char-name')
  if (charNameEl) {
    charNameEl.textContent = game.player.charName || (characters[selectedCharIndex] && characters[selectedCharIndex].name) || '凌虚子'
  }
  const charRealmBadge = document.querySelector('#hud-char-realm-badge')
  if (charRealmBadge) {
    charRealmBadge.textContent = realmNames[game.realm] || '炼气'
  }
}

function updateWeaponSlotHUD() {
  if (isHeadless) return

  // 1. 本命法宝 (Center Slot) - 显示法宝高清贴图，彻底删除文字
  const natalEl = document.querySelector('#natal-weapon-slot')
  if (natalEl) {
    const pw = (game.weapons && game.weapons[0]) || {}
    const wType = game.player.weaponType || pw.weaponType || pw.id || 'sword'
    const weaponDef = typeof getWeaponDef === 'function' ? getWeaponDef(wType) : null
    const weaponImgSrc = pw.image || (weaponDef && weaponDef.image) || (wType ? `./weapon_${wType}.png` : './weapon_sword.png')

    const inner = natalEl.querySelector('.slot-inner')
    if (inner) {
      let imgEl = inner.querySelector('.slot-img')
      if (!imgEl) {
        inner.innerHTML = `<img src="${weaponImgSrc}" class="slot-img" alt="${pw.name || '本命法宝'}">`
      } else {
        if (imgEl.getAttribute('src') !== weaponImgSrc) imgEl.src = weaponImgSrc
        if (imgEl.alt !== (pw.name || '本命法宝')) imgEl.alt = pw.name || '本命法宝'
      }
      const iconEl = inner.querySelector('.slot-icon')
      if (iconEl) iconEl.remove()
    }

    // 彻底清除本命法宝上的所有文字标签（如“本命”角标、文字层）
    const badges = natalEl.querySelectorAll('.natal-badge, .slot-badge')
    badges.forEach(b => b.remove())

    natalEl.title = `【本命法宝 · ${pw.name || '法宝'}】\n${pw.detail || ''}`
  }

  // 2. 四周 4 个进攻槽位 (Top: 0, Left: 3, Right: 1, Bottom: 2)
  let occupiedCount = 0
  for (let i = 0; i < 4; i++) {
    const slotEl = document.querySelector(`#offensive-slot-${i}`)
    if (!slotEl) continue
    const item = (game.offensiveSlots && game.offensiveSlots[i]) || null
    const inner = slotEl.querySelector('.slot-inner')
    let badge = slotEl.querySelector('.slot-badge')

    if (item) {
      occupiedCount++
      slotEl.classList.add('occupied')
      slotEl.classList.remove('empty')

      let imgHtml = ''
      if (item.image) {
        imgHtml = `<img src="${item.image}" class="slot-img" alt="${item.name}">`
      } else {
        imgHtml = `<span class="slot-icon">${item.icon || '◈'}</span>`
      }
      if (inner) inner.innerHTML = imgHtml

      // 若升阶至 2 级及以上，展示小巧等级标记；1 级不显示任何文字角标，保持极致简洁
      if (item.level && item.level > 1) {
        if (!badge) {
          badge = document.createElement('span')
          badge.className = 'slot-badge'
          slotEl.appendChild(badge)
        }
        badge.textContent = `Lv.${item.level}`
      } else {
        if (badge) badge.remove()
      }
      slotEl.title = `【${item.name}】(Lv.${item.level || 1})\n类型：${item.type}\n${item.detail || ''}`
    } else {
      slotEl.classList.remove('occupied')
      slotEl.classList.add('empty')
      // 空槽位不显示任何“上/下/左/右”文字标记，彻底删除文字描述
      if (inner) inner.innerHTML = ''
      if (badge) badge.remove()
      slotEl.title = `【进攻槽位 · 空置】`
    }
  }

  const countText = document.querySelector('#slots-count-text')
  if (countText) countText.textContent = `${occupiedCount} / 4`
}

/* ---------- 卡片：每关结算固定三选一 ---------- */

const cards = [
  { id: 'sword', icon: '✧', name: '流云飞剑', type: '法宝 · 强化', copy: '飞剑伤害 +12，并额外发射一柄剑光。',
    apply() { upgradePrimaryWeapon(game.weapons[0]) } },
  { id: 'fire', icon: '◈', name: '赤炎葫芦', type: '法宝 · 新得', copy: '每 2.2 秒向最近敌人喷出一道灼热火线。',
    apply() { equipOrUpgradeOffensiveItem('fire') } },
  { id: 'chain_arc', icon: '⚡', name: '连锁电弧', type: '神通 · 绝技', copy: '主武器攻击命中时触发金黄电弧，在最多 10 个敌怪间传递，各造成当前伤害的 10%（随卡片数量升级）。',
    apply() {
      game.chainArcLevel = (game.chainArcLevel || 0) + 1
      const n = getChainArcN()
      addBuild(game.passives, {
        id: 'chain_arc',
        name: '连锁电弧',
        icon: '⚡',
        type: '神通',
        detail: `金雷传递 ${n} 怪 · 威力 ${n}%`,
        count: 1
      })
    } },
  { id: 'blazing_fire', icon: '🔥', name: '离火焚原', type: '神通 · 绝技', copy: '主武器命中施加离火烙印（持续灼烧 10%/s）；敌怪毙命或受重击时引发真火大爆裂（范围伤害 20%），迸射 3 颗飞火流星点燃周围敌群（可随卡片升级）。',
    apply() {
      game.blazingFireLevel = (game.blazingFireLevel || 0) + 1
      const p = getBlazingFireParams()
      addBuild(game.passives, {
        id: 'blazing_fire',
        name: '离火焚原',
        icon: '🔥',
        image: './skill_blazing_fire.png',
        type: '神通',
        detail: `持续灼烧 ${p.burnDmgPct}%/s · 爆裂 ${p.burstDamagePct}% · 溅射 ${p.motesCount} 流星`,
        count: 1
      })
    } },
  { id: 'gather', icon: '◎', name: '聚灵诀', type: '功法 · 被动', copy: isHeadless ? '灵气拾取范围 +45，移动速度 +12%。' : '灵气拾取范围 +45，移动速度 +2%。',
    apply() { game.pickup += 45; game.moveSpeed *= (isHeadless ? 1.12 : 1.02); addBuild(game.passives, { id: 'gather', name: '聚灵诀', icon: '◎', type: '功法', detail: isHeadless ? '灵气范围 +45 · 移速 +12%' : '灵气范围 +45 · 移速 +2%', count: 1 }) } },
  { id: 'formation', icon: '⌘', name: '回风阵', type: '阵法 · 新得', copy: '在身边展开阵法，持续击退并灼伤周围妖物。',
    apply() { equipOrUpgradeOffensiveItem('formation') } },
  { id: 'pet', icon: '♢', name: '青羽灵狐', type: '灵兽 · 新得', copy: '灵狐每 4 秒扑向一名敌人，造成范围伤害。',
    apply() { equipOrUpgradeOffensiveItem('pet') } },
  { id: 'thunder', icon: '⚡', name: '昊天雷符', type: '符箓 · 新得', copy: '每 3 秒引天雷轰击敌怪，已拥有则雷击伤害 +20。',
    apply() { equipOrUpgradeOffensiveItem('thunder') } },
  { id: 'body', icon: '✦', name: '玄木灵体', type: '体质 · 被动', copy: '最大生命 +30，并立即回复等量生命。',
    apply() { game.bonusHp += 30; recomputeMaxHp(); game.hp += 30; addBuild(game.passives, { id: 'body', name: '玄木灵体', icon: '✦', type: '体质', detail: '最大生命 +30 · 自愈', count: 1 }) } },
  { id: 'haste', icon: '↝', name: '御风行', type: '身法 · 被动', copy: isHeadless ? '移动速度 +24%，法宝攻击间隔缩短 12%。' : '移动速度 +5%，法宝攻击间隔缩短 12%。',
    apply() { game.moveSpeed *= (isHeadless ? 1.24 : 1.05); game.attackSpeed *= 1.12; addBuild(game.passives, { id: 'haste', name: '御风行', icon: '↝', type: '身法', detail: isHeadless ? '移速 +24% · 攻速 +12%' : '移速 +5% · 攻速 +12%', count: 1 }) } },
  { id: 'meridian', icon: '⧉', name: '逆脉诀', type: '功法 · 被动', copy: '最大生命 -20，法宝伤害 +18。以命换力。',
    apply() { game.bonusHp -= 20; recomputeMaxHp(); game.attack += 18; addBuild(game.passives, { id: 'meridian', name: '逆脉诀', icon: '⧉', type: '功法', detail: '最大生命 -20 · 伤害 +18', count: 1 }) } }
]

/* ---------- 物品：关卡中掉落，结算时决定保留或放弃 ---------- */

const items = [
  { id: 'qi-pill', name: '聚气丹', icon: '●', type: '丹药', desc: '回复 30 点生命', qi: 18,
    apply() { game.hp = Math.min(game.maxHp, game.hp + 30) } },
  { id: 'ward', name: '护体符', icon: '▤', type: '符箓', desc: '最大生命 +25', qi: 20,
    apply() { game.bonusHp += 25; recomputeMaxHp(); game.hp += 25 } },
  { id: 'edge', name: '锐金丹', icon: '◆', type: '丹药', desc: '法宝伤害 +8', qi: 24,
    apply() { game.attack += 8; const w = game.weapons[0]; if (w) w.detail = `${w.name} · 伤害 ${game.attack}` } },
  { id: 'feather', name: '疾风羽', icon: '↝', type: '灵材', desc: isHeadless ? '移动速度 +8%' : '移动速度 +2%', qi: 16,
    apply() { game.moveSpeed *= (isHeadless ? 1.08 : 1.02) } },
  { id: 'herb', name: '聚灵草', icon: '❀', type: '灵草', desc: '灵气拾取范围 +30', qi: 15,
    apply() { game.pickup += 30 } },
  { id: 'egg', name: '灵兽蛋', icon: '♢', type: '灵兽', desc: '获得青羽灵狐，已拥有则扑击伤害 +26', qi: 30,
    apply() { equipOrUpgradeOffensiveItem('pet') } },
  { id: 'cinnabar', name: '赤炎砂', icon: '◈', type: '灵材', desc: '获得赤炎葫芦，已拥有则火线威力 +40%', qi: 28,
    apply() { equipOrUpgradeOffensiveItem('fire') } },
  { id: 'jade', name: '回风玉', icon: '⌘', type: '阵材', desc: '获得回风阵，已拥有则阵法威力 +50%', qi: 26,
    apply() { equipOrUpgradeOffensiveItem('formation') } },
  { id: 'nine-turn', name: '九转丹', icon: '✦', type: '丹药', desc: '最大生命 +45，并回满生命', qi: 34,
    apply() { game.bonusHp += 45; recomputeMaxHp(); game.hp = game.maxHp } },
  { id: 'thunder', name: '御雷符', icon: '⚡', type: '符箓', desc: '每 3 秒降下雷击，已拥有则雷击伤害 +20', qi: 32,
    apply() { equipOrUpgradeOffensiveItem('thunder') } }
]

/* ---------- 基础工具 ---------- */

function addBuild(target, item) {
  const existing = target.find(x => x.id === item.id)
  if (existing) { existing.count += 1; existing.detail = item.detail }
  else target.push({ ...item })
}

function addLog(message, accent = false) {
  game.logs.unshift({ message, accent })
  game.logs = game.logs.slice(0, 5)
  ui.log.innerHTML = game.logs.map(item => `<div class="log-line">${item.accent ? '✦ ' : '· '}<strong>${item.message}</strong></div>`).join('')
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

/* ---------- 敌人生成：随关卡增强 ---------- */

function stageScale() {
  const s = game.stage - 1
  return {
    cap: isHeadless
    ? (28 + s * 4 + Math.floor(game.stageElapsed / 14))
    : (game.isBossStage ? 2 : (28 + s * 4 + Math.floor(game.stageElapsed / 14) + (s >= 2 ? Math.floor((s - 1) * 7 + (game.stageElapsed / 8) * 3) : 0))),
    interval: isHeadless
    ? Math.max(.45, .95 - s * .045 - game.stageElapsed * .005)
    : (game.isBossStage ? 5.0 : (s < 2
        ? Math.max(.45, .95 - s * .045 - game.stageElapsed * .005)
        : Math.max(.24, .88 - s * .075 - game.stageElapsed * .007))),
    bruteChance: isHeadless
    ? Math.min(.32, .09 + s * .03)
    : (game.isBossStage ? 0 : (s === 0
        ? (game.stageElapsed < 15 ? 0 : Math.min(0.03, (game.stageElapsed - 15) * 0.001))
        : Math.min(.38, Math.max(0.02, .025 + s * .05)))),
    wisp: { hp: 18 + s * 8, damage: 7 + s * 1.1, speed: 46 + s * 2.5 },
    brute: { hp: 68 + s * 26, damage: 13 + s * 2, speed: 33 + s * 1.4 }
  }
}

/**
 * 预兆到期时决定真正的现身位置。
 * 预兆埋下时已避开玩家，但玩家可能在 0.85 秒内走进预兆圈；
 * 此时在玩家四周另找一个既满足安全距离又在画面内的点，避免不可躲避的贴脸伤害。
 */
function resolveSpawnPoint(marker) {
  if (distance(marker, game.player) >= SAFE_SPAWN) return { x: marker.x, y: marker.y }
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    const x = game.player.x + Math.cos(angle) * SAFE_SPAWN
    const y = game.player.y + Math.sin(angle) * SAFE_SPAWN
    if (x >= 24 && x <= ARENA_WIDTH - 24 && y >= 24 && y <= ARENA_HEIGHT - 24) return { x, y }
  }
  return { x: marker.x, y: marker.y }
}

function createEnemy(kind, x, y) {
  const scale = stageScale()
  let stats
  if (kind === 'elite_brute') {
    const base = scale.brute
    stats = {
      r: 28,
      hp: Math.round(base.hp * 3.8),
      speed: Math.round(base.speed * 0.9),
      color: '#d62828',
      damage: Math.round(base.damage * 1.4),
      isElite: true,
      eliteName: '【精英】赤炼熔岩巨兕',
      shootTimer: 2.2,
      shootInterval: 3.5,
      isWindup: false
    }
  } else if (kind === 'elite_frost_brute') {
    const base = scale.brute
    stats = {
      r: 28,
      hp: Math.round(base.hp * 3.6),
      speed: Math.round(base.speed * 0.95),
      color: '#38bdf8',
      damage: Math.round(base.damage * 1.35),
      isElite: true,
      eliteName: '【精英】玄霜凝晶巨兕',
      shootTimer: 2.0,
      shootInterval: 3.0,
      isWindup: false
    }
  } else if (kind === 'brute') {
    const base = scale.brute
    stats = { r: 18, hp: base.hp, speed: base.speed, color: '#9a5d58', damage: base.damage }
  } else {
    const base = scale.wisp
    stats = { r: 11, hp: base.hp, speed: base.speed, color: '#688b7b', damage: base.damage }
  }
  game.enemies.push({ x, y, ...stats, maxHp: stats.hp, hit: 0, kind })
  if (kind === 'elite_brute') {
    burst(x, y, '#ffd166', 26, 120)
    burst(x, y, '#d62828', 20, 90)
    if (!isHeadless) {
      if (typeof sound !== 'undefined' && sound.slam) sound.slam()
      addLog('【凶兆】地煞轰鸣！一头披挂玄曜地火甲的「赤炼熔岩巨兕」现身战场！', true)
    }
  } else if (kind === 'elite_frost_brute') {
    burst(x, y, '#38bdf8', 26, 120)
    burst(x, y, '#ffffff', 20, 90)
    if (!isHeadless) {
      if (typeof sound !== 'undefined' && sound.slam) sound.slam()
      addLog('【凶兆】极寒彻骨！一头披挂万载玄冰甲的「玄霜凝晶巨兕」踏碎坚冰现身战场！', true)
    }
  } else {
    burst(x, y, kind === 'brute' ? '#c07a70' : '#7fb79c', 10, 70)
  }
}

/** 在地图随机位置埋下现身预兆，短暂延迟后才真正出现 */
function queueSpawn(kind) {
  const margin = 46
  const hudRect = { x1: 12, y1: 44, x2: 250, y2: 206 }
  let x = ARENA_WIDTH / 2, y = ARENA_HEIGHT / 2
  for (let attempt = 0; attempt < 40; attempt++) {
    // 随机方向 + 受限距离：既保证落点随机，又避免从地图另一头走来时被逐个点杀
    const angle = rand(0, Math.PI * 2)
    const radius = rand(SPAWN_MIN, SPAWN_MAX)
    x = game.player.x + Math.cos(angle) * radius
    y = game.player.y + Math.sin(angle) * radius
    const insideMap = x >= margin && x <= ARENA_WIDTH - margin && y >= margin && y <= ARENA_HEIGHT - margin
    const clearOfHud = !(x > hudRect.x1 && x < hudRect.x2 && y > hudRect.y1 && y < hudRect.y2)
    if (insideMap && clearOfHud) break
  }
  x = Math.max(margin, Math.min(ARENA_WIDTH - margin, x))
  y = Math.max(margin, Math.min(ARENA_HEIGHT - margin, y))
  const isElite = kind === 'elite_brute' || kind === 'elite_frost_brute'
  const life = isElite ? TELEGRAPH + 0.6 : (kind === 'brute' ? TELEGRAPH + .3 : TELEGRAPH)
  const r = isElite ? 28 : (kind === 'brute' ? 18 : 11)
  game.markers.push({ x, y, kind, r, life, maxLife: life, spin: rand(0, 6), isElite })
}

function spawnDrop(x, y, type, payload, qiVal = 7) {
  game.drops.push({ x, y, r: type === 'heal' ? 6 : type === 'item' ? 7 : (qiVal > 15 ? 7 : 5), type, item: payload, qiValue: qiVal, pulse: rand(0, 6) })
}

function shoot(target, angleOffset = 0, damage = game.attack, color = '#e2c66e', radius = 5) {
  executeWeaponAttack(target, angleOffset, damage, color, radius)
}

function nearestEnemy(from = game.player, maxRange = (isHeadless ? Infinity : (game.attackRange || game.pickup || 140))) {
  if (!from) from = game.player
  const enemies = game.enemies
  if (!enemies || enemies.length === 0) return null

  if (game.isBossStage && game.boss && !game.boss.defeated) {
    if (game.boss.id === 'corpse_emperor') {
      const livingParts = enemies.filter(e => e.isBossPart && e.hp > 0)
      if (livingParts.length > 0) {
        let bestPart = null
        let minPartDist = Infinity
        for (const part of livingParts) {
          const d = distance(from, part)
          if (d < minPartDist) {
            minPartDist = d
            bestPart = part
          }
        }
        if (bestPart) return bestPart
      }
    }
    const bossEnemy = enemies.find(e => e.isBoss)
    if (bossEnemy) {
      // 领主战期间绝对优先锁定领主；仅当有近战小怪贴脸（距离 < 55px）威胁生命时，才就近反击自保
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i]
        if (!e.isBoss && !e.isBossPart && distance(from, e) < 55) {
          return e
        }
      }
      return bossEnemy
    }
  }

  let best = null
  let minDistance = maxRange
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i]
    const d = distance(from, enemy)
    if (d <= minDistance) {
      minDistance = d
      best = enemy
    }
  }
  return best
}

function burst(x, y, color, count = 7, spread = 55) {
  for (let i = 0; i < count; i++) game.particles.push({ x, y, vx: rand(-spread, spread), vy: rand(-spread, spread), life: .4, color })
}


function getStageEnemyQi(kind, stage) {
  const s = Math.max(1, stage || 1)
  let baseQi = 4
  if (s === 1) baseQi = 4
  else if (s === 2) baseQi = 5
  else if (s === 3) baseQi = 6
  else if (s === 4) baseQi = 8
  else if (s === 5) baseQi = 24
  else if (s === 6) baseQi = 40
  else if (s === 7) baseQi = 55
  else if (s === 8) baseQi = 65
  else if (s === 9) baseQi = 145
  else if (s === 10) baseQi = 180
  else if (s === 11) baseQi = 260
  else if (s === 12) baseQi = 330
  else if (s === 13) baseQi = 400
  else if (s === 14) baseQi = 680
  else baseQi = Math.round(800 * Math.pow(1.25, s - 15))
  if (kind === 'elite_brute' || kind === 'elite_frost_brute') return Math.round(baseQi * 4.5)
  return kind === 'brute' ? Math.round(baseQi * 1.5) : baseQi
}

/* ---------- 每关物品掉落范围限制与保底掉率系统 ---------- */

function getStageItemDropRange(stage = 1, realm = 0, bossesDefeated = 0) {
  // 领主4之前及后续：元婴及化神期各关 (第11~14关及以上) -> 限制在 4-7 个
  if (bossesDefeated >= 3 || stage >= 11 || realm >= 3) {
    return [4, 7]
  }
  // 领主3之前：结丹期各关 (第7~9关) -> 限制在 3-6 个
  if (bossesDefeated === 2 || stage >= 7 || realm >= 2) {
    return [3, 6]
  }
  // 领主2之前：筑基期各关 (第4~5关) -> 限制在 2-4 个
  if (bossesDefeated === 1 || stage >= 4 || realm >= 1) {
    return [2, 4]
  }
  // 领主1之前：炼气期各关 (第1~2关) -> 限制在 1-3 个
  return [1, 3]
}

function initStageDropTracker() {
  game.stageItemDrops = 0
  game.lastItemDropKill = -10
  const [minD, maxD] = getStageItemDropRange(game.stage, game.realm, game.bossesDefeated || 0)
  game.stageTargetDrops = isHeadless ? maxD : (minD + Math.floor(Math.random() * (maxD - minD + 1)))
}

function trySpawnEnemyItemDrop(enemy) {
  if (game.isBossStage) return
  if (typeof game.stageTargetDrops === 'undefined' || game.stageTargetDrops === null) {
    initStageDropTracker()
  }
  const [minD, maxD] = getStageItemDropRange(game.stage, game.realm, game.bossesDefeated || 0)

  if (isHeadless) {
    // 无头模式下为与固定 PRNG 种子 (seed: 20240917) 保持完全一致的调用序列与走位路线
    if (Math.random() < 0.04) {
      spawnDrop(enemy.x, enemy.y, 'item', pickItem())
      game.stageItemDrops = (game.stageItemDrops || 0) + 1
    }
    return
  }

  // 严格硬上限拦截：每关掉落绝不能超出范围上限
  if ((game.stageItemDrops || 0) >= maxD) return
  if ((game.stageItemDrops || 0) >= game.stageTargetDrops) return

  const killsSinceLast = game.stageKills - (game.lastItemDropKill || 0)
  const timeLeft = game.stageTime || 0

  // 掉落保底加速：若关卡倒计时不足18秒且本关尚未达到最低保底掉落数 minD，高概率或必定掉落
  if (timeLeft < 18 && (game.stageItemDrops || 0) < minD) {
    spawnDrop(enemy.x, enemy.y, 'item', pickItem())
    game.stageItemDrops = (game.stageItemDrops || 0) + 1
    game.lastItemDropKill = game.stageKills
    return
  }

  // 正常击杀防聚团CD (至少间隔4只怪)
  if (killsSinceLast < 4 && timeLeft >= 18) return

  // 动态平滑概率：根据距离上次掉宝的击杀数动态递增
  const dropProb = Math.min(0.28, 0.04 + Math.max(0, killsSinceLast - 4) * 0.015)
  if (Math.random() < dropProb) {
    spawnDrop(enemy.x, enemy.y, 'item', pickItem())
    game.stageItemDrops = (game.stageItemDrops || 0) + 1
    game.lastItemDropKill = game.stageKills
  }
}

function guaranteeStageMinDrops() {
  if (game.isBossStage || isHeadless) return
  const [minD, maxD] = getStageItemDropRange(game.stage, game.realm, game.bossesDefeated || 0)
  const existingDrops = (game.lootBag ? game.lootBag.length : 0) + (game.drops ? game.drops.filter(d => d.type === 'item').length : 0)
  game.stageItemDrops = Math.max(game.stageItemDrops || 0, existingDrops)
  while (game.stageItemDrops < minD) {
    const ang = Math.random() * Math.PI * 2
    const d = 30 + Math.random() * 60
    const sx = Math.max(40, Math.min(ARENA_WIDTH - 40, game.player.x + Math.cos(ang) * d))
    const sy = Math.max(40, Math.min(ARENA_HEIGHT - 40, game.player.y + Math.sin(ang) * d))
    spawnDrop(sx, sy, 'item', pickItem())
    game.stageItemDrops++
  }
}

function capStageMaxDrops() {
  if (game.isBossStage || isHeadless) return
  const [minD, maxD] = getStageItemDropRange(game.stage, game.realm, game.bossesDefeated || 0)
  if (game.settlement && game.settlement.loot && game.settlement.loot.length > maxD) {
    game.settlement.loot = game.settlement.loot.slice(0, maxD)
  }
}

function defeat(enemy) {
  if (enemy && enemy.isBoss) {
    if (game.boss && game.boss.phaseIndex < game.boss.config.phases.length - 1) {
      triggerBossPhaseTransition()
      return
    }
    defeatBoss()
    return
  }

  if (enemy && enemy.isBossPart) {
    const index = game.enemies.indexOf(enemy)
    if (index >= 0) game.enemies.splice(index, 1)
    if (enemy.armRef) {
      onCorpseEmperorArmDestroyed(enemy.armRef)
    }
    burst(enemy.x, enemy.y, '#06d6a0', 16, 75)
    burst(enemy.x, enemy.y, '#f8f9fa', 12, 60)
    if (!isHeadless && typeof sound !== 'undefined' && sound.crash) sound.crash()
    return
  }

  if (enemy && enemy.isDummy && enemy.immortal) {
    enemy.hp = enemy.maxHp
    return
  }

  // 离火烙印：阵亡时触发真火大爆裂！
  if (enemy && enemy.flameBrand && (game.blazingFireLevel || 0) > 0 && !enemy._blazingDetonated && !enemy._blazingQueued) {
    if (game._isDetonating) {
      enemy._blazingQueued = true
      if (!game.pendingDetonations) game.pendingDetonations = []
      if (game.pendingDetonations.length < 8) {
        game.pendingDetonations.push({
          enemy,
          damage: enemy.flameBrandDmg,
          timer: 0.04 * (game.pendingDetonations.length + 1)
        })
      }
    } else {
      triggerBlazingDetonation(enemy, enemy.flameBrandDmg)
    }
  }

  if (enemy && enemy.isDummy) {
    const index = game.enemies.indexOf(enemy)
    if (index >= 0) game.enemies.splice(index, 1)
    game.kills += 1
    burst(enemy.x, enemy.y, enemy.color)
    if (!isHeadless) sound.defeat()
    return
  }

  const index = game.enemies.indexOf(enemy)
  if (index >= 0) game.enemies.splice(index, 1)
  game.kills += 1
  game.stageKills += 1
  const enemyQi = getStageEnemyQi(enemy.kind, game.stage)
  if (enemy && (enemy.kind === 'elite_brute' || enemy.kind === 'elite_frost_brute')) {
    const isFrost = enemy.kind === 'elite_frost_brute'
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + Math.random() * 0.4
      spawnDrop(enemy.x + Math.cos(ang) * 22, enemy.y + Math.sin(ang) * 22, 'xp', null, Math.round(enemyQi * 0.8))
    }
    if (Math.random() < 0.45) {
      spawnDrop(enemy.x, enemy.y, 'heal', null, 0)
    }
    if (isFrost) {
      burst(enemy.x, enemy.y, '#38bdf8', 22, 90)
      burst(enemy.x, enemy.y, '#ffffff', 18, 75)
      if (!isHeadless) {
        if (typeof sound !== 'undefined' && sound.slam) sound.slam()
        addLog('【降妖伏魔】玄霜凝晶巨兕冰甲崩解，化作万千寒晶灵气！', true)
      }
    } else {
      burst(enemy.x, enemy.y, '#ffd166', 22, 90)
      burst(enemy.x, enemy.y, '#d62828', 16, 75)
      if (!isHeadless) {
        if (typeof sound !== 'undefined' && sound.slam) sound.slam()
        addLog('【降妖伏魔】赤炼熔岩巨兕轰然倒地，喷涌出浓郁地煞精气！', true)
      }
    }
  }
  spawnDrop(enemy.x, enemy.y, Math.random() < .05 ? 'heal' : 'xp', null, enemyQi)
  trySpawnEnemyItemDrop(enemy)
  burst(enemy.x, enemy.y, enemy.color)
  if (!isHeadless) sound.defeat()
}

function pickItem() {
  return items[Math.floor(Math.random() * items.length)]
}

function collectDrop(drop, silent = false) {
  const index = game.drops.indexOf(drop)
  if (index >= 0) game.drops.splice(index, 1)
  if (drop.type === 'heal') game.hp = Math.min(game.maxHp, game.hp + 18)
  else if (drop.type === 'item') {
    game.lootBag.push(drop.item)
    if (!silent) addLog(`拾得「${drop.item.name}」，待结算时清点。`, true)
  } else gainXp(drop.qiValue || 7)
  if (!isHeadless && !silent) sound.pickup(drop.type === 'item')
}

/* ---------- 灵气与境界突破 ---------- */

function realmLabel() { return `${realmNames[game.realm]}${subStageNames[game.subStage]}` }
function isMaxRealm() { return game.realm >= realmNames.length - 1 && game.subStage >= subStageNames.length - 1 }
function isMaxRealmMaxLevel() { return isMaxRealm() && game.xp >= game.xpNeed }
function nextStageLabel() {
  if (game.subStage < subStageNames.length - 1) return `${realmNames[game.realm]}${subStageNames[game.subStage + 1]}`
  return `${realmNames[Math.min(game.realm + 1, realmNames.length - 1)]}初期`
}
function recomputeMaxHp() {
  game.maxHp = game.baseHp + game.bonusHp
  game.hp = Math.min(game.hp, game.maxHp)
}

function recomputeAttackRange() {
  game.attackRange = Math.max(140, (game.baseAttackRange || 140) + (game.bonusAttackRange || 0))
}

function gainXp(amount) {
  game.xp += amount
  while (game.xp >= game.xpNeed) {
    if (isMaxRealm()) {
      game.xp = game.xpNeed
      if (!game.primordialGodTriggered && !game.primordialGodEncountered && (game.bossesDefeated || 0) >= 4) {
        game.primordialGodTriggered = true
        addLog('【化神大圆满】轰！！！九重天道雷云滚滚！修为已臻至化神后期大圆满！待本关历练终了，终极飞升天劫「混沌太虚道祖」即刻降临！', true)
        if (typeof sound !== 'undefined' && sound.levelUp) sound.levelUp()
      }
      break
    }
    game.xp -= game.xpNeed
    advanceStage()
  }
}

function advanceStage() {
  game.xpNeed *= 2
  game.flash = .7
  if (game.subStage < subStageNames.length - 1) {
    // 小阶段：只巩固境界，基础生命不变
    game.subStage += 1
    game.hp = Math.min(game.maxHp, game.hp + game.maxHp * .4)
    addLog(`小境界巩固，晋升「${realmLabel()}」，伤势回复。`, true)
    return
  }
  // 大境界：基础生命翻倍
  game.subStage = 0
  game.realm = Math.min(realmNames.length - 1, game.realm + 1)
  game.baseHp *= 2
  game.baseAttackRange = (game.baseAttackRange || 140) + 8
  if (typeof recomputeAttackRange === "function") recomputeAttackRange()
  recomputeMaxHp()
  if (!isHeadless) game.pendingBossStage = true
  game.hp = game.maxHp
  addLog(`大境界突破，「${realmLabel()}」！基础生命翻倍至 ${game.baseHp}。`, true)
}

/* ---------- 玩家移动 ---------- */

function movePlayer(dt) {
  let x = 0, y = 0
  if (keys.has('w') || keys.has('arrowup')) y -= 1
  if (keys.has('s') || keys.has('arrowdown')) y += 1
  if (keys.has('a') || keys.has('arrowleft')) x -= 1
  if (keys.has('d') || keys.has('arrowright')) x += 1
  if (typeof gamepadState !== 'undefined' && (gamepadState.moveX || gamepadState.moveY)) {
    x += gamepadState.moveX
    y += gamepadState.moveY
  }
  if (x || y) {
    const len = Math.hypot(x, y)
    const effectiveSpeed = isHeadless
      ? game.moveSpeed
      : (game.moveSpeed <= 300 ? game.moveSpeed : 300 + (game.moveSpeed - 300) * 0.35)
    const stickRatio = (typeof gamepadState !== 'undefined' && gamepadState.stickMag > 0) ? Math.min(1.0, Math.max(0.35, gamepadState.stickMag)) : 1.0

    // 减速与冰冻修正
    let speedMult = 1.0
    if ((game.playerFreezeTimer || 0) > 0) {
      speedMult = 0
    } else if ((game.playerChillTimer || 0) > 0) {
      speedMult = Math.max(0.2, 1.0 - (game.playerChillSlow || 0.45))
    }

    const finalSpeed = effectiveSpeed * stickRatio * speedMult
    game.player.x += (x / len) * finalSpeed * dt
    game.player.y += (y / len) * finalSpeed * dt
  }
  game.player.x = Math.max(24, Math.min(ARENA_WIDTH - 24, game.player.x))
  game.player.y = Math.max(24, Math.min(ARENA_HEIGHT - 24, game.player.y))
}

/* ---------- 玩家状态效果驱动 (灼烧与冰冻/减速) ---------- */

function updatePlayerStatusEffects(dt) {
  // 1. 冰冻倒计时
  if ((game.playerFreezeTimer || 0) > 0) {
    game.playerFreezeTimer = Math.max(0, game.playerFreezeTimer - dt)
    if (!isHeadless && Math.random() < 0.25 && game.particles && game.particles.length < 90) {
      game.particles.push({
        x: game.player.x + (Math.random() - 0.5) * 16,
        y: game.player.y - 8 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 0.25,
        color: Math.random() < 0.5 ? '#bae6fd' : '#38bdf8'
      })
    }
  }

  // 2. 减速倒计时
  if ((game.playerChillTimer || 0) > 0) {
    game.playerChillTimer = Math.max(0, game.playerChillTimer - dt)
    if (!isHeadless && Math.random() < 0.15 && game.particles && game.particles.length < 90) {
      game.particles.push({
        x: game.player.x + (Math.random() - 0.5) * 12,
        y: game.player.y + 4 + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 15,
        life: 0.2,
        color: '#7dd3fc'
      })
    }
  }

  // 3. 灼烧伤害持续跳动
  if ((game.playerBurnTimer || 0) > 0) {
    game.playerBurnTimer = Math.max(0, game.playerBurnTimer - dt)
    game.playerBurnTick = (game.playerBurnTick || 0.48) - dt
    if (game.playerBurnTick <= 0) {
      game.playerBurnTick = 0.48
      const burnDmg = game.playerBurnDmg || Math.max(1, Math.round(game.maxHp * 0.012))
      if (!game.testGodMode) {
        game.hp -= burnDmg
        if (!isHeadless) {
          burst(game.player.x, game.player.y - 8, '#ff9900', 4, 25)
          if (typeof sound !== 'undefined' && sound.flame) sound.flame()
        }
        if (game.hp <= 0) {
          if (game.isTestLevel || game.testGodMode) {
            game.hp = game.maxHp
          } else {
            endRun()
            return
          }
        }
      }
    }

    if (!isHeadless && Math.random() < 0.35 && game.particles && game.particles.length < 90) {
      game.particles.push({
        x: game.player.x + (Math.random() - 0.5) * 14,
        y: game.player.y - 6 + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 15,
        vy: -25 - Math.random() * 20,
        life: 0.28,
        color: Math.random() < 0.5 ? '#ffbe0b' : '#ff4d4f'
      })
    }
  }
}

/* ---------- 主循环 ---------- */

function update(dt) {
  if (game.paused || game.gameOver || (!isHeadless && game.screen !== 'game') || (game.settlement && !ui.overlay.classList.contains('hidden'))) return
  if (game.clearingStage) {
    updateStageClear(dt)
    return
  }
  game.elapsed += dt
  game.stageElapsed += dt
  game.player.invuln = Math.max(0, game.player.invuln - dt)
  game.player.attackTimer = Math.max(0, (game.player.attackTimer || 0) - dt)
  game.flash = Math.max(0, game.flash - dt * 1.6)
  movePlayer(dt)
  updatePlayerStatusEffects(dt)

  if (game.isBossStage && game.boss && !game.boss.defeated) {
    updateBoss(dt)
    updateBossProjectiles(dt)
    updateBossAoEs(dt)
  } else if (game.bossProjectiles && game.bossProjectiles.length) {
    updateBossProjectiles(dt)
  }
  if (game.isEndlessMode || game.isTestLevel) {
    if (game.isEndlessMode) game.endlessElapsed = (game.endlessElapsed || 0) + dt
    if (game.isTestLevel) {
      game.testElapsed = (game.testElapsed || 0) + dt
      if (typeof updateTestStats === 'function') updateTestStats(dt)
    }
  } else if (!game.isBossStage || isHeadless || (game.boss && game.boss.defeated)) {
    game.stageTime -= dt
    if (game.stageTime <= 0) {
      if (game.isBossStage && game.boss && !game.boss.defeated) defeatBoss()
      endStage()
      return
    }
  }

  const scale = stageScale()
  game.spawnTimer -= dt
  game.shotTimer -= dt
  game.petTimer -= dt
  game.thunderTimer -= dt
  game.formationTimer -= dt

  if (game.isTestLevel && !game.testAutoSpawn) {
    // 演武试炼场默认不自动刷新小怪干扰测试，除非主动开启
  } else if (game.spawnTimer <= 0) {
    const curS = game.stage - 1
    const burstCount = (!isHeadless && !game.isBossStage && curS >= 2 && Math.random() < Math.min(0.65, 0.15 + (curS - 1) * 0.12)) ? 2 : 1
    for (let b = 0; b < burstCount; b++) {
      if (game.isBossStage && game.enemies.filter(e => !e.isBoss).length + game.markers.length >= 2) break
      if (game.enemies.length + game.markers.length < scale.cap) {
        let spawnKind = Math.random() < scale.bruteChance ? 'brute' : 'wisp'
        // 在击败boss千年赤炼蛟之后的关卡，有小概率生成赤炼熔岩巨兕或玄霜凝晶巨兕精英怪
        const canSpawnElite = !game.isBossStage && (game.defeatedRedDragon || (game.bossesDefeated && game.bossesDefeated >= 1))
        if (canSpawnElite && spawnKind === 'brute') {
          const hasActiveElite = game.enemies.some(e => e.isElite || e.kind === 'elite_brute' || e.kind === 'elite_frost_brute') || game.markers.some(m => m.kind === 'elite_brute' || m.kind === 'elite_frost_brute')
          if (!hasActiveElite && Math.random() < 0.12) {
            spawnKind = Math.random() < 0.5 ? 'elite_frost_brute' : 'elite_brute'
          }
        }
        queueSpawn(spawnKind)
      }
    }
    game.spawnTimer = scale.interval
  }

  for (const marker of [...game.markers]) {
    marker.life -= dt
    if (marker.life <= 0) {
      const index = game.markers.indexOf(marker)
      if (index >= 0) game.markers.splice(index, 1)
      const point = resolveSpawnPoint(marker)
      createEnemy(marker.kind, point.x, point.y)
    }
  }

  const target = nearestEnemy()

  if (target && game.shotTimer <= 0) {
    shoot(target)
    const primaryCount = (game.weapons[0] && game.weapons[0].count) || 1
    const curWType = game.player.weaponType || 'sword'
    if (isHeadless) {
      if (game.weapons.some(x => x.id === 'sword' && x.count > 1)) shootClassic(target, .13)
    } else {
      if (['sword', 'daggers', 'thunder_sword'].includes(curWType)) {
        for (let i = 1; i < primaryCount; i++) {
          const sign = (i % 2 === 1) ? 1 : -1
          const step = Math.ceil(i / 2)
          const offset = sign * step * 0.12
          executeWeaponAttack(target, offset)
        }
      }
    }
    const baseInterval = (getWeaponDef(game.player.weaponType || 'sword').shootInterval || 0.78)
    game.shotTimer = Math.max(.18, baseInterval / game.attackSpeed)
  }

  if (game.weapons.some(x => x.id === 'fire')) {
    game.fireTimer -= dt
    if (target && game.fireTimer <= 0) {
      if (isHeadless) {
        shootClassic(target, 0, game.attack * 1.8 * game.firePower, '#e9865b', 8)
      } else {
        triggerGourdFireBeam(target, game.attack * 1.8 * game.firePower)
      }
      game.fireTimer = 2.2
    }
  }

  if (game.pets.length && target && game.petTimer <= 0) {
    game.petTimer = 4
    if (isHeadless) {
      target.hp -= game.petDamage
      target.hit = .2
      burst(target.x, target.y, '#a9d2bc', 12, 75)
      if (target.hp <= 0) defeat(target)
    } else {
      triggerFoxPounceAttack(target, game.petDamage)
    }
  }

  if (game.thunderDamage > 0 && target && game.thunderTimer <= 0) {
    game.thunderTimer = 3
    if (isHeadless) { target.hp -= game.thunderDamage; target.hit = .25; if (target.hp <= 0) defeat(target) } else { damageEnemy(target, game.thunderDamage, '#9fc7e8') }
    game.zaps.push({ x: target.x, y: target.y, life: .22 })
    burst(target.x, target.y, '#9fc7e8', 8, 60)
  }

  for (const enemy of [...game.enemies]) {
    if (enemy.isBoss || enemy.isDummy) continue
    const dx = game.player.x - enemy.x, dy = game.player.y - enemy.y
    const len = Math.hypot(dx, dy) || 1

    // 精英怪攻击模式：蓄力发射扇形熔岩弹幕或高速冰棱晶
    if (enemy.kind === 'elite_brute' || enemy.kind === 'elite_frost_brute') {
      enemy.shootTimer = (enemy.shootTimer != null ? enemy.shootTimer : 2.5) - dt
      if (enemy.shootTimer <= 0.75) {
        enemy.isWindup = true
      } else {
        enemy.isWindup = false
      }

      if (enemy.shootTimer <= 0) {
        enemy.isWindup = false
        if (enemy.kind === 'elite_frost_brute') {
          enemy.shootTimer = 2.8 + Math.random() * 0.6
          fireFrostCrystalBarrage(enemy)
        } else {
          enemy.shootTimer = 3.2 + Math.random() * 0.6
          fireMagmaBarrage(enemy)
        }
      }
    }

    const currentSpeed = enemy.isWindup ? (enemy.speed * 0.15) : enemy.speed
    enemy.x += dx / len * currentSpeed * dt
    enemy.y += dy / len * currentSpeed * dt
    enemy.hit = Math.max(0, enemy.hit - dt)
    const isHit = isHeadless
    ? (distance(game.player, enemy) < enemy.r + game.player.r)
    : (Math.min(distance(game.player, enemy), Math.hypot(game.player.x - enemy.x, game.player.y - 10 - enemy.y)) < (enemy.r || 12) + (game.player.r || 13) + 2)
    if (isHit && game.player.invuln <= 0) {
      if (game.testGodMode) {
        // 演武试炼场金刚不坏开启时不扣血
        continue
      }
      if (enemy.isBoss && (game.boss && game.boss.state === 'entrance')) {
        // 领主登场降临期间免除接触伤害
      } else {
        const isElite = enemy.isElite || enemy.kind === 'elite_brute' || enemy.kind === 'elite_frost_brute'
        const isBrute = enemy.kind === 'brute' || isElite
        const basePct = isElite ? 0.20 : (isBrute ? 0.14 : 0.07)
        const stageGrowth = Math.min(0.04, Math.max(0, game.stage - 1) * 0.003)
        const dmgPct = basePct + stageGrowth
        const pctDamage = Math.round(game.maxHp * dmgPct)
        const finalDmg = Math.max(Math.round(enemy.damage || (isElite ? 22 : (isBrute ? 13 : 7))), pctDamage)

        game.hp -= finalDmg
        game.player.invuln = .65
        const foeName = enemy.kind === 'elite_frost_brute' ? '玄霜凝晶巨兕近身重踏' : (isElite ? '赤炼熔岩巨兕近身重踏' : '妖物近身')
        addLog(`${foeName}，受到 ${finalDmg} 点伤害（约 ${Math.round(dmgPct * 100)}% 生命）。`)
        if (!isHeadless) {
          sound.hit()
          burst(game.player.x, game.player.y - 10, '#f24838', 5, 45)
          if (typeof pulseGamepad === 'function') pulseGamepad(0.25, 0.35, 120)
        }
        if (game.hp <= 0) {
          if (game.isTestLevel || game.testGodMode) {
            game.hp = game.maxHp
            continue
          }
          endRun(); return
        }
      }
    }
  }

  game._currentAttackIsPrimary = true
  let projWrite = 0
  for (let i = 0; i < game.projectiles.length; i++) {
    const projectile = game.projectiles[i]
    projectile.x += projectile.vx * dt
    projectile.y += projectile.vy * dt
    projectile.life -= dt
    const hit = game.enemies.find(enemy => {
      if (projectile.hitEnemies && projectile.hitEnemies.has(enemy)) return false
      return distance(projectile, enemy) < projectile.r + enemy.r
    })
    if (hit) {
      if (isHeadless) {
        if (hit.isBoss && typeof damageBoss === 'function') {
          damageBoss(projectile.damage)
        } else {
          hit.hp -= projectile.damage
          if (hit.armRef) hit.armRef.hp = Math.max(0, hit.hp)
          hit.hit = .12
          burst(hit.x, hit.y, projectile.color, 3, 25)
          if (hit.hp <= 0) defeat(hit)
        }
        if (game.chainArcLevel > 0) triggerChainArc(hit, projectile.damage)
        if (game.blazingFireLevel > 0) applyBlazingFireBrand(hit, projectile.damage)
      } else {
        damageEnemy(hit, projectile.damage, projectile.color)
        burst(hit.x, hit.y, projectile.color, 3, 25)
      }
      if (projectile.pierce && projectile.pierce > 1) {
        projectile.pierce--
        if (!projectile.hitEnemies) projectile.hitEnemies = new Set()
        projectile.hitEnemies.add(hit)
      } else {
        projectile.life = 0
      }
    }
    if (projectile.life > 0) {
      game.projectiles[projWrite++] = projectile
    }
  }
  game.projectiles.length = projWrite

  updateSpecialAttacks(dt)
  game._currentAttackIsPrimary = false
  if (!isHeadless && typeof updateVFXSystem === 'function') updateVFXSystem(dt)
  if (game.cameraShake > 0) game.cameraShake = Math.max(0, game.cameraShake - dt * 5.0)
  if (!isHeadless && game.damageNumbers) {
    let dnWrite = 0
    for (let i = 0; i < game.damageNumbers.length; i++) {
      const dn = game.damageNumbers[i]
      dn.y -= dt * 32
      dn.life -= dt
      if (dn.life > 0) game.damageNumbers[dnWrite++] = dn
    }
    game.damageNumbers.length = dnWrite
  }

  for (const drop of [...game.drops]) {
    drop.pulse += dt * 4
    const d = distance(game.player, drop)
    if (d < game.pickup && d > 18) {
      drop.x += (game.player.x - drop.x) / d * 400 * dt
      drop.y += (game.player.y - drop.y) / d * 400 * dt
    }
    if (d < game.player.r + drop.r + 5) collectDrop(drop)
  }

  let partWrite = 0
  for (let i = 0; i < game.particles.length; i++) {
    const particle = game.particles[i]
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    particle.life -= dt
    if (particle.life > 0) game.particles[partWrite++] = particle
  }
  game.particles.length = partWrite

  let zapWrite = 0
  for (let i = 0; i < game.zaps.length; i++) {
    const zap = game.zaps[i]
    zap.life -= dt
    if (zap.life > 0) game.zaps[zapWrite++] = zap
  }
  game.zaps.length = zapWrite

  if (game.chainArcs && game.chainArcs.length > 0) {
    let arcWrite = 0
    for (let i = 0; i < game.chainArcs.length; i++) {
      const arc = game.chainArcs[i]
      arc.life -= dt
      if (arc.life > 0) game.chainArcs[arcWrite++] = arc
    }
    game.chainArcs.length = arcWrite
  }
  if (game.chainArcCooldown > 0) game.chainArcCooldown = Math.max(0, game.chainArcCooldown - dt)
  updateBlazingFire(dt)

  if (game.formations.length && game.formationTimer <= 0) {
    game.formationTimer = 1 / 3
    for (const enemy of [...game.enemies]) {
      if (distance(game.player, enemy) < 100) {
        enemy.x += (enemy.x - game.player.x) * .06
        enemy.y += (enemy.y - game.player.y) * .06
        if (isHeadless) { enemy.hp -= 3 * game.formationPower; if (enemy.hp <= 0) defeat(enemy) } else { damageEnemy(enemy, 3 * game.formationPower, '#64e8cb') }
      }
    }
  }

  updateUI()
}

/* ---------- 关卡结算 ---------- */

function endStage() {
  if (typeof guaranteeStageMinDrops === 'function') guaranteeStageMinDrops()
  if (isHeadless) {
    game.paused = true
    const swept = game.drops.length
    for (const drop of [...game.drops]) collectDrop(drop, true)
    game.drops = []
    if (swept > 0) addLog(`关卡结束，自动回收 ${swept} 份未拾取的掉落。`)
    game.enemies = []
    game.projectiles = []
    game.specialAttacks = []
    game.markers = []
    game.settlement = { cards: shuffled(cards).slice(0, 3).map(c => ({ ...c })), chosen: null, loot: game.lootBag.map(item => ({ item, keep: true })) }
    game.lootBag = []
    if (typeof capStageMaxDrops === 'function') capStageMaxDrops()
    renderSettlement()
    ui.overlay.classList.remove('hidden')
    return
  }

  // 浏览器端：执行4阶段清场与优雅收纳过渡流程
  startStageClearSequence()
}

/* ---------- 关卡倒计时结束：4阶段清场与神识吸附战利品 ---------- */
let stageClearPhase = 'freeze'
let stageClearPhaseTimer = 0
let stageClearTotalTimer = 0

function startStageClearSequence() {
  if (typeof guaranteeStageMinDrops === 'function') guaranteeStageMinDrops()
  game.clearingStage = true
  game.stageClearPhase = 'freeze'
  stageClearPhase = 'freeze'
  stageClearPhaseTimer = 0
  stageClearTotalTimer = 0

  game.player.invuln = 999
  game.player.attackTimer = 0
  game.projectiles = []
  game.specialAttacks = []
  game.markers = []
  game.flash = 0.45

  sound.levelUp()
  addLog('秘境倒计时归零，历练圆满！天地威压降临，残存妖邪尽数退散。', true)
}

function updateStageClear(dt) {
  game.elapsed += dt
  stageClearTotalTimer += dt
  stageClearPhaseTimer += dt
  game.stageClearPhase = stageClearPhase
  game.flash = Math.max(0, game.flash - dt * 1.5)

  for (const particle of [...game.particles]) {
    particle.x += (particle.vx || 0) * dt
    particle.y += (particle.vy || 0) * dt
    particle.life -= dt
  }
  game.particles = game.particles.filter(p => p.life > 0)

  for (const zap of [...game.zaps]) zap.life -= dt
  game.zaps = game.zaps.filter(z => z.life > 0)

  if (game.chainArcs && game.chainArcs.length > 0) {
    for (const arc of [...game.chainArcs]) arc.life -= dt
    game.chainArcs = game.chainArcs.filter(z => z.life > 0)
  }

  // 阶段 1：定身威慑 (freeze, 1.0 秒)
  if (stageClearPhase === 'freeze') {
    for (const enemy of game.enemies) {
      enemy.hit = Math.max(enemy.hit || 0, 0.4)
    }
    if (stageClearPhaseTimer >= 1.0) {
      stageClearPhase = 'dissolve'
      stageClearPhaseTimer = 0
      for (const enemy of game.enemies) {
        burst(enemy.x, enemy.y, enemy.kind === 'brute' ? '#c07a70' : '#7fb79c', 14, 80)
      }
    }
    return
  }

  // 阶段 2：惊退溃散 (dissolve, 0.8 秒)
  if (stageClearPhase === 'dissolve') {
    const fade = Math.max(0, 1 - stageClearPhaseTimer / 0.8)
    for (const enemy of game.enemies) {
      enemy.opacity = fade
      const edx = enemy.x - game.player.x
      const edy = enemy.y - game.player.y
      const elen = Math.hypot(edx, edy) || 1
      enemy.x += (edx / elen) * (enemy.speed || 40) * 1.4 * dt
      enemy.y += (edy / elen) * (enemy.speed || 40) * 1.4 * dt
    }
    if (stageClearPhaseTimer >= 0.8) {
      game.enemies = []
      stageClearPhase = 'vacuum'
      stageClearPhaseTimer = 0
      if (game.drops.length === 0) {
        stageClearPhase = 'settle'
        stageClearPhaseTimer = 0
      }
    }
    return
  }

  // 阶段 3：从容飞吸战利品 (vacuum, 持续至吸完或上限 2.2 秒)
  if (stageClearPhase === 'vacuum') {
    const now = performance.now()
    let uncollected = 0

    for (const drop of [...game.drops]) {
      const dx = game.player.x - drop.x
      const dy = game.player.y - drop.y
      const d = Math.hypot(dx, dy) || 1

      const progress = Math.min(1, stageClearPhaseTimer / 1.6)
      const flySpeed = 420 + progress * 580

      drop.x += (dx / d) * flySpeed * dt
      drop.y += (dy / d) * flySpeed * dt

      if (Math.random() < 0.28) {
        game.particles.push({
          x: drop.x,
          y: drop.y,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          life: 0.25,
          color: drop.type === 'item' ? '#ffd700' : '#88d8bb'
        })
      }

      if (d < game.player.r + drop.r + 14) {
        collectDrop(drop, true)
        if (!game._lastVacuumSfx || now - game._lastVacuumSfx > 60) {
          sound.pickup(drop.type === 'item')
          game._lastVacuumSfx = now
        }
        burst(game.player.x, game.player.y - 7, drop.type === 'item' ? '#ffd700' : '#88d8bb', 4, 30)
      } else {
        uncollected++
      }
    }

    if (uncollected === 0 || stageClearPhaseTimer >= 2.2) {
      for (const drop of [...game.drops]) collectDrop(drop, true)
      game.drops = []
      stageClearPhase = 'settle'
      stageClearPhaseTimer = 0
    }
    return
  }

  // 阶段 4：休整定神与开启清点 (settle, 0.75 秒)
  if (stageClearPhase === 'settle') {
    if (stageClearPhaseTimer >= 0.75) {
      finishStageClear()
    }
  }
}

let currentLootIndex = 0

function finishStageClear() {
  game.paused = true
  game.clearingStage = false
  game.stageClearPhase = null
  stageClearPhase = 'freeze'
  stageClearPhaseTimer = 0
  stageClearTotalTimer = 0
  game.player.invuln = 0
  game.specialAttacks = []

  game.settlement = {
    cards: shuffled(cards).slice(0, 3).map(c => ({ ...c })),
    chosen: null,
    loot: game.lootBag.map(item => ({ item, keep: true }))
  }
  if (typeof capStageMaxDrops === 'function') capStageMaxDrops()

  if (isHeadless || game.settlement.loot.length === 0) {
    showStageOverlay()
  } else {
    startLootReview()
  }
}

function startLootReview() {
  currentLootIndex = 0
  showCurrentLootModal()
}

function showCurrentLootModal() {
  if (!game.settlement || currentLootIndex >= game.settlement.loot.length) {
    closeModal('modal-loot-review')
    showStageOverlay()
    return
  }

  const entry = game.settlement.loot[currentLootIndex]
  const item = entry.item
  const total = game.settlement.loot.length

  const stepEl = document.querySelector('#loot-review-step')
  const iconEl = document.querySelector('#loot-review-icon')
  const nameEl = document.querySelector('#loot-review-name')
  const typeEl = document.querySelector('#loot-review-type')
  const descEl = document.querySelector('#loot-review-desc')
  const qiEl = document.querySelector('#loot-review-qi')

  if (stepEl) stepEl.textContent = `战利品清点 · (第 ${currentLootIndex + 1} / ${total} 件)`
  if (iconEl) {
    if (item.id === 'cinnabar') {
      iconEl.innerHTML = '<img src="./skill_gourd.png" class="loot-review-icon-img" alt="赤炎葫芦">'
    } else if (item.id === 'egg') {
      iconEl.innerHTML = '<img src="./skill_fox.png" class="loot-review-icon-img" alt="青羽灵狐">'
    } else if (item.id === 'thunder') {
      iconEl.innerHTML = '<img src="./skill_chain_lightning.png" class="loot-review-icon-img" alt="昊天雷符">'
    } else {
      iconEl.textContent = item.icon || '✧'
    }
  }
  if (nameEl) nameEl.textContent = item.name
  if (typeEl) typeEl.textContent = item.type || '法宝'

  const offensiveMap = { cinnabar: 'fire', egg: 'pet', jade: 'formation', thunder: 'thunder' }
  const mappedId = offensiveMap[item.id]
  let extraDesc = ''
  if (mappedId) {
    const existingSlotIdx = getOffensiveSlotIndex(mappedId)
    if (existingSlotIdx !== -1) {
      extraDesc = `【已置于${['上', '右', '下', '左'][existingSlotIdx]}方槽位，保留将直接升至 Lv.${(game.offensiveSlots[existingSlotIdx].level || 1) + 1} 重！】`
    } else if (getAvailableOffensiveSlotIndex() !== -1) {
      extraDesc = `【将置入${['上', '右', '下', '左'][getAvailableOffensiveSlotIndex()]}方进攻槽位】`
    } else {
      extraDesc = `【4个进攻槽位已满，保留将自动强化或替换】`
    }
  }
  if (descEl) descEl.textContent = (item.desc || '神异之物') + (extraDesc ? ' ' + extraDesc : '')
  const qiVal = item.qi || 20
  if (qiEl) qiEl.textContent = `可熔炼化为 +${qiVal} 点纯阳灵气`

  openModal('modal-loot-review')
}

function showStageOverlay() {
  renderSettlement()
  ui.overlay.classList.remove('hidden')
}


function renderSettlement() {
  const st = game.settlement
  if (!st) return
  ui.stageKicker.textContent = `第 ${game.stage} 关 · 参悟机缘`
  ui.stageTitle.textContent = '天道馈赠 · 选择一张卡片'
  ui.stageDesc.textContent = `本关斩妖 ${game.stageKills}，当前境界 ${realmLabel()}。固定三张卡片，择一纳入构筑。`
  ui.stageLootSummary.textContent = `${st.loot.length} 件`

  // 动态将本命法宝升级卡定制为当前装备武器的专属路线
  for (const card of st.cards) {
    if (card.id === 'sword') {
      const rawType = game.player.weaponType || 'sword'
      const wType = rawType.replace(/^(sword_|spell_|body_)/, '')
      if (isHeadless && (wType === 'sword' || wType === 'qingfeng' || rawType === 'sword_qingfeng')) {
        card.name = '流云飞剑'
        card.copy = '飞剑伤害 +12，并额外发射一柄剑光。'
      } else {
        switch (wType) {
          case 'hammer':
            card.icon = '⚒'
            card.name = '破军金锤 · 撼地裂天'
            card.copy = '金锤伤害 +4，裂地范围 +6px，沉稳重击。'
            break
          case 'ding':
            card.icon = '⛩'
            card.name = '九疑重鼎 · 泰山压顶'
            card.copy = '重鼎伤害 +4，镇压范围 +6px，泰山压顶。'
            break
          case 'dragon_armor':
            card.icon = '🛡'
            card.name = '龙鳞霸甲 · 狂龙出海'
            card.copy = '冲拳伤害 +3，狂龙射程 +8px，拳劲贯通。'
            break
          case 'baozhu':
            card.icon = '🔮'
            card.name = '混元宝珠 · 星河引力'
            card.copy = '宝珠伤害 +3，引力范围 +6px，星河聚引。'
            break
          case 'bagua':
            card.icon = '☯'
            card.name = '八卦阵盘 · 乾坤法阵'
            card.copy = '阵盘伤害 +3，道阵范围 +6px，乾坤诛邪。'
            break
          case 'fuchen':
            card.icon = '🪶'
            card.name = '灵木拂尘 · 碧霄仙风'
            card.copy = '拂尘伤害 +3，仙风范围 +6px，排云荡浊。'
            break
          case 'daggers':
            card.icon = '🗡'
            card.name = '疾风残刃 · 翡翠双绝'
            card.copy = '飞刃伤害 +4，回旋射程 +8px，双刃极速。'
            break
          case 'thunder_sword':
            card.icon = '⚡'
            card.name = '奔雷古剑 · 紫电天劫'
            card.copy = '落雷伤害 +6，天劫连锁额外弹射 +1 个妖物。'
            break
          case 'beast_bell':
            card.icon = '🔔'
            card.name = '百兽金铃 · 万灵摄魂'
            card.copy = '金铃伤害 +4，攻击攻速 +5%，音波激荡万兽慑服。'
            break
          case 'beast_lash':
            card.icon = '➰'
            card.name = '缚兽玄绫 · 狂蟒破空'
            card.copy = '玄绫伤害 +4，攻击攻速 +5%，长绫破空大弧横扫。'
            break
          case 'beast_horn':
            card.icon = '📯'
            card.name = '唤灵法螺 · 苍穹巡天'
            card.copy = '法螺伤害 +4，攻击攻速 +5%，巡天灵鹰贯穿袭杀。'
            break
          case 'formation_flag':
            card.icon = '🚩'
            card.name = '四象诛邪旗 · 四灵诛戮'
            card.copy = '灵旗伤害 +4，攻击攻速 +5%，四象神光锁妖困敌。'
            break
          case 'formation_chess':
            card.icon = '♟'
            card.name = '天星弈棋 · 阴阳天元'
            card.copy = '弈棋伤害 +4，攻击攻速 +5%，黑白棋落引发天元轰爆。'
            break
          case 'formation_ruler':
            card.icon = '📏'
            card.name = '量天玉尺 · 九宫泥潭'
            card.copy = '玉尺伤害 +4，攻击攻速 +5%，九宫重力泥泞强力迟滞。'
            break
          case 'pill_furnace':
            card.icon = '🫕'
            card.name = '紫金八卦炉 · 三昧丹火'
            card.copy = '丹炉伤害 +4，攻击攻速 +5%，喷涌丹火扇面持续灼烧。'
            break
          case 'pill_pestle':
            card.icon = '🦯'
            card.name = '碧玉药王杵 · 碎玉撼地'
            card.copy = '药王杵伤害 +4，攻击攻速 +5%，神杵捣地翠浪碎骨震退。'
            break
          case 'pill_poison':
            card.icon = '🧪'
            card.name = '千草腐仙葫 · 蚀骨酸池'
            card.copy = '腐仙葫伤害 +4，攻击攻速 +5%，抛射剧毒酸池消融妖群。'
            break
          case 'demon_blade':
            card.icon = '🩸'
            card.name = '化血狂刀 · 猩红修罗'
            card.copy = '狂刀伤害 +4，攻击攻速 +5%，猩红刀芒贯穿撕裂路径。'
            break
          case 'demon_claws':
            card.icon = '🐾'
            card.name = '天魔血煞爪 · 裂空碎魂'
            card.copy = '血爪伤害 +4，攻击攻速 +5%，撕裂虚空瞬发爆裂暗劲。'
            break
          case 'demon_seal':
            card.icon = '🧱'
            card.name = '修罗血皇玺 · 崩天覆地'
            card.copy = '血印伤害 +4，攻击攻速 +5%，巨印砸地掀起冲天血浪。'
            break
          case 'ghost_lantern':
            card.icon = '🏮'
            card.name = '幽冥引魂灯 · 碧磷幽煞'
            card.copy = '引魂灯伤害 +4，攻击攻速 +5%，祭出双朵碧磷自适应追踪。'
            break
          case 'ghost_wand':
            card.icon = '🦯'
            card.name = '白骨哀丧棒 · 丧魂音煞'
            card.copy = '哭丧棒伤害 +4，攻击攻速 +5%，全向音煞强力震退近身妖物。'
            break
          case 'ghost_banner':
            card.icon = '🏴'
            card.name = '百鬼聚灵幡 · 万魂螺旋'
            card.copy = '聚灵幡伤害 +4，攻击攻速 +5%，百鬼阴风螺旋突刺穿透。'
            break
          case 'sword':
          case 'sword_qingfeng':
          case 'qingfeng':
            card.icon = '✧'
            card.name = '流云飞剑 · 剑意凌霄'
            card.copy = '飞剑伤害 +8，并额外发射一柄飞剑凌空索敌！'
            break
          default: {
            const def = getWeaponDef(wType)
            const wName = def?.name || '本命神兵'
            card.icon = def?.icon || '✧'
            card.name = `${wName} · 威能蜕变`
            card.copy = `${wName}基础伤害 +4，攻击攻速 +5%，淬炼升阶！`
            break
          }
        }
      }
    } else if (card.id === 'chain_arc') {
      const nextLvl = (game.chainArcLevel || 0) + 1
      const nextN = getChainArcN(nextLvl)
      if ((game.chainArcLevel || 0) > 0) {
        card.copy = `升级至 ${nextLvl} 重：金雷传递增至 ${nextN} 怪，造成主武器伤害的 ${nextN}%（当前 ${game.chainArcLevel} 重）。`
      } else {
        const curN = getChainArcN(1)
        card.copy = `主武器命中时释放金黄电弧，在 ${curN} 个敌怪间传递，造成主武器伤害的 ${curN}%（可随卡片升级）。`
      }
    } else if (card.id === 'blazing_fire') {
      const nextLvl = (game.blazingFireLevel || 0) + 1
      const p = getBlazingFireParams(nextLvl)
      if ((game.blazingFireLevel || 0) > 0) {
        card.copy = `升级至 ${nextLvl} 重：持续灼烧 ${p.burnDmgPct}%/s，真火引爆造成主武器伤害的 ${p.burstDamagePct}%（范围 ${p.burstRadius}px），迸射 ${p.motesCount} 颗飞火流星点燃周围敌群（当前 ${game.blazingFireLevel} 重）。`
      } else {
        const p1 = getBlazingFireParams(1)
        card.copy = `主武器命中施加离火烙印（持续灼烧 ${p1.burnDmgPct}%/s）；敌怪毙命或受重击时引发真火大爆裂（范围伤害 ${p1.burstDamagePct}%），迸射 ${p1.motesCount} 颗飞火流星点燃周围敌群（可随卡片升级）。`
      }
    } else if (isOffensiveItem(card.id)) {
      const existingSlotIdx = getOffensiveSlotIndex(card.id)
      if (existingSlotIdx !== -1) {
        const slot = game.offensiveSlots[existingSlotIdx]
        card.type = '法宝 · 升阶'
        const nextLvl = (slot.level || 1) + 1
        card.copy = `强化【${['上', '右', '下', '左'][existingSlotIdx]}方槽位】法宝至 Lv.${nextLvl} 重，威力大幅提升！`
      } else if (getAvailableOffensiveSlotIndex() !== -1) {
        card.type = '法宝 · 纳新'
        card.copy = `纳入进攻槽位（当前已用 ${getOccupiedOffensiveSlotCount()}/4），自动独立索敌攻击。`
      } else {
        card.type = '法宝 · 替换 (4/4已满)'
        card.copy = `当前 4 个进攻槽位已满！选择此卡需替换一件现有法宝或灵宠。`
      }
    }
  }

  ui.stageChoices.innerHTML = st.cards.map((card, index) => {
    let iconHtml = `<div class="choice-icon">${card.icon}</div>`
    if (card.id === 'fire') {
      iconHtml = `<div class="choice-icon"><img src="./skill_gourd.png" class="choice-icon-img" alt="${card.name}"></div>`
    } else if (card.id === 'pet') {
      iconHtml = `<div class="choice-icon"><img src="./skill_fox.png" class="choice-icon-img" alt="${card.name}"></div>`
    } else if (card.id === 'chain_arc' || card.id === 'thunder') {
      iconHtml = `<div class="choice-icon"><img src="./skill_chain_lightning.png" class="choice-icon-img" alt="${card.name}"></div>`
    } else if (card.id === 'blazing_fire') {
      iconHtml = `<div class="choice-icon"><img src="./skill_blazing_fire.png" class="choice-icon-img" alt="${card.name}"></div>`
    }
    return `
    <button class="choice${st.chosen === index ? ' selected' : ''}" data-card="${index}">
      ${iconHtml}
      <div class="choice-name">${card.name}</div>
      <div class="choice-type">${card.type}</div>
      <div class="choice-copy">${card.copy}</div>
    </button>`
  }).join('')

  ui.stageLoot.innerHTML = st.loot.length
    ? st.loot.map((entry, index) => {
      let iconHtml = entry.item.icon
      if (entry.item.id === 'cinnabar') {
        iconHtml = `<img src="./skill_gourd.png" class="loot-icon-img" alt="${entry.item.name}">`
      } else if (entry.item.id === 'egg') {
        iconHtml = `<img src="./skill_fox.png" class="loot-icon-img" alt="${entry.item.name}">`
      } else if (entry.item.id === 'thunder') {
        iconHtml = `<img src="./skill_chain_lightning.png" class="loot-icon-img" alt="${entry.item.name}">`
      }
      return `
      <div class="loot-row${entry.keep ? '' : ' dropped'}">
        <div class="loot-icon">${iconHtml}</div>
        <div class="loot-copy"><div class="loot-name">${entry.item.name}<span class="loot-type">${entry.item.type}</span></div><div class="loot-desc">${entry.item.desc}</div></div>
        <div class="loot-actions">
          <button class="loot-btn keep${entry.keep ? ' active' : ''}" data-loot="${index}" data-keep="1">保留</button>
          <button class="loot-btn drop${entry.keep ? '' : ' active'}" data-loot="${index}" data-keep="0">放弃 +${entry.item.qi}</button>
        </div>
      </div>`
    }).join('')
    : '<div class="loot-empty">本关没有拾得物品。妖物掉落带有随机性，下一关再试。</div>'

  ui.stageLootAll.classList.toggle('hidden', st.loot.length === 0)
  ui.stageLootAll.textContent = `全部放弃（+${st.loot.reduce((sum, entry) => sum + entry.item.qi, 0)} 灵气）`
  ui.stageContinue.disabled = st.chosen === null
  ui.stageContinue.textContent = st.chosen === null ? '请先选择卡片' : '进入下一关'

  ui.stageChoices.querySelectorAll('[data-card]').forEach(button => button.addEventListener('click', () => {
    sound.click()
    const cardIdx = Number(button.dataset.card)
    const card = st.cards[cardIdx]

    if (isOffensiveItem(card.id) && getOffensiveSlotIndex(card.id) === -1 && getOccupiedOffensiveSlotCount() >= 4) {
      openSlotReplaceModal(cardIdx, card)
      return
    }

    game.settlement.chosen = cardIdx
    renderSettlement()
  }))

  ui.stageLoot.querySelectorAll('[data-loot]').forEach(button => button.addEventListener('click', () => {
    sound.click()
    game.settlement.loot[Number(button.dataset.loot)].keep = button.dataset.keep === '1'
    renderSettlement()
  }))

  // 渲染结算界面底部的构筑小方块排布与属性列表
  const allItems = [...game.weapons, ...game.formations, ...game.passives, ...game.pets, ...game.treasures]
  const buildTilesEl = document.querySelector('#build-tiles')
  const buildCountEl = document.querySelector('#build-grid-count')
  if (buildCountEl) buildCountEl.textContent = `共 ${allItems.length} 件`
  if (buildTilesEl) {
    if (!allItems.length) {
      buildTilesEl.innerHTML = '<div class="build-tile-empty">初涉仙途，暂无法宝法门</div>'
    } else {
      buildTilesEl.innerHTML = allItems.map(item => {
        let iconHtml = `<span class="tile-icon">${item.icon}</span>`
        if (item.id === 'fire') {
          iconHtml = `<img src="./skill_gourd.png" class="tile-icon-img" alt="${item.name}">`
        } else if (item.id === 'pet') {
          iconHtml = `<img src="./skill_fox.png" class="tile-icon-img" alt="${item.name}">`
        } else if (item.id === 'chain_arc' || item.id === 'thunder') {
          iconHtml = `<img src="./skill_chain_lightning.png" class="tile-icon-img" alt="${item.name}">`
        } else if (item.id === 'blazing_fire') {
          iconHtml = `<img src="./skill_blazing_fire.png" class="tile-icon-img" alt="${item.name}">`
        }
        return `
        <div class="build-tile" title="${item.name} (${item.type})&#10;${item.detail}">
          ${iconHtml}
          ${item.count > 1 ? `<span class="tile-badge">×${item.count}</span>` : ''}
        </div>`
      }).join('')
    }
  }

  const statsListEl = document.querySelector('#stage-stats-list')
  if (statsListEl) {
    statsListEl.innerHTML = `
      <div class="stage-stat-row"><span>入世弟子</span><b class="gold">${game.player.charName || '凌虚子'}</b></div>
      <div class="stage-stat-row"><span>境界阶位</span><b class="gold">${realmLabel()}</b></div>
      <div class="stage-stat-row"><span>灵气修为</span><b>${game.xp} / ${game.xpNeed}</b></div>
      <div class="stage-stat-row"><span>气血生命</span><b>${Math.ceil(game.hp)} / ${game.maxHp}</b></div>
      <div class="stage-stat-row"><span>体魄加成</span><b>基 ${game.baseHp} (${game.bonusHp >= 0 ? '+' : ''}${game.bonusHp})</b></div>
      <div class="stage-stat-row"><span>神识范围</span><b class="gold">${game.attackRange || 140} px</b></div>
      <div class="stage-stat-row"><span>法宝伤害</span><b>${game.attack} 点</b></div>
      <div class="stage-stat-row"><span>攻击频率</span><b>${(1 / Math.max(.18, .78 / game.attackSpeed)).toFixed(1)} /s</b></div>
      <div class="stage-stat-row"><span>御风移速</span><b>${Math.round(game.moveSpeed)} px/s</b></div>
      <div class="stage-stat-row"><span>灵引吸附</span><b>${game.pickup} px</b></div>
      <div class="stage-stat-row"><span>累计斩妖</span><b>${game.kills} 只</b></div>
    `
  }
}

function openSlotReplaceModal(cardIdx, card) {
  const modal = document.querySelector('#modal-slot-replace')
  if (!modal) return
  const nameEl = document.querySelector('#replace-new-name')
  if (nameEl) nameEl.textContent = card.name

  const listEl = document.querySelector('#slot-replace-list')
  if (listEl && game.offensiveSlots) {
    const dirNames = ['上方', '右方', '下方', '左方']
    listEl.innerHTML = game.offensiveSlots.map((slot, i) => {
      if (!slot) return ''
      let iconHtml = slot.image ? `<img src="${slot.image}" class="replace-slot-img" alt="${slot.name}">` : `<span class="replace-slot-icon">${slot.icon || '◈'}</span>`
      return `
      <div class="slot-replace-item" data-replace-slot="${i}">
        <div class="replace-slot-dir">${dirNames[i]}槽位</div>
        <div class="replace-slot-icon-box">${iconHtml}</div>
        <div class="replace-slot-info">
          <div class="replace-slot-name">${slot.name} <span class="replace-slot-lvl">Lv.${slot.level || 1}</span></div>
          <div class="replace-slot-detail">${slot.detail || ''}</div>
        </div>
        <button class="replace-slot-btn" type="button" data-replace-slot="${i}">替换此槽位</button>
      </div>`
    }).join('')

    listEl.querySelectorAll('[data-replace-slot]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        const slotIdx = Number(el.dataset.replaceSlot)
        sound.click()
        replaceOffensiveSlot(slotIdx, card.id)
        if (game.settlement) {
          game.settlement.chosen = cardIdx
          game.settlement.alreadyAppliedReplacement = true
        }
        closeModal('modal-slot-replace')
        renderSettlement()
      })
    })
  }

  const cancelBtn = document.querySelector('#btn-slot-replace-cancel')
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      sound.click()
      closeModal('modal-slot-replace')
    }
  }

  const closeBtn = document.querySelector('#btn-slot-replace-close')
  if (closeBtn) {
    closeBtn.onclick = () => {
      sound.click()
      closeModal('modal-slot-replace')
    }
  }

  openModal('modal-slot-replace')
}

ui.stageLootAll.addEventListener('click', () => {
  if (!game.settlement) return
  game.settlement.loot.forEach(entry => { entry.keep = false })
  renderSettlement()
})

ui.stageContinue.addEventListener('click', () => {
  if (!game.settlement || game.settlement.chosen === null) return
  confirmSettlement()
})

function confirmSettlement() {
  const st = game.settlement
  const card = st.cards[st.chosen]
  if (st && st.alreadyAppliedReplacement) {
    addLog(`第 ${game.stage} 关：替换置入新法宝「${card.name}」。`, true)
  } else {
    card.apply()
    addLog(`第 ${game.stage} 关：纳入「${card.name}」。`, true)
  }

  let converted = 0
  for (const entry of st.loot) {
    if (entry.keep) {
      entry.item.apply()
      addBuild(game.treasures, { id: entry.item.id, name: entry.item.name, icon: entry.item.icon, type: entry.item.type, detail: entry.item.desc, count: 1 })
    } else converted += entry.item.qi
  }
  if (converted > 0) { addLog(`放弃物品，转化为 ${converted} 点灵气。`, true); gainXp(converted) }

  game.settlement = null
  game.stage += 1
  game.stageTime = STAGE_SECONDS
  game.stageElapsed = 0
  game.stageKills = 0
  if (typeof initStageDropTracker === 'function') initStageDropTracker()
  game.spawnTimer = 0
  const recovered = Math.min(15, game.maxHp - game.hp)
  game.hp = Math.min(game.maxHp, game.hp + 15)
  game.player.x = ARENA_WIDTH / 2
  game.player.y = ARENA_HEIGHT / 2
  game.paused = false
  ui.overlay.classList.add('hidden')
  if (!isHeadless && isMaxRealmMaxLevel() && (game.bossesDefeated >= 4) && !game.primordialGodEncountered) {
    game.pendingBossStage = true
    game.primordialGodEncountered = true
  }
  if (game.pendingBossStage) {
    game.pendingBossStage = false
    startBossStage()
  } else {
    game.isBossStage = false
    stopBossStage()
    addLog(`第 ${game.stage} 关开始，倒计时 ${STAGE_SECONDS} 秒。${recovered > 0 ? `战后调息回复 ${Math.round(recovered)} 点生命。` : ''}`, true)
  }
  updateUI()
}

function endRun() {
  game.gameOver = true
  game.paused = true
  game.settlement = null
  game.player.invuln = 0
  game.specialAttacks = []
  if (typeof stopBossStage === 'function') stopBossStage()
  game.isBossStage = false
  game.pendingBossStage = false
  game.primordialGodEncountered = false
  game.primordialGodTriggered = false
  game.boss = null
  game.bossAoEs = []
  game.bossProjectiles = []
  const bossHud = document.querySelector('#boss-hud-bar')
  if (bossHud) bossHud.classList.add('hidden')
  ui.overlay.classList.remove('hidden')
  if (game.isEndlessMode) {
    ui.stageKicker.textContent = '无尽试炼 · 力竭兵解'
    ui.stageTitle.textContent = '道途未绝'
    const mins = Math.floor((game.endlessElapsed || 0) / 60)
    const secs = Math.floor((game.endlessElapsed || 0) % 60)
    const timeStr = `${mins}分${secs}秒`
    ui.stageDesc.textContent = `你在无尽模式支撑了 ${timeStr}，共斩妖 ${game.kills} 尊，化神圆满，名垂修仙界！`
  } else {
    ui.stageKicker.textContent = '心魔侵入 · 历练终止'
    ui.stageTitle.textContent = '道途未绝'
    ui.stageDesc.textContent = `你在第 ${game.stage} 关倒下，共斩妖 ${game.kills}，境界停留于「${realmNames[game.realm]}${subStageNames[game.subStage] || ''}」。`
  }
  ui.stageChoices.innerHTML = ''
  ui.stageLoot.innerHTML = '<div class="loot-empty">未清点的物品随道消云散。</div>'
  ui.stageLootSummary.textContent = '0 件'
  ui.stageLootAll.classList.add('hidden')
  ui.stageContinue.disabled = false
  ui.stageContinue.textContent = '重新入世'
  ui.stageContinue.onclick = () => {
    sound.click()
    if (isHeadless) {
      location.reload()
    } else {
      ui.overlay.classList.add('hidden')
      if (typeof stopBossStage === 'function') stopBossStage()
      showScreen('title')
    }
  }
}

/* ---------- UI 刷新 ---------- */

function updateUI() {
  if (ui.hp) ui.hp.textContent = `${Math.max(0, Math.ceil(game.hp))} / ${game.maxHp}`
  if (ui.xp) ui.xp.textContent = `${game.xp} / ${game.xpNeed}`
  if (ui.hpBar) ui.hpBar.style.width = `${Math.max(0, Math.min(100, game.hp / game.maxHp * 100))}%`
  if (ui.xpBar) ui.xpBar.style.width = `${Math.min(100, game.xp / game.xpNeed * 100)}%`
  if (ui.kills) ui.kills.textContent = game.kills
  const rangeVal = document.querySelector('#range-value')
  if (rangeVal) rangeVal.textContent = String(Math.round(game.attackRange || 140))
  if (ui.range) ui.range.textContent = String(Math.round(game.attackRange || 140))
  if (ui.realmRange) ui.realmRange.textContent = String(Math.round(game.attackRange || 140))
  if (game.isEndlessMode) {
    const eSec = Math.floor(game.endlessElapsed || 0)
    const m = String(Math.floor(eSec / 60)).padStart(2, '0')
    const s = String(eSec % 60).padStart(2, '0')
    if (ui.timer) ui.timer.textContent = `无尽 · ${m}:${s}`
    if (ui.arenaRealm) ui.arenaRealm.textContent = '无尽试炼 · 化神境'
  } else {
    if (ui.timer) ui.timer.textContent = formatTime(game.stageTime)
    if (ui.arenaRealm) {
      if (game.isBossStage && game.boss) {
        ui.arenaRealm.textContent = game.boss.id === 'primordial_god'
          ? `第 ${game.stage} 关 · 终极飞升劫`
          : `第 ${game.stage} 关 · 领主战 (${game.boss.name})`
      } else {
        ui.arenaRealm.textContent = `第 ${game.stage} 关 · ${realmLabel()}`
      }
    }
  }
  if (ui.realmName) ui.realmName.textContent = realmNames[game.realm]
  if (ui.realmLevel) ui.realmLevel.textContent = subStageNames[game.subStage]
  if (ui.realmProgress) ui.realmProgress.style.width = `${Math.min(100, game.xp / game.xpNeed * 100)}%`
  if (ui.realmCaption) ui.realmCaption.textContent = `灵气 ${game.xp} / ${game.xpNeed}`
  if (ui.realmNext) {
    if (typeof isMaxRealmMaxLevel === 'function' && isMaxRealmMaxLevel()) {
      ui.realmNext.textContent = '化神圆满 · 已登绝顶（待迎飞升劫）'
    } else if (isMaxRealm()) {
      ui.realmNext.textContent = `距化神圆满还需 ${game.xpNeed - game.xp}`
    } else {
      ui.realmNext.textContent = `距离${nextStageLabel()}还需 ${game.xpNeed - game.xp}`
    }
  }
  if (ui.realmBaseHp) ui.realmBaseHp.textContent = String(game.baseHp)
  if (ui.realmBonusHp) ui.realmBonusHp.textContent = `${game.bonusHp >= 0 ? '+' : ''}${game.bonusHp}`
  if (ui.threat) ui.threat.textContent = game.stage >= 8 ? '凶险' : game.stage >= 4 ? '上升' : '安稳'
  if (ui.heroStatus) ui.heroStatus.textContent = game.stage >= 8 ? '妖潮汹涌，谨慎行事' : game.stage >= 4 ? '关卡渐深，丹火初生' : '筑基之前，皆为积累'
  if (ui.intelNext) ui.intelNext.textContent = `第 ${game.stage + 1} 关强度`
  if (ui.intelLoot) ui.intelLoot.textContent = `本关物品 ${(game.stageItemDrops !== undefined ? game.stageItemDrops : game.lootBag.length)} 件`

  const items = [...game.weapons, ...game.formations, ...game.passives, ...game.pets, ...game.treasures]
  if (ui.build) {
    ui.build.innerHTML = items.length
      ? items.map(item => `<div class="build-item"><div class="build-icon">${item.icon}</div><div class="build-copy"><div class="build-name">${item.name}</div><div class="build-detail">${item.detail}</div></div><div class="build-count">×${item.count}</div></div>`).join('')
      : '<div class="empty-build">暂无额外机缘。每关结算可择一张卡片。</div>'
  }

  if (!isHeadless) {
    updateCharStatusHUD()
    updateWeaponSlotHUD()
  }
}

/* ---------- 绘制 ---------- */




function drawProjectileModel(proj, elapsed) {
  ctx.save()
  const angle = Math.atan2(proj.vy, proj.vx)
  ctx.translate(proj.x, proj.y)
  ctx.rotate(angle)

  const kind = proj.kind || 'sword'

  if (proj.color === '#e9865b' || kind === 'fire') {
    const flameLen = 18
    const flameGrad = ctx.createLinearGradient(-flameLen, 0, 8, 0)
    flameGrad.addColorStop(0, 'rgba(233, 134, 91, 0)')
    flameGrad.addColorStop(0.5, 'rgba(245, 110, 50, 0.7)')
    flameGrad.addColorStop(1, 'rgba(255, 230, 150, 0.95)')
    ctx.fillStyle = flameGrad
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-flameLen, -5); ctx.lineTo(-flameLen * 0.6, 0); ctx.lineTo(-flameLen, 5); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#fff4d4'; ctx.beginPath(); ctx.arc(3, 0, 4, 0, Math.PI * 2); ctx.fill()
  } else if (kind === 'daggers' || kind === 'dagger') {
    ctx.rotate(elapsed * 22)
    ctx.fillStyle = '#8bf3c0'
    ctx.beginPath(); ctx.arc(0, 0, 9, -Math.PI * 0.6, Math.PI * 0.6); ctx.quadraticCurveTo(0, 0, 0, 0); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#f0fdf4'; ctx.lineWidth = 1.2; ctx.stroke()
  } else if (kind === 'thunder_sword') {
    ctx.fillStyle = '#a5bdf8'; ctx.fillRect(-10, -3, 20, 6)
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-8, -1.2, 16, 2.4)
    ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 1.5; ctx.beginPath()
    ctx.moveTo(-14, 0); ctx.lineTo(-7, -4); ctx.lineTo(-2, 3); ctx.lineTo(6, -3); ctx.lineTo(12, 0); ctx.stroke()
  } else if (kind === 'bagua') {
    ctx.rotate(elapsed * 16)
    ctx.fillStyle = 'rgba(238, 213, 125, 0.85)'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI); ctx.fill()
  } else if (kind === 'fuchen') {
    // 碧霞仙浪扇面：银白渐至冰蓝，与清虚仙子同色系（原为高饱和薄荷绿）
    const fanGrad = ctx.createLinearGradient(16, 0, -10, 0)
    fanGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    fanGrad.addColorStop(0.5, 'rgba(207, 230, 240, 0.85)')
    fanGrad.addColorStop(1, 'rgba(176, 208, 226, 0)')
    ctx.fillStyle = fanGrad
    ctx.beginPath()
    ctx.moveTo(-10, 0)
    ctx.lineTo(13, -10)
    ctx.quadraticCurveTo(19, 0, 13, 10)
    ctx.closePath()
    ctx.fill()
    // 拂丝高光：几道银白细弧
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.lineWidth = 1
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(-8, i * 2.5)
      ctx.quadraticCurveTo(4, i * 6.5, 14, i * 8)
      ctx.stroke()
    }
  } else if (kind === 'baozhu') {
    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 8)
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#d8b4fe'); grad.addColorStop(1, 'rgba(168, 85, 247, 0)')
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill()
  } else if (kind === 'ding') {
    ctx.rotate(elapsed * 10)
    ctx.fillStyle = '#b45309'; ctx.fillRect(-7, -6, 14, 11)
    ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.2; ctx.strokeRect(-7, -6, 14, 11)
  } else if (kind === 'dragon_armor' || kind === 'dragon_scale') {
    ctx.rotate(elapsed * 18)
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(0, -6); ctx.lineTo(-7, 0); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill()
  } else if (kind === 'hammer') {
    ctx.rotate(elapsed * 15)
    ctx.fillStyle = '#ea580c'; ctx.fillRect(-6, -6, 12, 12)
    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5; ctx.strokeRect(-6, -6, 12, 12)
  } else {
    const trailLen = 32
    const trailGrad = ctx.createLinearGradient(-trailLen, 0, 2, 0)
    trailGrad.addColorStop(0, 'rgba(128, 220, 200, 0)')
    trailGrad.addColorStop(0.6, 'rgba(180, 235, 220, 0.35)')
    trailGrad.addColorStop(1, 'rgba(245, 235, 180, 0.75)')
    ctx.fillStyle = trailGrad
    ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-trailLen, -3.5); ctx.lineTo(-trailLen * 0.5, 0); ctx.lineTo(-trailLen, 3.5); ctx.closePath(); ctx.fill()

    ctx.fillStyle = '#eaf5f0'
    ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(0, -2.5); ctx.lineTo(-4, -2.2); ctx.lineTo(-4, 2.2); ctx.lineTo(0, 2.5); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#fff8da'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-4, 0); ctx.stroke()
    ctx.fillStyle = '#c9a24d'; ctx.fillRect(-5.5, -4, 2, 8)
    ctx.fillStyle = '#5c432d'; ctx.fillRect(-8.5, -1.3, 3, 2.6)
    ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(-9, 0, 1.5, 0, Math.PI * 2); ctx.fill()
  }

  ctx.restore()
}

function drawVectorPlayerModel(ctx, p, charId, facingRight, lungeX, lungeY, walkBob, legSwing, windSway, isAttacking, attackProgress, sq) {
  ctx.save()
  ctx.translate(p.x + lungeX, p.y + walkBob + lungeY)
  const sx = (facingRight ? 1 : -1) * (sq ? sq.scaleX : 1)
  const sy = sq ? sq.scaleY : 1
  ctx.scale(sx, sy)
  const attackTilt = isAttacking ? (Math.sin((1 - attackProgress) * Math.PI) * 0.1) : 0
  ctx.rotate(attackTilt)

  if (charId === 'spell') {
    // === 清虚仙子 (法修 · 女仙) ===
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(-3 - legSwing, 4, 3, 3); ctx.fillRect(1 + legSwing, 4, 3, 3)
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, -4); ctx.quadraticCurveTo(8, 2, 5 + legSwing * 0.4, 5); ctx.quadraticCurveTo(-4, 6, -10 + windSway, 4); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#f0f9ff'
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(2, 4); ctx.lineTo(-1, 4.5); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#c084fc'; ctx.fillRect(-4, -6, 8, 2.6)
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(-4, -13); ctx.lineTo(4, -13); ctx.lineTo(3.5, -6); ctx.lineTo(-4, -6); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.85)'; ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.moveTo(-6, -11); ctx.quadraticCurveTo(-15 + windSway, -8, -14 + windSway, 6); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(6, -11); ctx.quadraticCurveTo(12, -4, 15 + windSway, 8); ctx.stroke()
    ctx.fillStyle = '#fcefe6'; ctx.beginPath(); ctx.arc(7, -8, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fdf2e9'; ctx.fillRect(-1.5, -15, 3, 2.5)
    ctx.beginPath(); ctx.moveTo(-3, -19); ctx.lineTo(3, -19); ctx.quadraticCurveTo(4, -16, 2.5, -14); ctx.lineTo(-2.5, -14); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -16.5, 1.8, 1.4)
    ctx.fillStyle = '#0f172a'
    ctx.beginPath(); ctx.arc(0, -19, 4.2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(-2.5, -23, 2.2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(2.5, -23, 2.2, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#5eead4'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(-3, -24); ctx.lineTo(3, -24); ctx.stroke()
  } else if (charId === 'body') {
    // === 铁狂徒 (体修 · 武狂) ===
    ctx.fillStyle = '#78350f'; ctx.fillRect(-5 - legSwing, 4, 4.2, 3.5); ctx.fillRect(1 + legSwing, 4, 4.2, 3.5)
    ctx.fillStyle = '#b91c1c'
    ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(5, -4); ctx.lineTo(6, 4.5); ctx.lineTo(-6, 4.5); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.4; ctx.stroke()
    ctx.fillStyle = '#78350f'; ctx.fillRect(-5.5, -6.5, 11, 3.5)
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(-1.5, -6.5, 3, 3.5)
    ctx.fillStyle = '#991b1b'; ctx.fillRect(-6, -14, 12, 8)
    ctx.fillStyle = '#d97706'; ctx.fillRect(-4, -13, 8, 6)
    ctx.fillStyle = '#f5dfd0'; ctx.fillRect(4, -12, 4, 7)
    ctx.fillStyle = '#78350f'; ctx.fillRect(6, -8, 4, 4)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'; ctx.beginPath(); ctx.arc(8, -6, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#f5dfd0'; ctx.fillRect(-2, -16, 4, 3)
    ctx.fillStyle = '#172554'; ctx.fillRect(0.8, -17.5, 2.2, 1.6)
    ctx.fillStyle = '#18181b'; ctx.beginPath(); ctx.arc(0, -20, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#dc2626'; ctx.fillRect(-3, -22, 6, 2)
  } else if (charId === 'beast') {
    // === 白灵儿 (灵兽师 · 翠羽御兽) ===
    ctx.fillStyle = '#fef08a'; ctx.fillRect(-4 - legSwing, 4, 3.5, 3); ctx.fillRect(1 + legSwing, 4, 3.5, 3)
    ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, -4); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.fillStyle = '#065f46'; ctx.fillRect(-4, -12, 8, 8)
    ctx.fillStyle = '#fef9c3'; ctx.fillRect(-1.5, -15, 3, 2.5)
    ctx.fillStyle = '#047857'; ctx.beginPath(); ctx.arc(0, -18, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(-3, -21, 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(3, -21, 2, 0, Math.PI * 2); ctx.fill()
  } else if (charId === 'formation_master') {
    // === 诸葛玄清 (阵法师 · 乾坤弈圣) ===
    ctx.fillStyle = '#312e81'; ctx.fillRect(-4 - legSwing, 4, 3.5, 3.5); ctx.fillRect(1 + legSwing, 4, 3.5, 3.5)
    ctx.fillStyle = '#4338ca'; ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(5, -4); ctx.lineTo(6, 5); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.fillStyle = '#1e1b4b'; ctx.fillRect(-4.5, -13, 9, 9)
    ctx.fillStyle = '#fdf2e9'; ctx.fillRect(-1.5, -15, 3, 2.5)
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(0, -19, 4.2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#a855f7'; ctx.fillRect(-1, -23, 2, 4)
  } else if (charId === 'alchemist') {
    // === 云舒 (丹药师 · 药圣妙手) ===
    ctx.fillStyle = '#14532d'; ctx.fillRect(-4 - legSwing, 4, 3.5, 3); ctx.fillRect(1 + legSwing, 4, 3.5, 3)
    ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, -4); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#bef264'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillStyle = '#166534'; ctx.fillRect(-4, -12, 8, 8)
    ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.arc(4, -6, 2.5, 0, Math.PI * 2); ctx.fill() // 药葫芦
    ctx.fillStyle = '#fdf2e9'; ctx.fillRect(-1.5, -15, 3, 2.5)
    ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(0, -18, 4, 0, Math.PI * 2); ctx.fill()
  } else if (charId === 'demon') {
    // === 厉苍溟 (魔修 · 天煞狂徒) ===
    ctx.fillStyle = '#450a0a'; ctx.fillRect(-5 - legSwing, 4, 4, 3.5); ctx.fillRect(1 + legSwing, 4, 4, 3.5)
    ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(5, -4); ctx.lineTo(6, 5); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.4; ctx.stroke()
    ctx.fillStyle = '#1c1917'; ctx.fillRect(-5, -13, 10, 9)
    ctx.fillStyle = '#ef4444'; ctx.fillRect(-3, -11, 6, 2)
    ctx.fillStyle = '#fca5a5'; ctx.fillRect(-1.5, -15, 3, 2.5)
    ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(0, -19, 4.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(-2, -21); ctx.lineTo(-4, -25); ctx.lineTo(-1, -22); ctx.closePath(); ctx.fill()
    ctx.beginPath(); ctx.moveTo(2, -21); ctx.lineTo(4, -25); ctx.lineTo(1, -22); ctx.closePath(); ctx.fill() // 恶魔角
  } else if (charId === 'ghost') {
    // === 幽月 (鬼修 · 黄泉引渡) ===
    ctx.fillStyle = '#134e4a'; ctx.fillRect(-3 - legSwing, 4, 3, 3); ctx.fillRect(1 + legSwing, 4, 3, 3)
    ctx.fillStyle = '#115e59'; ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, -4); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#2dd4bf'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.fillStyle = '#042f2e'; ctx.fillRect(-4, -12, 8, 8)
    ctx.fillStyle = '#f0fdfa'; ctx.fillRect(-1.5, -15, 3, 2.5)
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(0, -18, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#2dd4bf'; ctx.beginPath(); ctx.arc(5, -12, 1.8, 0, Math.PI * 2); ctx.fill() // 鬼火
  } else {
    // === 凌虚子 (剑修 · 默认) ===
    ctx.fillStyle = '#111718'; ctx.fillRect(-4 - legSwing, 4, 3.5, 3.5); ctx.fillRect(1 + legSwing, 4, 3.8, 3.5)
    ctx.fillStyle = '#d4af37'; ctx.fillRect(-4 - legSwing, 6.5, 3.5, 1); ctx.fillRect(1 + legSwing, 6.5, 3.8, 1)

    ctx.fillStyle = '#17362f'
    ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(5, -4); ctx.quadraticCurveTo(8, 2, 5 + legSwing * 0.5, 5); ctx.quadraticCurveTo(-5, 6, -11 + windSway, 4); ctx.quadraticCurveTo(-7, 0, -4, -4); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillStyle = '#e4f0e9'; ctx.beginPath(); ctx.moveTo(1, -3); ctx.lineTo(3, 4); ctx.lineTo(0, 4.5); ctx.closePath(); ctx.fill()

    ctx.fillStyle = '#0a1614'; ctx.fillRect(-4.5, -6, 9.5, 3)
    ctx.fillStyle = '#d4af37'; ctx.fillRect(-0.5, -6, 2, 3)
    ctx.fillStyle = '#64c8a0'; ctx.beginPath(); ctx.arc(-1, -1.5, 1.8, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#edf5f0'; ctx.beginPath(); ctx.moveTo(-1, -14); ctx.lineTo(2, -8); ctx.lineTo(-2, -6); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#1d4239'; ctx.beginPath(); ctx.moveTo(-4.5, -14); ctx.lineTo(4.5, -14); ctx.lineTo(4, -6); ctx.lineTo(-4.5, -6); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#c9a24d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -14); ctx.lineTo(1, -7); ctx.stroke()

    ctx.fillStyle = '#15312a'; ctx.beginPath(); ctx.moveTo(-4, -13); ctx.quadraticCurveTo(-11, -10, -12 + windSway, -4); ctx.quadraticCurveTo(-8, -3, -4, -6); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#1d4239'; ctx.beginPath(); ctx.moveTo(3, -13); ctx.lineTo(9, -9); ctx.lineTo(7, -6); ctx.lineTo(2, -9); ctx.closePath(); ctx.fill()

    ctx.fillStyle = '#fcefe6'; ctx.beginPath(); ctx.arc(8.5, -9, 1.6, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(9, -10.5, 3.5, 1.4)
    ctx.fillStyle = '#a8ede0'; ctx.beginPath(); ctx.arc(13, -10, 1.8, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#f5dfd0'; ctx.fillRect(-1.5, -16, 3, 2.5)
    ctx.fillStyle = '#fcefe6'; ctx.beginPath(); ctx.moveTo(-3.5, -21); ctx.lineTo(3.5, -21); ctx.quadraticCurveTo(4.5, -17, 3, -14.5); ctx.lineTo(0.5, -13.5); ctx.lineTo(-3, -15); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#1b2426'; ctx.fillRect(0.5, -18.5, 3, 1)
    ctx.fillStyle = '#17282c'; ctx.fillRect(1, -17, 2.2, 1.6)

    ctx.fillStyle = '#13191a'; ctx.beginPath(); ctx.arc(0, -20.5, 4.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillRect(-2, -26, 4, 3.5)
    ctx.fillStyle = '#e8f5f0'; ctx.fillRect(-1.5, -26.5, 3, 2)
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3.5, -25.5); ctx.lineTo(3.5, -25.5); ctx.stroke()
    ctx.fillStyle = '#13191a'; ctx.beginPath(); ctx.moveTo(-2, -23); ctx.quadraticCurveTo(-8, -21 + windSway, -13 + windSway, -11); ctx.quadraticCurveTo(-8, -13, -3, -18); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#cf392e'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-2, -23); ctx.quadraticCurveTo(-9, -23 + windSway, -15 + windSway, -13); ctx.stroke()
  }

  ctx.restore()
}

function drawPlayerModel(p, elapsed) {
  ctx.save()

  const isMoving = keys.has('w') || keys.has('s') || keys.has('a') || keys.has('d') ||
                   keys.has('arrowup') || keys.has('arrowdown') || keys.has('arrowleft') || keys.has('arrowright')
  const walkBob = isMoving ? Math.sin(elapsed * 14) * 1.5 : Math.sin(elapsed * 4) * 0.8
  const legSwing = isMoving ? Math.sin(elapsed * 14) * 3 : 0
  const windSway = Math.sin(elapsed * 6) * 1.8

  ctx.fillStyle = 'rgba(5, 12, 16, 0.42)'
  ctx.beginPath()
  ctx.ellipse(p.x, p.y + 7, 14, 5.5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(p.x, p.y + 7)
  ctx.scale(1, 0.38)
  ctx.rotate(elapsed * 1.1)

  ctx.strokeStyle = 'rgba(214, 188, 110, 0.55)'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(0, 0, 22, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(128, 200, 175, 0.38)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 5])
  ctx.beginPath()
  ctx.arc(0, 0, 17, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = 'rgba(235, 245, 240, 0.35)'
  ctx.beginPath()
  ctx.arc(0, 0, 15, -Math.PI / 2, Math.PI / 2)
  ctx.arc(0, 7.5, 7.5, Math.PI / 2, -Math.PI / 2, true)
  ctx.arc(0, -7.5, 7.5, Math.PI / 2, -Math.PI / 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(26, 48, 42, 0.45)'
  ctx.beginPath()
  ctx.arc(0, 0, 15, Math.PI / 2, -Math.PI / 2)
  ctx.arc(0, -7.5, 7.5, -Math.PI / 2, Math.PI / 2, true)
  ctx.arc(0, 7.5, 7.5, -Math.PI / 2, Math.PI / 2)
  ctx.fill()
  ctx.restore()

  const isAttacking = (p.attackTimer || 0) > 0
  const attackProgress = isAttacking ? (p.attackTimer / 0.22) : 0
  const lungeDist = isAttacking ? Math.sin((1 - attackProgress) * Math.PI) * 5 : 0
  const lungeX = isAttacking ? Math.cos(p.attackAngle || 0) * lungeDist : 0
  const lungeY = isAttacking ? Math.sin(p.attackAngle || 0) * lungeDist * 0.5 : 0

  let facingRight = true
  if (isAttacking) {
    facingRight = Math.cos(p.attackAngle || 0) >= 0
  } else {
    const target = nearestEnemy(p)
    if (target) {
      facingRight = target.x >= p.x
    } else if (p.facing !== undefined) {
      facingRight = Math.cos(p.facing) >= 0
    }
  }

  const charId = p.charId || 'sword'
  const sprite = charSprites[charId] || charSprites.sword

  const sq = (typeof getSpriteSquash === 'function')
    ? getSpriteSquash(elapsed, isMoving, isAttacking, attackProgress, p.invuln > 0.4 ? (p.invuln - 0.4) : 0)
    : { scaleX: 1, scaleY: 1 }

  // 剑修 / 法修 的本命法宝专属动作序列帧贴图 (Action Spritesheets)
  // 其余职业没有帧集时 getPlayerWeaponSheet 返回 null，自动回退到各自专属立绘
  const weaponSheet = typeof getPlayerWeaponSheet === 'function' ? getPlayerWeaponSheet(p) : null
  const useSheet = Boolean(weaponSheet && weaponSheet.loaded && weaponSheet.img)
  let frameIdx = 0

  if (useSheet) {
    if (isAttacking) {
      // p.attackTimer 从 0.28 倒数至 0
      const attackElapsed = Math.max(0, Math.min(1, 1 - (p.attackTimer / 0.28)))
      if (attackElapsed < 0.15) {
        frameIdx = 1 // 招式起手 / 踏步前突
      } else if (attackElapsed < 0.42) {
        frameIdx = 2 // 蓄力引剑 / 双刃旋起 / 引雷入体
      } else if (attackElapsed < 0.70) {
        frameIdx = 3 // 招式巅峰！青锋贯日 / 翡翠风暴 / 雷霆力劈
      } else if (attackElapsed < 0.88) {
        frameIdx = 4 // 剑芒破空 / 风暴残影 / 紫电爆裂
      } else {
        frameIdx = 5 // 气劲回流收式
      }
    } else if (isMoving) {
      // 移动奔跑状态：双帧步频交替律动 (帧 0 待机 与 帧 1 踏步)
      frameIdx = (Math.floor(elapsed * 7) % 2 === 0) ? 0 : 1
    } else {
      // 悠然待机：迎风仗剑姿态 (帧 0)，配合 squashing 呼吸起伏
      frameIdx = 0
    }
    p._weaponSheet = weaponSheet
    p._actionFrameIdx = frameIdx
  }

  if (useSheet || (sprite && sprite.loaded && sprite.img)) {
    ctx.save()
    ctx.translate(p.x + lungeX, p.y + walkBob + lungeY)
    ctx.scale((facingRight ? 1 : -1) * sq.scaleX, sq.scaleY)

    // 8 大修仙角色专属命格灵气光环 (Spiritual Aura)
    let auraColor = 'rgba(80, 205, 170, 0.22)'
    let auraGlow = '#64e8cb'
    if (charId === 'spell') {
      auraColor = 'rgba(168, 214, 255, 0.25)'; auraGlow = '#38bdf8'
    } else if (charId === 'body') {
      auraColor = 'rgba(245, 158, 11, 0.26)'; auraGlow = '#f59e0b'
    } else if (charId === 'beast') {
      auraColor = 'rgba(16, 185, 129, 0.25)'; auraGlow = '#10b981'
    } else if (charId === 'formation_master') {
      auraColor = 'rgba(168, 85, 247, 0.25)'; auraGlow = '#c084fc'
    } else if (charId === 'alchemist') {
      auraColor = 'rgba(132, 204, 22, 0.25)'; auraGlow = '#84cc16'
    } else if (charId === 'demon') {
      auraColor = 'rgba(239, 68, 68, 0.28)'; auraGlow = '#ef4444'
    } else if (charId === 'ghost') {
      auraColor = 'rgba(45, 212, 191, 0.25)'; auraGlow = '#2dd4bf'
    } else if (charId === 'sword') {
      const curWeapon = (game.weapons && game.weapons[0]) || {}
      const wType = p.weaponType || curWeapon.weaponType || curWeapon.type || 'sword'
      if (wType === 'thunder_sword' || curWeapon.id === 'sword_benlei') {
        auraColor = 'rgba(165, 189, 248, 0.28)'
        auraGlow = '#818cf8'
      } else if (wType === 'daggers' || curWeapon.id === 'sword_jifeng') {
        auraColor = 'rgba(110, 231, 183, 0.26)'
        auraGlow = '#34d399'
      }
    }

    ctx.save()
    ctx.shadowColor = auraGlow
    ctx.shadowBlur = 15
    ctx.fillStyle = auraColor
    ctx.beginPath()
    ctx.ellipse(0, -22, 24, 30, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    const attackTilt = isAttacking ? (Math.sin((1 - attackProgress) * Math.PI) * 0.1) : 0
    ctx.rotate(attackTilt)

    if (useSheet) {
      const fw = weaponSheet.frameW || 180
      const fh = weaponSheet.frameH || 180
      const cols = weaponSheet.cols || 3
      const sx = (frameIdx % cols) * fw
      const sy = Math.floor(frameIdx / cols) * fh
      const dw = 72
      const dh = 72
      ctx.drawImage(weaponSheet.img, sx, sy, fw, fh, -dw * 0.5, -dh * 0.82, dw, dh)
    } else {
      const sw = sprite.w || 64
      const sh = sprite.h || 64
      ctx.drawImage(sprite.img, -sw * 0.5, -sh * 0.86, sw, sh)
    }
    ctx.restore()
  } else {
    drawVectorPlayerModel(ctx, p, charId, facingRight, lungeX, lungeY, walkBob, legSwing, windSway, isAttacking, attackProgress, sq)
  }

  if (p.invuln > 0) {
    const shieldPulse = Math.sin(elapsed * 16) * 2
    const shieldR = p.r + 9 + shieldPulse
    const grad = ctx.createRadialGradient(p.x, p.y - 7, shieldR * 0.35, p.x, p.y - 7, shieldR)
    grad.addColorStop(0, 'rgba(238, 206, 108, 0.05)')
    grad.addColorStop(0.8, 'rgba(245, 218, 128, 0.28)')
    grad.addColorStop(1, 'rgba(255, 235, 150, 0.65)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(p.x, p.y - 7, shieldR, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(248, 225, 138, 0.88)'
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.arc(p.x, p.y - 7, shieldR, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 冰冻冰牢特效 (Frozen Ice Crystal Cage)
  if ((game.playerFreezeTimer || 0) > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const freezePulse = Math.sin(elapsed * 12) * 2
    const iceR = p.r + 14 + freezePulse

    // 晶莹冰晶六面体
    ctx.fillStyle = 'rgba(186, 230, 253, 0.45)'
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const ix = p.x + Math.cos(a) * iceR
      const iy = p.y - 8 + Math.sin(a) * (iceR * 1.15)
      if (i === 0) ctx.moveTo(ix, iy)
      else ctx.lineTo(ix, iy)
    }
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.0
    ctx.stroke()

    // 冰晶脊棱
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'
    ctx.lineWidth = 1.2
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(p.x, p.y - 8)
      ctx.lineTo(p.x + Math.cos(a) * iceR, p.y - 8 + Math.sin(a) * (iceR * 1.15))
      ctx.stroke()
    }
    ctx.restore()
  } else if ((game.playerChillTimer || 0) > 0) {
    // 减速冰雾光环 (Chilled Frost Aura)
    ctx.save()
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'
    ctx.lineWidth = 1.6
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.ellipse(p.x, p.y + 6, p.r + 8, (p.r + 8) * 0.4, elapsed * 2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  // 灼烧烈焰特效 (Burning Flames Flare)
  if ((game.playerBurnTimer || 0) > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const burnAlpha = Math.min(0.55, 0.28 + Math.sin(elapsed * 24) * 0.2)
    ctx.fillStyle = `rgba(255, 100, 20, ${burnAlpha})`
    ctx.beginPath()
    ctx.arc(p.x, p.y - 8, p.r + 6 + Math.sin(elapsed * 16) * 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
}

function drawSwordEntity(c, x, y, angle, scale = 1, isSlashing = false, slashProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  const glow = c.createLinearGradient(-18, 0, 16, 0)
  glow.addColorStop(0, 'rgba(80, 220, 190, 0)')
  glow.addColorStop(0.5, 'rgba(120, 240, 210, 0.35)')
  glow.addColorStop(1, 'rgba(255, 250, 220, 0.7)')
  c.fillStyle = glow
  c.beginPath()
  c.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2)
  c.fill()

  if (isSlashing) {
    const arcAlpha = Math.sin(slashProgress * Math.PI)
    c.save()
    c.strokeStyle = `rgba(255, 235, 140, ${arcAlpha * 0.95})`
    c.lineWidth = 2.8
    c.beginPath()
    c.arc(8, 0, 20, -Math.PI * 0.48, Math.PI * 0.48)
    c.stroke()
    c.restore()
  }

  c.fillStyle = '#e8f7f2'
  c.beginPath()
  c.moveTo(14, 0)
  c.lineTo(2, -3.2)
  c.lineTo(-6, -2.8)
  c.lineTo(-6, 2.8)
  c.lineTo(2, 3.2)
  c.closePath()
  c.fill()

  c.strokeStyle = '#fff8dc'
  c.lineWidth = 1.2
  c.beginPath()
  c.moveTo(13, 0)
  c.lineTo(-6, 0)
  c.stroke()

  c.fillStyle = '#d4af37'
  c.fillRect(-8, -4.5, 2.5, 9)
  c.fillStyle = '#422818'
  c.fillRect(-12, -1.5, 4, 3)

  c.fillStyle = '#e5be56'
  c.beginPath()
  c.arc(-12.5, 0, 1.8, 0, Math.PI * 2)
  c.fill()

  const wave = Math.sin(x * 0.05 + y * 0.05) * 2.5
  c.strokeStyle = '#e6392f'
  c.lineWidth = 1.4
  c.beginPath()
  c.moveTo(-13, 0)
  c.quadraticCurveTo(-17, wave, -22, wave * 0.8)
  c.stroke()

  c.restore()
}

function drawDaggersEntity(c, x, y, angle, scale = 1, isSlashing = false, slashProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  if (isSlashing) {
    const alpha = Math.sin(slashProgress * Math.PI)
    c.strokeStyle = `rgba(139, 243, 192, ${alpha * 0.9})`
    c.lineWidth = 2.4
    c.beginPath()
    c.arc(6, 0, 18, -Math.PI * 0.5, Math.PI * 0.5)
    c.stroke()
  }

  for (let s of [-1, 1]) {
    c.save()
    c.translate(0, s * 4.5)
    c.rotate(s * 0.25)
    c.fillStyle = '#8bf3c0'
    c.beginPath()
    c.moveTo(11, 0)
    c.quadraticCurveTo(0, -3.5, -8, -1)
    c.quadraticCurveTo(-1, 0, 11, 0)
    c.closePath()
    c.fill()
    c.strokeStyle = '#2d5c48'
    c.lineWidth = 1
    c.stroke()
    c.fillStyle = '#173628'
    c.fillRect(-10, -1, 3.5, 2)
    c.restore()
  }
  c.restore()
}

function drawThunderSwordEntity(c, x, y, angle, scale = 1, isSlashing = false, slashProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  if (isSlashing) {
    const alpha = Math.sin(slashProgress * Math.PI)
    c.strokeStyle = `rgba(165, 189, 248, ${alpha * 0.95})`
    c.lineWidth = 3.2
    c.beginPath()
    c.arc(10, 0, 24, -Math.PI * 0.45, Math.PI * 0.45)
    c.stroke()
  }

  c.fillStyle = 'rgba(165, 189, 248, 0.35)'
  c.beginPath()
  c.ellipse(2, 0, 18, 7, 0, 0, Math.PI * 2)
  c.fill()

  c.fillStyle = '#cbd5e1'
  c.beginPath()
  c.moveTo(16, 0)
  c.lineTo(3, -4.5)
  c.lineTo(-8, -4.2)
  c.lineTo(-8, 4.2)
  c.lineTo(3, 4.5)
  c.closePath()
  c.fill()

  c.strokeStyle = '#818cf8'
  c.lineWidth = 1.6
  c.beginPath()
  c.moveTo(14, 0)
  c.lineTo(-7, 0)
  c.stroke()

  c.fillStyle = '#475569'
  c.fillRect(-10, -6, 3, 12)
  c.fillStyle = '#1e1b4b'
  c.fillRect(-14, -1.8, 5, 3.6)
  c.restore()
}

function drawBaguaEntity(c, x, y, angle, scale = 1, isAttacking = false, attackProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  const spin = isAttacking ? attackProgress * Math.PI * 4 : 0
  c.rotate(spin)

  c.fillStyle = 'rgba(238, 213, 125, 0.25)'
  c.beginPath()
  c.arc(0, 0, 16, 0, Math.PI * 2)
  c.fill()

  c.strokeStyle = '#d4af37'
  c.lineWidth = 1.6
  c.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const px = Math.cos(a) * 12
    const py = Math.sin(a) * 12
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py)
  }
  c.closePath()
  c.stroke()

  c.fillStyle = '#ebf5f0'
  c.beginPath()
  c.arc(0, 0, 7, -Math.PI / 2, Math.PI / 2)
  c.arc(0, 3.5, 3.5, Math.PI / 2, -Math.PI / 2, true)
  c.arc(0, -3.5, 3.5, Math.PI / 2, -Math.PI / 2)
  c.fill()

  c.fillStyle = '#1a302a'
  c.beginPath()
  c.arc(0, 0, 7, Math.PI / 2, -Math.PI / 2)
  c.arc(0, -3.5, 3.5, -Math.PI / 2, Math.PI / 2, true)
  c.arc(0, 3.5, 3.5, -Math.PI / 2, Math.PI / 2)
  c.fill()

  c.restore()
}

function drawFuchenEntity(c, x, y, angle, scale = 1, isAttacking = false, attackProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  // 灵木拂尘 —— 对齐清虚仙子：青玉为骨 / 银白为魂 / 冰蓝为灵
  // 造型依据 art-source/briefs/weapon_fuchen_redesign.md
  // 轴向约定与其他法宝一致：柄在 -x，拂尾朝 +x。
  //
  // 尺寸约束：法修单法宝时由 drawFloatingWeapons 以固定偏移 (-20,-14)、scale=1 绘制，
  // 器物总长若超过约 30 单位就会横贯角色身体、并挡住束环与灵晶。故全长控制在 27 单位。

  // 1. 尾端银白短绦（先画，被柄身压住一部分）
  c.strokeStyle = 'rgba(232, 238, 242, 0.75)'
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(-11, 0)
  c.quadraticCurveTo(-14, 1.2, -15.6, 2.8)
  c.stroke()

  // 2. 手柄：玉化灵木（青瓷淡青玉；上缘受光、下缘入暗）
  const woodGrad = c.createLinearGradient(0, -2.4, 0, 2.4)
  woodGrad.addColorStop(0, '#D8E8DE')
  woodGrad.addColorStop(0.5, '#A9C6B8')
  woodGrad.addColorStop(1, '#7E9C8C')
  c.fillStyle = woodGrad
  c.fillRect(-11, -2.2, 9, 4.4)

  // 3. 束环：哑光银白玉箍，灵晶镶嵌其中
  c.fillStyle = '#C3CFD8'
  c.fillRect(-2, -3.2, 6, 6.4)
  c.fillStyle = '#E8EEF2'
  c.fillRect(-2, -3.2, 6, 2.4)

  // 4. 灵枢宝珠：冰蓝灵晶（与角色手中的灵晶同色，是"这把武器属于她"的识别点）
  const gemGrad = c.createRadialGradient(0.2, -0.9, 0.2, 1, 0, 3.1)
  gemGrad.addColorStop(0, '#FFFFFF')
  gemGrad.addColorStop(0.5, '#CFE6F0')
  gemGrad.addColorStop(1, 'rgba(176, 208, 226, 0.95)')
  c.fillStyle = gemGrad
  c.beginPath()
  c.arc(1, 0, 2.7, 0, Math.PI * 2)
  c.fill()

  // 5. 拂丝：银白扇形，根部纯白渐至末端冰蓝
  const wave = Math.sin((x + y) * 0.1) * 1.8
  const spread = isAttacking ? 1 + Math.sin(attackProgress * Math.PI) * 0.35 : 1
  const tipX = 16 * spread
  const silkGrad = c.createLinearGradient(4, 0, tipX, 0)
  silkGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)')
  silkGrad.addColorStop(0.55, 'rgba(233, 242, 246, 0.9)')
  silkGrad.addColorStop(1, 'rgba(176, 208, 226, 0.88)')
  c.strokeStyle = silkGrad
  c.lineWidth = 1.6
  c.lineCap = 'round'
  for (let i = 0; i < 5; i++) {
    const off = (i / 4 - 0.5) * 2
    c.beginPath()
    c.moveTo(4, off * 1.3)
    c.quadraticCurveTo(10, off * 4 + wave * 0.7, tipX, off * 5.6 * spread + wave)
    c.stroke()
  }

  // 6. 外缘薄青白辉光（加色；薄而通透，不糊成雾团）
  c.globalCompositeOperation = 'lighter'
  c.strokeStyle = 'rgba(150, 232, 224, 0.3)'
  c.lineWidth = 3.2
  c.beginPath()
  c.moveTo(4, 0)
  c.quadraticCurveTo(10, wave, tipX, wave * 0.5)
  c.stroke()
  c.globalCompositeOperation = 'source-over'

  c.restore()
}

function drawBaozhuEntity(c, x, y, angle, scale = 1, isAttacking = false, attackProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  const glow = c.createRadialGradient(0, 0, 2, 0, 0, 14)
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  glow.addColorStop(0.4, 'rgba(214, 168, 248, 0.75)')
  glow.addColorStop(1, 'rgba(168, 85, 247, 0)')
  c.fillStyle = glow
  c.beginPath()
  c.arc(0, 0, 14, 0, Math.PI * 2)
  c.fill()

  c.fillStyle = '#f3e8ff'
  c.beginPath()
  c.arc(0, 0, 6.5, 0, Math.PI * 2)
  c.fill()

  c.strokeStyle = 'rgba(192, 132, 252, 0.75)'
  c.lineWidth = 1.2
  c.beginPath()
  c.ellipse(0, 0, 12, 4.5, 0.4, 0, Math.PI * 2)
  c.stroke()

  c.restore()
}

function drawDingEntity(c, x, y, angle, scale = 1, isAttacking = false, attackProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle * 0.3)
  c.scale(scale, scale)

  c.fillStyle = 'rgba(245, 158, 11, 0.35)'
  c.beginPath()
  c.ellipse(0, -6, 9, 3.5, 0, 0, Math.PI * 2)
  c.fill()

  c.fillStyle = '#b45309'
  c.beginPath()
  c.moveTo(-8, -5)
  c.lineTo(8, -5)
  c.quadraticCurveTo(9, 4, 0, 6)
  c.quadraticCurveTo(-9, 4, -8, -5)
  c.closePath()
  c.fill()
  c.strokeStyle = '#fef08a'
  c.lineWidth = 1
  c.stroke()

  c.fillStyle = '#78350f'
  c.fillRect(-10.5, -9, 2.5, 5)
  c.fillRect(8, -9, 2.5, 5)
  c.fillRect(-6, 5, 2.5, 4.5)
  c.fillRect(3.5, 5, 2.5, 4.5)

  c.restore()
}

function drawDragonArmorEntity(c, x, y, angle, scale = 1, isAttacking = false, attackProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  c.fillStyle = '#f59e0b'
  c.beginPath()
  c.moveTo(8, 0)
  c.lineTo(0, -6)
  c.lineTo(-6, -3)
  c.lineTo(-6, 3)
  c.lineTo(0, 6)
  c.closePath()
  c.fill()

  c.strokeStyle = '#fef08a'
  c.lineWidth = 1.2
  c.stroke()

  c.fillStyle = '#dc2626'
  c.beginPath()
  c.arc(0, 0, 2, 0, Math.PI * 2)
  c.fill()

  c.restore()
}

function drawHammerEntity(c, x, y, angle, scale = 1, isAttacking = false, attackProgress = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  // 仙火金光光晕
  c.shadowColor = '#ff7b30'
  c.shadowBlur = 10

  // 乌金雕龙长柄
  c.fillStyle = '#3a2010'
  c.fillRect(-16, -2, 18, 4)
  c.fillStyle = '#d4af37'
  for (let ox = -14; ox <= 0; ox += 4) {
    c.fillRect(ox, -2.5, 1.5, 5)
  }

  // 八棱金火战锤主锤身
  c.fillStyle = '#c2410c'
  c.beginPath()
  c.moveTo(2, -8)
  c.lineTo(12, -8)
  c.lineTo(15, -4)
  c.lineTo(15, 4)
  c.lineTo(12, 8)
  c.lineTo(2, 8)
  c.lineTo(-1, 4)
  c.lineTo(-1, -4)
  c.closePath()
  c.fill()

  // 纯金镶边与龙纹
  c.strokeStyle = '#fde047'
  c.lineWidth = 1.5
  c.stroke()

  // 锤心烈焰金晶
  c.fillStyle = '#fef08a'
  c.beginPath()
  c.arc(7, 0, 3, 0, Math.PI * 2)
  c.fill()

  // 破风尖刺
  c.fillStyle = '#facc15'
  c.beginPath()
  c.moveTo(15, -2)
  c.lineTo(19, 0)
  c.lineTo(15, 2)
  c.closePath()
  c.fill()

  // 尾端配重宝珠
  c.fillStyle = '#b45309'
  c.beginPath()
  c.arc(-16.5, 0, 2.5, 0, Math.PI * 2)
  c.fill()

  c.restore()
}

// 10. 百兽金铃 (Beast Bell)
function drawBellEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#facc15'; c.beginPath(); c.arc(0, 0, 10, 0, Math.PI * 2); c.fill()
  c.strokeStyle = '#eab308'; c.lineWidth = 1.5; c.stroke()
  c.fillStyle = '#ca8a04'; c.fillRect(-1.5, 4, 3, 4)
  c.fillStyle = '#ef4444'; c.beginPath(); c.moveTo(0, -10); c.lineTo(-4, -16); c.lineTo(4, -16); c.closePath(); c.fill()
  c.restore()
}

// 11. 缚兽玄绫 (Beast Lash)
function drawLashEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.strokeStyle = '#38bdf8'; c.lineWidth = 3
  c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(0, -8, 14, 0); c.stroke()
  c.fillStyle = '#bae6fd'; c.beginPath(); c.arc(14, 0, 3, 0, Math.PI * 2); c.fill()
  c.restore()
}

// 12. 唤灵法螺 (Beast Horn)
function drawHornEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#f0f9ff'; c.beginPath(); c.moveTo(-10, -6); c.lineTo(12, 0); c.lineTo(-10, 6); c.closePath(); c.fill()
  c.strokeStyle = '#38bdf8'; c.lineWidth = 1.2; c.stroke()
  c.fillStyle = '#7dd3fc'; c.beginPath(); c.arc(-8, 0, 5, 0, Math.PI * 2); c.fill()
  c.restore()
}

// 13. 四象诛邪旗 (Formation Flag)
function drawFlagEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#e2e8f0'; c.fillRect(-1, -14, 2, 28)
  c.fillStyle = '#fb7185'; c.beginPath(); c.moveTo(1, -12); c.lineTo(15, -4); c.lineTo(1, 4); c.closePath(); c.fill()
  c.strokeStyle = '#ffe4e6'; c.lineWidth = 1; c.stroke()
  c.restore()
}

// 14. 天星弈棋 (Formation Chess)
function drawChessEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#0f172a'; c.beginPath(); c.arc(-5, 0, 6, 0, Math.PI * 2); c.fill()
  c.strokeStyle = '#c084fc'; c.lineWidth = 1; c.stroke()
  c.fillStyle = '#f8fafc'; c.beginPath(); c.arc(5, 0, 6, 0, Math.PI * 2); c.fill()
  c.strokeStyle = '#e9d5ff'; c.stroke()
  c.restore()
}

// 15. 量天玉尺 (Formation Ruler)
function drawRulerEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#34d399'; c.fillRect(-14, -4, 28, 8)
  c.strokeStyle = '#a7f3d0'; c.lineWidth = 1.2; c.strokeRect(-14, -4, 28, 8)
  c.fillStyle = '#065f46'; for (let i = -10; i <= 10; i += 4) c.fillRect(i, -4, 1, 3)
  c.restore()
}

// 16. 紫金八卦炉 (Pill Furnace)
function drawFurnaceEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#7c2d12'; c.beginPath(); c.arc(0, 2, 9, 0, Math.PI * 2); c.fill()
  c.strokeStyle = '#f97316'; c.lineWidth = 1.5; c.stroke()
  c.fillStyle = '#fdba74'; c.fillRect(-4, -10, 8, 4)
  c.restore()
}

// 17. 碧玉药王杵 (Pill Pestle)
function drawPestleEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#10b981'; c.beginPath(); c.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2); c.fill()
  c.strokeStyle = '#a7f3d0'; c.lineWidth = 1.2; c.stroke()
  c.restore()
}

// 18. 千草腐仙葫 (Poison Gourd)
function drawPoisonGourdEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#4d7c0f'; c.beginPath(); c.arc(0, 4, 8, 0, Math.PI * 2); c.fill()
  c.fillStyle = '#65a30d'; c.beginPath(); c.arc(0, -4, 6, 0, Math.PI * 2); c.fill()
  c.strokeStyle = '#bef264'; c.lineWidth = 1; c.stroke()
  c.restore()
}

// 19. 化血狂刀 (Demon Blade)
function drawDemonBladeEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#991b1b'; c.beginPath(); c.moveTo(-12, 4); c.quadraticCurveTo(0, -6, 16, -1); c.lineTo(12, 4); c.closePath(); c.fill()
  c.strokeStyle = '#ef4444'; c.lineWidth = 1.5; c.stroke()
  c.fillStyle = '#450a0a'; c.fillRect(-15, 2, 4, 3)
  c.restore()
}

// 20. 天魔血煞爪 (Demon Claws)
function drawDemonClawsEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.strokeStyle = '#dc2626'; c.lineWidth = 2
  for (let dy of [-4, 0, 4]) {
    c.beginPath(); c.moveTo(-8, dy); c.quadraticCurveTo(0, dy - 2, 10, dy); c.stroke()
  }
  c.restore()
}

// 21. 修罗血皇玺 (Demon Seal)
function drawDemonSealEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#7f1d1d'; c.fillRect(-9, -7, 18, 14)
  c.strokeStyle = '#ef4444'; c.lineWidth = 1.5; c.strokeRect(-9, -7, 18, 14)
  c.fillStyle = '#fca5a5'; c.fillRect(-3, -11, 6, 4)
  c.restore()
}

// 22. 幽冥引魂灯 (Ghost Lantern)
function drawGhostLanternEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#115e59'; c.fillRect(-6, -8, 12, 16)
  c.fillStyle = '#2dd4bf'; c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill()
  c.strokeStyle = '#5eead4'; c.lineWidth = 1; c.strokeRect(-6, -8, 12, 16)
  c.restore()
}

// 23. 白骨哀丧棒 (Ghost Wand)
function drawGhostWandEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#e2e8f0'; c.fillRect(-2, -15, 4, 30)
  c.strokeStyle = '#94a3b8'; c.lineWidth = 1; c.strokeRect(-2, -15, 4, 30)
  c.fillStyle = '#cbd5e1'; c.beginPath(); c.arc(0, -15, 3.5, 0, Math.PI * 2); c.fill()
  c.restore()
}

// 24. 百鬼聚灵幡 (Ghost Banner)
function drawGhostBannerEntity(c, x, y, angle, scale = 1) {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale)
  c.fillStyle = '#334155'; c.fillRect(-1, -15, 2, 30)
  c.fillStyle = '#0f172a'; c.beginPath(); c.moveTo(1, -13); c.lineTo(14, -5); c.lineTo(1, 3); c.closePath(); c.fill()
  c.strokeStyle = '#2dd4bf'; c.lineWidth = 1; c.stroke()
  c.restore()
}

const WEAPON_RENDER_PROPS = {
  sword: { size: 42, glow: '#64e8cb', fallback: drawSwordEntity },
  daggers: { size: 38, glow: '#8bf3c0', fallback: drawDaggersEntity },
  thunder_sword: { size: 44, glow: '#a5bdf8', fallback: drawThunderSwordEntity },
  bagua: { size: 42, glow: '#eed57d', fallback: drawBaguaEntity },
  fuchen: { size: 44, glow: '#96e8e0', fallback: drawFuchenEntity },
  baozhu: { size: 38, glow: '#d6a8f8', fallback: drawBaozhuEntity },
  ding: { size: 44, glow: '#e69848', fallback: drawDingEntity },
  dragon_armor: { size: 42, glow: '#f2b836', fallback: drawDragonArmorEntity },
  hammer: { size: 46, glow: '#ff7b30', fallback: drawHammerEntity },
  beast_bell: { size: 38, glow: '#facc15', fallback: drawBellEntity },
  beast_lash: { size: 40, glow: '#38bdf8', fallback: drawLashEntity },
  beast_horn: { size: 42, glow: '#e0f2fe', fallback: drawHornEntity },
  formation_flag: { size: 42, glow: '#fb7185', fallback: drawFlagEntity },
  formation_chess: { size: 38, glow: '#c084fc', fallback: drawChessEntity },
  formation_ruler: { size: 44, glow: '#34d399', fallback: drawRulerEntity },
  pill_furnace: { size: 42, glow: '#f97316', fallback: drawFurnaceEntity },
  pill_pestle: { size: 40, glow: '#10b981', fallback: drawPestleEntity },
  pill_poison: { size: 40, glow: '#84cc16', fallback: drawPoisonGourdEntity },
  demon_blade: { size: 46, glow: '#ef4444', fallback: drawDemonBladeEntity },
  demon_claws: { size: 38, glow: '#dc2626', fallback: drawDemonClawsEntity },
  demon_seal: { size: 44, glow: '#991b1b', fallback: drawDemonSealEntity },
  ghost_lantern: { size: 42, glow: '#2dd4bf', fallback: drawGhostLanternEntity },
  ghost_wand: { size: 44, glow: '#e2e8f0', fallback: drawGhostWandEntity },
  ghost_banner: { size: 46, glow: '#a7f3d0', fallback: drawGhostBannerEntity },
}

function drawOrientedWeaponSprite(c, wType, x, y, flightAngle, size = 42, glowColor = '#64e8cb') {
  const spriteObj = (typeof weaponSprites !== 'undefined') ? weaponSprites[wType] : null
  if (!spriteObj || !spriteObj.loaded || !spriteObj.img) return false

  c.save()
  c.translate(x, y)

  let angleOffset = 0
  if (wType === 'sword' || wType === 'thunder_sword' || wType === 'demon_blade' || wType === 'beast_horn') {
    angleOffset = Math.PI * 0.25 // image tip at -45 deg, rotate +45 deg to point along +X
  } else if (wType === 'daggers') {
    angleOffset = -Math.PI * 0.25 // image tip at +45 deg, rotate -45 deg to point along +X
  } else if (wType === 'pill_pestle' || wType === 'ghost_wand') {
    angleOffset = Math.PI * 0.20 // angled at -35 deg
  } else if (wType === 'ghost_banner' || wType === 'formation_flag') {
    angleOffset = -Math.PI * 0.15
  }

  c.rotate(flightAngle + angleOffset)
  c.shadowColor = glowColor
  c.shadowBlur = 14
  c.drawImage(spriteObj.img, -size / 2, -size / 2, size, size)
  c.restore()
  return true
}

function drawFloatingWeapons(p, weapons, elapsedVal) {
  const elapsed = typeof elapsedVal === 'number' ? elapsedVal : (typeof weapons === 'number' ? weapons : (game.elapsed || 0))
  const primaryWeapon = (weapons && Array.isArray(weapons) ? weapons[0] : (game.weapons && game.weapons[0])) || {}
  const rawType = (p && p.weaponType) || (game.player && game.player.weaponType) || 'sword'
  const weaponType = rawType.replace(/^(sword_|spell_|body_)/, '')
  const count = Math.max(1, primaryWeapon.count || 1)
  const isAttacking = (p && p.attackTimer || 0) > 0
  const attackProgress = isAttacking ? ((p && p.attackTimer || 0) / 0.28) : 0
  const thrust = isAttacking ? Math.sin((1 - attackProgress) * Math.PI) * 34 : 0

  const props = WEAPON_RENDER_PROPS[weaponType] || WEAPON_RENDER_PROPS.sword
  const spriteObj = (typeof weaponSprites !== 'undefined') ? weaponSprites[weaponType] : null
  const isSwordCultivator = ['sword', 'daggers', 'thunder_sword'].includes(weaponType)

  // 检查武器是否正飞出攻击 (如锤子已飞掷出去)
  const isHammerThrown = weaponType === 'hammer' && (game.specialAttacks || []).some(a => a.type === 'hammer_strike' && a.phase !== 'return')

  // 凌虚子专属：默认状态下所有武器（1至N把）全部环绕主角周身游曳旋转
  if (isSwordCultivator) {
    const activeFlyingCount = (game.specialAttacks || []).filter(a =>
      (weaponType === 'sword' && a.type === 'flying_sword_strike') ||
      (weaponType === 'daggers' && a.type === 'flying_dagger_boomerang') ||
      (weaponType === 'thunder_sword' && a.type === 'flying_thunder_sword')
    ).length

    const orbitSpeed = 2.3
    const baseOrbitAngle = elapsed * orbitSpeed
    const rx = 32
    const ry = 17
    const bob = Math.sin(elapsed * 3.2) * 2

    // 绘制剑环灵道淡光
    ctx.save()
    ctx.strokeStyle = `${props.glow}33`
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.ellipse(p.x, p.y - 6 + bob, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    for (let i = 0; i < count; i++) {
      const orbitAngle = baseOrbitAngle + (i / count) * Math.PI * 2
      const sx = p.x + Math.cos(orbitAngle) * rx
      const sy = p.y - 6 + Math.sin(orbitAngle) * ry + Math.sin(elapsed * 4 + i) * 1.5
      // 剑身沿轨道切线向前飞旋，犹如如鱼化龙
      const tangentAngle = orbitAngle + Math.PI * 0.55

      // 判断该飞剑是否已飞出攻击
      const isOutFlying = i < activeFlyingCount

      if (isOutFlying) {
        // 武器本体已离体飞出御敌，本体正在外杀敌，轨道对应位留空待其飞回归位
        // 在身侧轨道留下极其淡雅的剑位灵穴光点
        ctx.save()
        ctx.fillStyle = `${props.glow}40`
        ctx.beginPath()
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        continue
      }

      ctx.save()
      const drawn = drawOrientedWeaponSprite(ctx, weaponType, sx, sy, tangentAngle, props.size, props.glow)
      if (!drawn && props.fallback) {
        props.fallback(ctx, sx, sy, tangentAngle, 1, false, 0)
      }
      ctx.restore()
    }
    return
  }

  for (let i = 0; i < count; i++) {
    let sx, sy, sAngle

    if (isAttacking) {
      const angleSpread = count > 1 ? ((i - (count - 1) / 2) * 0.26) : 0
      const currentAngle = (p.attackAngle || 0) + angleSpread
      const baseDist = 18 + i * 3
      const currentDist = baseDist + thrust
      sx = p.x + Math.cos(currentAngle) * currentDist
      sy = p.y - 7 + Math.sin(currentAngle) * currentDist
      sAngle = currentAngle
    } else {
      if (count === 1) {
        const bob = Math.sin(elapsed * 3.5) * 3
        const tilt = Math.sin(elapsed * 2.5) * 0.1
        sx = p.x - 20
        sy = p.y - 14 + bob
        sAngle = -0.45 + tilt
      } else {
        const orbitAngle = elapsed * 2.2 + (i / count) * Math.PI * 2
        const rx = 28
        const ry = 14
        const bob = Math.sin(elapsed * 4 + i) * 2
        sx = p.x + Math.cos(orbitAngle) * rx
        sy = p.y - 7 + Math.sin(orbitAngle) * ry + bob
        sAngle = orbitAngle + Math.PI * 0.55
      }
    }

    if (isHammerThrown) {
      continue
    }

    ctx.save()
    if (spriteObj && spriteObj.loaded && spriteObj.img) {
      ctx.translate(sx, sy)
      ctx.rotate(sAngle)
      ctx.shadowColor = props.glow
      ctx.shadowBlur = 12
      const sz = props.size
      ctx.drawImage(spriteObj.img, -sz / 2, -sz / 2, sz, sz)
    } else {
      props.fallback(ctx, sx, sy, sAngle, 1, isAttacking, 1 - attackProgress)
    }
    ctx.restore()
  }
}



function drawBackground() {
  if (mapLoaded && mapImg) {
    ctx.drawImage(mapImg, 0, 0, ARENA_WIDTH, ARENA_HEIGHT)
    ctx.fillStyle = 'rgba(10, 16, 20, 0.45)'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
  } else {
    ctx.fillStyle = '#0c1618'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
    ctx.strokeStyle = '#142528'
    ctx.lineWidth = 1
    for (let x = 0; x < ARENA_WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA_HEIGHT); ctx.stroke() }
    for (let y = 0; y < ARENA_HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA_WIDTH, y); ctx.stroke() }
  }

  // 神识范围法阵
  const p = game.player
  const senseRange = game.attackRange || game.pickup || 140
  const elapsed = game.elapsed

  ctx.save()
  const senseGrad = ctx.createRadialGradient(p.x, p.y, senseRange * 0.15, p.x, p.y, senseRange)
  senseGrad.addColorStop(0, 'rgba(30, 80, 70, 0.03)')
  senseGrad.addColorStop(0.7, 'rgba(45, 120, 100, 0.08)')
  senseGrad.addColorStop(0.92, 'rgba(214, 188, 110, 0.14)')
  senseGrad.addColorStop(1, 'rgba(214, 188, 110, 0.38)')

  ctx.fillStyle = senseGrad
  ctx.beginPath()
  ctx.arc(p.x, p.y, senseRange, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(elapsed * 0.45)
  ctx.strokeStyle = 'rgba(214, 188, 110, 0.48)'
  ctx.lineWidth = 1.4
  ctx.setLineDash([8, 10])
  ctx.beginPath()
  ctx.arc(0, 0, senseRange, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2
    ctx.fillStyle = 'rgba(255, 235, 160, 0.85)'
    ctx.beginPath()
    ctx.arc(Math.cos(a) * senseRange, Math.sin(a) * senseRange, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  const innerR = Math.max(20, senseRange - 12 + Math.sin(elapsed * 3) * 2)
  ctx.strokeStyle = 'rgba(128, 215, 190, 0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(p.x, p.y, innerR, 0, Math.PI * 2)
  ctx.stroke()

  ctx.restore()
}

function draw() {
  if (!isHeadless && game.screen !== 'game') return

  const dpr = (!isHeadless && typeof window !== 'undefined') ? (window.devicePixelRatio || 1) : 1
  const renderScale = (!isHeadless && typeof window !== 'undefined') ? Math.min(Math.max(dpr, 2), 2.5) : 1
  const targetW = Math.round(ARENA_WIDTH * renderScale)
  const targetH = Math.round(ARENA_HEIGHT * renderScale)
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW
    canvas.height = targetH
  }

  ctx.save()
  ctx.scale(renderScale, renderScale)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (game.cameraShake > 0 && !isHeadless) {
    const shakeAmt = Math.min(3.0, game.cameraShake * 6)
    ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt)
  }
  drawBackground()
  if (!isHeadless && typeof drawGhostTrails === 'function') drawGhostTrails(ctx)
  if (game.isBossStage) drawBossAoEs(ctx)

  for (const drop of game.drops) {
    const pulse = Math.sin(drop.pulse) * 1.5
    const bob = Math.sin((drop.pulse || 0) * 1.2) * 2.5
    ctx.save()
    ctx.translate(drop.x, drop.y + bob)

    if (drop.type === 'item') {
      if (dropItemLoaded && dropItemImg) {
        ctx.fillStyle = 'rgba(214, 188, 110, 0.25)'
        ctx.beginPath()
        ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2)
        ctx.fill()
        const sz = 30 + pulse * 0.8
        ctx.drawImage(dropItemImg, -sz / 2, -sz / 2, sz, sz)
      } else {
        ctx.rotate(drop.pulse * .5)
        ctx.fillStyle = '#a596dd'
        ctx.shadowColor = '#d2a8f8'
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.moveTo(0, -drop.r - pulse - 2)
        ctx.lineTo(drop.r + pulse + 2, 0)
        ctx.lineTo(0, drop.r + pulse + 2)
        ctx.lineTo(-drop.r - pulse - 2, 0)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#fce588'
        ctx.beginPath()
        ctx.arc(0, 0, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (drop.type === 'heal') {
      if (dropHealLoaded && dropHealImg) {
        ctx.fillStyle = 'rgba(235, 78, 68, 0.22)'
        ctx.beginPath()
        ctx.arc(0, 0, 14 + pulse, 0, Math.PI * 2)
        ctx.fill()
        const sz = 24 + pulse * 0.8
        ctx.drawImage(dropHealImg, -sz / 2, -sz / 2, sz, sz)
      } else {
        ctx.fillStyle = '#c76e68'
        ctx.shadowColor = '#f5827a'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(0, 0, drop.r + pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffd700'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.ellipse(0, 0, drop.r + pulse + 2, (drop.r + pulse) * 0.45, 0.4, 0, Math.PI * 2)
        ctx.stroke()
      }
    } else {
      if (dropQiLoaded && dropQiImg) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.28)'
        ctx.beginPath()
        ctx.arc(0, 0, 8 + pulse * 0.5, 0, Math.PI * 2)
        ctx.fill()
        const sz = 14 + pulse * 0.5
        ctx.drawImage(dropQiImg, -sz / 2, -sz / 2, sz, sz)
      } else {
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 8
        const cr = (drop.r || 5) * 0.7 + pulse * 0.4
        
        ctx.fillStyle = '#7dd3fc'
        ctx.beginPath()
        ctx.moveTo(0, -cr * 1.3)
        ctx.lineTo(cr * 0.9, 0)
        ctx.lineTo(0, 0)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = '#38bdf8'
        ctx.beginPath()
        ctx.moveTo(0, -cr * 1.3)
        ctx.lineTo(0, 0)
        ctx.lineTo(-cr * 0.9, 0)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = '#0284c7'
        ctx.beginPath()
        ctx.moveTo(0, cr * 1.3)
        ctx.lineTo(cr * 0.9, 0)
        ctx.lineTo(0, 0)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = '#0369a1'
        ctx.beginPath()
        ctx.moveTo(0, cr * 1.3)
        ctx.lineTo(0, 0)
        ctx.lineTo(-cr * 0.9, 0)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.moveTo(0, -cr * 0.45)
        ctx.lineTo(cr * 0.32, 0)
        ctx.lineTo(0, cr * 0.45)
        ctx.lineTo(-cr * 0.32, 0)
        ctx.closePath()
        ctx.fill()
      }
    }
    ctx.restore()
  }

  for (const particle of game.particles) {
    ctx.globalAlpha = Math.max(0, particle.life * 2)
    ctx.fillStyle = particle.color
    ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4)
    ctx.globalAlpha = 1
  }

  if (!isHeadless) {
    if (typeof drawHitRings === 'function') drawHitRings(ctx)
    if (typeof drawSpriteAnimations === 'function') drawSpriteAnimations(ctx)
  }

  for (const zap of game.zaps) {
    ctx.strokeStyle = `rgba(159, 199, 232, ${Math.max(0, zap.life * 4)})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(zap.x, 0)
    for (let y = 0; y < zap.y; y += 26) ctx.lineTo(zap.x + rand(-7, 7), y)
    ctx.lineTo(zap.x, zap.y)
    ctx.stroke()
  }

  for (const projectile of game.projectiles) {
    drawProjectileModel(projectile, game.elapsed)
  }

  drawSpecialAttacks(ctx)
  drawChainArcs(ctx)
  drawBlazingBursts(ctx)
  if (game.isBossStage) {
    drawBoss(ctx)
    drawBossProjectiles(ctx)
  } else if (game.bossProjectiles && game.bossProjectiles.length) {
    drawBossProjectiles(ctx)
  }

  for (const marker of game.markers) {
    const progress = 1 - marker.life / marker.maxLife
    const isElite = marker.kind === 'elite_brute' || marker.kind === 'elite_frost_brute'
    const isFrost = marker.kind === 'elite_frost_brute'
    const tone = isFrost ? '56, 189, 248' : (isElite ? '240, 70, 30' : (marker.kind === 'brute' ? '199, 122, 112' : '127, 183, 156'))
    ctx.save()
    ctx.translate(marker.x, marker.y)
    ctx.strokeStyle = `rgba(${tone}, ${.35 + progress * .55})`
    ctx.lineWidth = isElite ? 2.6 : 1.5
    ctx.setLineDash(isElite ? [8, 4] : [5, 6])
    ctx.beginPath()
    ctx.arc(0, 0, marker.r + 20, marker.spin + progress * 4, marker.spin + progress * 4 + Math.PI * 2)
    ctx.stroke()
    if (isElite) {
      ctx.strokeStyle = isFrost ? 'rgba(224, 242, 254, 0.85)' : 'rgba(255, 190, 11, 0.75)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(0, 0, marker.r + 10, -(marker.spin + progress * 5), -(marker.spin + progress * 5) + Math.PI * 2)
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.fillStyle = `rgba(${tone}, ${.12 + progress * .3})`
    ctx.beginPath()
    ctx.arc(0, 0, (marker.r + 14) * progress, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  for (const enemy of game.enemies) {
    if (enemy.isBoss || enemy.isBossPart) continue // 领主与部位由专用渲染系统单独绘制，跳过普通怪绘制与多余小怪血条，避免遮挡骨臂贴图与杂乱血条
    if (enemy.isDummy) {
      if (typeof drawTrainingDummy === 'function') drawTrainingDummy(ctx, enemy)
      continue
    }
    if (enemy.kind === 'elite_frost_brute') {
      ctx.save()
      const hitSquash = enemy.hit > 0 ? Math.sin((enemy.hit / 0.16) * Math.PI) * 0.18 : 0
      const stomp = Math.sin(game.elapsed * 9 + enemy.x) * 0.05
      const windupShake = enemy.isWindup ? (Math.sin(game.elapsed * 35) * 1.5) : 0
      ctx.translate(enemy.x + windupShake, enemy.y)

      // 1. 脚底旋转极寒霜华符文光环 (Elite Frost Rune Floor Aura)
      ctx.save()
      const auraPulse = Math.sin(game.elapsed * 4 + enemy.x) * 4
      const runeGrad = ctx.createRadialGradient(0, 8, 6, 0, 8, enemy.r + 18 + auraPulse)
      runeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.42)')
      runeGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.22)')
      runeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = runeGrad
      ctx.beginPath()
      ctx.ellipse(0, 8, enemy.r + 18 + auraPulse, (enemy.r + 18 + auraPulse) * 0.45, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)'
      ctx.lineWidth = 1.8
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.ellipse(0, 8, enemy.r + 10, (enemy.r + 10) * 0.42, -game.elapsed * 1.2, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      const facingRight = (game.player ? game.player.x >= enemy.x : true)
      ctx.scale((facingRight ? -1 : 1) * (1 + hitSquash - stomp * 0.5), 1 - hitSquash + stomp)
      if (enemy.opacity !== undefined) ctx.globalAlpha = enemy.opacity
      const w = 84, h = 84

      const useFrostSheet = enemyFrostBruteSheetLoaded && enemyFrostBruteSheetImg
      const useFrostImg = enemyFrostBruteLoaded && enemyFrostBruteImg
      const sheetImg = useFrostSheet ? enemyFrostBruteSheetImg : (enemyBruteSheetLoaded ? enemyBruteSheetImg : null)
      const singleImg = useFrostImg ? enemyFrostBruteImg : (enemyBruteLoaded ? enemyBruteImg : null)

      const needFilter = !useFrostSheet && !useFrostImg
      if (needFilter) ctx.filter = 'hue-rotate(185deg) saturate(1.4)'

      if (sheetImg) {
        const frameIdx = Math.floor(((game.elapsed * 9) + (enemy.x * 0.04 + enemy.y * 0.02)) % 8)
        const col = frameIdx % 4
        const row = Math.floor(frameIdx / 4)
        ctx.drawImage(sheetImg, col * 180, row * 180, 180, 180, -w / 2, -h / 2, w, h)

        if (enemy.isWindup) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          const windupGlow = 0.38 + Math.sin(game.elapsed * 18) * 0.25
          ctx.globalAlpha = windupGlow
          ctx.drawImage(sheetImg, col * 180, row * 180, 180, 180, -w / 2, -h / 2, w, h)
          ctx.restore()
        }

        if (enemy.hit > 0) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(0.5, (enemy.hit / 0.16) * 0.45)
          ctx.drawImage(sheetImg, col * 180, row * 180, 180, 180, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
      } else if (singleImg) {
        ctx.drawImage(singleImg, -w / 2, -h / 2, w, h)
        if (enemy.isWindup) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = 0.4 + Math.sin(game.elapsed * 18) * 0.25
          ctx.drawImage(singleImg, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
        if (enemy.hit > 0) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(0.5, (enemy.hit / 0.16) * 0.45)
          ctx.drawImage(singleImg, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, enemy.r, 0, Math.PI * 2)
        ctx.fillStyle = '#38bdf8'
        ctx.fill()
      }
      ctx.restore()
    } else if (enemy.kind === 'elite_brute' && ((enemyBruteSheetLoaded && enemyBruteSheetImg) || (enemyBruteLoaded && enemyBruteImg))) {
      ctx.save()
      const hitSquash = enemy.hit > 0 ? Math.sin((enemy.hit / 0.16) * Math.PI) * 0.18 : 0
      const stomp = Math.sin(game.elapsed * 9 + enemy.x) * 0.05
      const windupShake = enemy.isWindup ? (Math.sin(game.elapsed * 35) * 1.5) : 0
      ctx.translate(enemy.x + windupShake, enemy.y)

      // 1. 脚底旋转地煞熔岩符文光环 (Elite Magma Runes Floor Aura)
      ctx.save()
      const auraPulse = Math.sin(game.elapsed * 4 + enemy.x) * 4
      const runeGrad = ctx.createRadialGradient(0, 8, 6, 0, 8, enemy.r + 18 + auraPulse)
      runeGrad.addColorStop(0, 'rgba(255, 60, 0, 0.42)')
      runeGrad.addColorStop(0.5, 'rgba(214, 40, 40, 0.22)')
      runeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = runeGrad
      ctx.beginPath()
      ctx.ellipse(0, 8, enemy.r + 18 + auraPulse, (enemy.r + 18 + auraPulse) * 0.45, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255, 190, 11, 0.55)'
      ctx.lineWidth = 1.8
      ctx.setLineDash([7, 5])
      ctx.beginPath()
      ctx.ellipse(0, 8, enemy.r + 10, (enemy.r + 10) * 0.42, game.elapsed * 1.2, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      const facingRight = (game.player ? game.player.x >= enemy.x : true)
      ctx.scale((facingRight ? -1 : 1) * (1 + hitSquash - stomp * 0.5), 1 - hitSquash + stomp)
      if (enemy.opacity !== undefined) ctx.globalAlpha = enemy.opacity
      const w = 84, h = 84

      if (enemyBruteSheetLoaded && enemyBruteSheetImg) {
        const frameIdx = Math.floor(((game.elapsed * 9) + (enemy.x * 0.04 + enemy.y * 0.02)) % 8)
        const col = frameIdx % 4
        const row = Math.floor(frameIdx / 4)
        ctx.drawImage(enemyBruteSheetImg, col * 180, row * 180, 180, 180, -w / 2, -h / 2, w, h)

        if (enemy.isWindup) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          const windupGlow = 0.35 + Math.sin(game.elapsed * 18) * 0.25
          ctx.globalAlpha = windupGlow
          ctx.drawImage(enemyBruteSheetImg, col * 180, row * 180, 180, 180, -w / 2, -h / 2, w, h)
          ctx.restore()
        }

        if (enemy.hit > 0) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(0.5, (enemy.hit / 0.16) * 0.45)
          ctx.drawImage(enemyBruteSheetImg, col * 180, row * 180, 180, 180, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
      } else {
        ctx.drawImage(enemyBruteImg, -w / 2, -h / 2, w, h)
        if (enemy.isWindup) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = 0.4 + Math.sin(game.elapsed * 18) * 0.25
          ctx.drawImage(enemyBruteImg, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
        if (enemy.hit > 0) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(0.5, (enemy.hit / 0.16) * 0.45)
          ctx.drawImage(enemyBruteImg, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
      }
      ctx.restore()
    } else if (enemy.kind === 'brute' && ((enemyBruteSheetLoaded && enemyBruteSheetImg) || (enemyBruteLoaded && enemyBruteImg))) {
      ctx.save()
      const hitSquash = enemy.hit > 0 ? Math.sin((enemy.hit / 0.16) * Math.PI) * 0.18 : 0
      const stomp = Math.sin(game.elapsed * 9 + enemy.x) * 0.05
      ctx.translate(enemy.x, enemy.y)
      const facingRight = (game.player ? game.player.x >= enemy.x : true)
      ctx.scale((facingRight ? -1 : 1) * (1 + hitSquash - stomp * 0.5), 1 - hitSquash + stomp)
      if (enemy.opacity !== undefined) ctx.globalAlpha = enemy.opacity
      const w = 58, h = 58

      if (enemyBruteSheetLoaded && enemyBruteSheetImg) {
        const frameIdx = Math.floor(((game.elapsed * 9) + (enemy.x * 0.04 + enemy.y * 0.02)) % 8)
        const col = frameIdx % 4
        const row = Math.floor(frameIdx / 4)
        ctx.drawImage(enemyBruteSheetImg, col * 180, row * 180, 180, 180, -w / 2, -h / 2, w, h)
        if (enemy.hit > 0) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(0.45, (enemy.hit / 0.16) * 0.45)
          ctx.drawImage(enemyBruteSheetImg, col * 180, row * 180, 180, 180, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
      } else {
        ctx.drawImage(enemyBruteImg, -w / 2, -h / 2, w, h)
        if (enemy.hit > 0) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(0.45, (enemy.hit / 0.16) * 0.45)
          ctx.drawImage(enemyBruteImg, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
      }
      ctx.restore()
    } else if (enemy.kind === 'wisp' && ((enemyWispSheetLoaded && enemyWispSheetImg) || (enemyWispLoaded && enemyWispImg))) {
      ctx.save()
      const hitSquash = enemy.hit > 0 ? Math.sin((enemy.hit / 0.16) * Math.PI) * 0.2 : 0
      const hoverBob = Math.sin(game.elapsed * 6 + enemy.x * 0.5) * 3
      const squish = Math.sin(game.elapsed * 8 + enemy.y * 0.5) * 0.08
      ctx.translate(enemy.x, enemy.y + hoverBob)
      const facingRight = (game.player ? game.player.x >= enemy.x : true)
      ctx.scale((facingRight ? -1 : 1) * (1 + hitSquash - squish * 0.6), 1 - hitSquash + squish)
      if (enemy.opacity !== undefined) ctx.globalAlpha = enemy.opacity
      const w = 44, h = 44

      if (enemyWispSheetLoaded && enemyWispSheetImg) {
        const frameIdx = Math.floor(((game.elapsed * 9) + (enemy.x * 0.05 + enemy.y * 0.03)) % 8)
        const col = frameIdx % 4
        const row = Math.floor(frameIdx / 4)
        ctx.drawImage(enemyWispSheetImg, col * 160, row * 160, 160, 160, -w / 2, -h / 2, w, h)
        if (enemy.hit > 0) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(0.45, (enemy.hit / 0.16) * 0.45)
          ctx.drawImage(enemyWispSheetImg, col * 160, row * 160, 160, 160, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
      } else {
        ctx.drawImage(enemyWispImg, -w / 2, -h / 2, w, h)
        if (enemy.hit > 0) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.min(0.45, (enemy.hit / 0.16) * 0.45)
          ctx.drawImage(enemyWispImg, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
      }
      ctx.restore()
    } else {
      ctx.save()
      const hitSquash = enemy.hit > 0 ? Math.sin((enemy.hit / 0.16) * Math.PI) * 0.18 : 0
      ctx.translate(enemy.x, enemy.y)
      ctx.scale(1 + hitSquash, 1 - hitSquash * 0.8)
      if (enemy.opacity !== undefined) ctx.globalAlpha = enemy.opacity
      ctx.beginPath()
      ctx.arc(0, 0, enemy.r, 0, Math.PI * 2)
      ctx.fillStyle = enemy.hit > 0 ? '#f3eee0' : enemy.color
      ctx.fill()
      ctx.restore()
    }

    // 绘制血条与剩余血量数值（受击、血量未满或精英怪常驻显示）
    const isElite = enemy.isElite || enemy.kind === 'elite_brute' || enemy.kind === 'elite_frost_brute'
    if (isElite || enemy.hp < enemy.maxHp || enemy.hit > 0) {
      ctx.save()
      if (enemy.opacity !== undefined) ctx.globalAlpha = enemy.opacity
      const barW = isElite ? 68 : Math.max(30, (enemy.r || 12) * 2.2)
      const barH = isElite ? 6 : 4.5
      const barX = enemy.x - barW / 2
      const barY = enemy.y - (enemy.r || 12) - (isElite ? 18 : 12)
      const hpPct = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp))

      // 底槽阴影与背景
      ctx.fillStyle = 'rgba(10, 15, 20, 0.85)'
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2)

      // 血量填充（深红渐变至亮红，精英怪带金红/冰蓝渐变）
      if (isElite) {
        const isFrost = enemy.kind === 'elite_frost_brute'
        const hpGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY)
        if (isFrost) {
          hpGrad.addColorStop(0, '#0284c7')
          hpGrad.addColorStop(0.6, '#38bdf8')
          hpGrad.addColorStop(1, '#bae6fd')
        } else {
          hpGrad.addColorStop(0, '#d62828')
          hpGrad.addColorStop(0.6, '#f77f00')
          hpGrad.addColorStop(1, '#fcbf49')
        }
        ctx.fillStyle = hpGrad
      } else {
        ctx.fillStyle = '#ff4d4f'
      }
      ctx.fillRect(barX, barY, barW * hpPct, barH)

      // 精英怪金框/冰蓝银框与尊号
      if (isElite) {
        const isFrost = enemy.kind === 'elite_frost_brute'
        ctx.strokeStyle = isFrost ? '#bae6fd' : '#ffd166'
        ctx.lineWidth = 1.2
        ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2)

        ctx.font = "bold 11px 'Noto Sans SC', sans-serif"
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillStyle = isFrost ? '#bae6fd' : '#ffd166'
        ctx.shadowColor = '#000000'
        ctx.shadowBlur = 4
        ctx.fillText(enemy.eliteName || (isFrost ? '【精英】玄霜凝晶巨兕' : '【精英】赤炼熔岩巨兕'), enemy.x, barY - 3)
        ctx.shadowBlur = 0
      }

      // 剩余血量数值文本
      ctx.font = "bold 10px 'Noto Sans SC', sans-serif"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      const curHp = Math.max(0, Math.ceil(enemy.hp))
      const hpText = String(curHp)

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)'
      ctx.lineWidth = 2.5
      ctx.strokeText(hpText, enemy.x, barY - 1)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(hpText, enemy.x, barY - 1)
      ctx.restore()
    }
  }

  // 绘制浮动伤害飘字
  if (game.showFloatingDamage !== false && game.damageNumbers && game.damageNumbers.length) {
    for (const dn of game.damageNumbers) {
      const alpha = Math.max(0, Math.min(1, dn.life / dn.maxLife))
      ctx.save()
      ctx.font = "bold 12px 'Noto Sans SC', sans-serif"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = dn.color || '#ffd166'
      ctx.globalAlpha = alpha
      ctx.strokeStyle = 'rgba(10, 15, 20, 0.9)'
      ctx.lineWidth = 2.5
      ctx.strokeText('-' + dn.text, dn.x, dn.y)
      ctx.fillText('-' + dn.text, dn.x, dn.y)
      ctx.restore()
    }
  }

  // 绘制随行灵兽（青羽灵狐）
  drawPetFox(ctx, game.elapsed)

  // 绘制玩家角色 2.5D 模型
  drawPlayerModel(game.player, game.elapsed)

  // 绘制身侧环绕法宝
  drawFloatingWeapons(game.player, game.weapons, game.elapsed)

  // 绘制随身赤炎宝葫芦
  drawFloatingGourd(ctx, game.player, game.elapsed)

  // 绘制回风阵
  if (game.formations.length) {
    const p = game.player
    const fR = (game.attackRange || 140) * 0.75
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(game.elapsed * 1.8)
    ctx.strokeStyle = 'rgba(100, 232, 203, 0.45)'
    ctx.lineWidth = 2
    ctx.setLineDash([12, 16])
    ctx.beginPath()
    ctx.arc(0, 0, fR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  if (game.flash > 0) {
    ctx.fillStyle = `rgba(232, 202, 117, ${game.flash * .28})`
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
  }

  // 关卡清场过渡
  if (game.clearingStage) {
    if (game.stageClearPhase === 'freeze') {
      for (const enemy of game.enemies) {
        ctx.save()
        ctx.strokeStyle = 'rgba(240, 220, 140, 0.55)'
        ctx.lineWidth = 1.4
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.arc(enemy.x, enemy.y, (enemy.r || 12) + 8, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }

    if (stageClearPhase === 'settle') {
      const pR = (stageClearPhaseTimer / 0.75) * 420
      const pAlpha = Math.max(0, 1 - stageClearPhaseTimer / 0.75)
      ctx.save()
      ctx.strokeStyle = `rgba(255, 230, 140, ${pAlpha * 0.75})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(game.player.x, game.player.y, pR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    ctx.save()
    ctx.fillStyle = 'rgba(8, 14, 18, 0.72)'
    ctx.fillRect(ARENA_WIDTH / 2 - 200, 24, 400, 48)
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 1.5
    ctx.strokeRect(ARENA_WIDTH / 2 - 200, 24, 400, 48)
    ctx.fillStyle = '#fef08a'
    ctx.font = 'bold 18px "Noto Serif SC", serif'
    ctx.textAlign = 'center'
    let bannerText = '☯ 历练圆满 · 诸邪退散 ☯'
    if (stageClearPhase === 'vacuum') bannerText = '✨ 神识归元 · 收纳遗珍 ✨'
    if (stageClearPhase === 'settle') bannerText = '☯ 灵气归元 · 参悟机缘 ☯'
    ctx.fillText(bannerText, ARENA_WIDTH / 2, 54)
    ctx.restore()
  }
  ctx.restore()
}


function frame(now) {
  const dt = Math.min(.034, (now - game.last) / 1000)
  game.last = now
  try {
    if (typeof pollGamepad === 'function') pollGamepad(dt)
    update(dt)
    draw()
  } catch (err) {
    console.error('Frame loop error:', err)
  } finally {
    requestAnimationFrame(frame)
  }
}

window.addEventListener('keydown', e => {
  keys.add(e.key.toLowerCase())
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault()
})
window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()))

// 调试钩子：浏览器控制台可直接查看运行时状态，便于调参
window.__game = game

addLog('踏入青冥秘境，第 1 关开始。', true)
addLog('提示：坚持 60 秒，结算时择卡并清点物品。')
ui.stageContinue.onclick = null
updateUI()
requestAnimationFrame(frame)

/* ---------- 全屏界面导航、选角与设置交互 ---------- */

function showScreen(screenId) {
  game.screen = screenId
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'))
  const target = document.querySelector(`#screen-${screenId}`)
  if (target) target.classList.remove('hidden')

  if (screenId === 'title') {
    closeModal('modal-pause')
    closeModal('modal-loot-review')
    closeModal('modal-settings')
    closeModal('modal-test-panel')
    const testToolbar = document.querySelector('#test-hud-toolbar')
    if (testToolbar) testToolbar.classList.add('hidden')
    game.isTestLevel = false
    if (typeof stopBossStage === 'function') stopBossStage()
    game.isBossStage = false
    game.pendingBossStage = false
    game.boss = null
    game.bossAoEs = []
    game.bossProjectiles = []
    game.isEndlessMode = false
    game.paused = false
    const bossHud = document.querySelector('#boss-hud-bar')
    if (bossHud) bossHud.classList.add('hidden')
    if (typeof ui !== 'undefined' && ui.timer) ui.timer.classList.remove('hidden')
  } else if (screenId === 'char-select') {
    if (typeof stopBossStage === 'function') stopBossStage()
    game.isBossStage = false
    game.pendingBossStage = false
    game.boss = null
    game.bossAoEs = []
    game.bossProjectiles = []
    charSelectStep = 1
    renderCharSelect()
  } else if (screenId === 'codex') {
    if (typeof weaponOrbitAnimId !== 'undefined' && weaponOrbitAnimId) {
      cancelAnimationFrame(weaponOrbitAnimId)
      weaponOrbitAnimId = null
    }
    if (typeof renderCodexGrid === 'function') renderCodexGrid()
  } else {
    if (typeof weaponOrbitAnimId !== 'undefined' && weaponOrbitAnimId) {
      cancelAnimationFrame(weaponOrbitAnimId)
      weaponOrbitAnimId = null
    }
  }
}

function openModal(modalId) {
  const modal = document.querySelector(`#${modalId}`)
  if (modal) modal.classList.remove('hidden')
}

function closeModal(modalId) {
  const modal = document.querySelector(`#${modalId}`)
  if (modal) modal.classList.add('hidden')
}

// 1. 登录主界面事件
const btnTitleStart = document.querySelector('#btn-title-start')
if (btnTitleStart) {
  btnTitleStart.addEventListener('click', () => {
    sound.click()
    showScreen('char-select')
  })
}

const btnTitleTest = document.querySelector('#btn-title-test')
if (btnTitleTest) {
  btnTitleTest.addEventListener('click', () => {
    sound.click()
    startTestLevel()
  })
}

const btnTitleCodex = document.querySelector('#btn-title-codex')
if (btnTitleCodex) {
  btnTitleCodex.addEventListener('click', () => {
    sound.click()
    showScreen('codex')
  })
}

const btnTitleSettings = document.querySelector('#btn-title-settings')
if (btnTitleSettings) {
  btnTitleSettings.addEventListener('click', () => {
    sound.click()
    openModal('modal-settings')
  })
}

// 2. 角色选择界面事件
const btnCharBack = document.querySelector('#btn-char-back')
if (btnCharBack) {
  btnCharBack.addEventListener('click', () => {
    sound.click()
    charSelectStep = 1
    if (typeof weaponOrbitAnimId !== 'undefined' && weaponOrbitAnimId) {
      cancelAnimationFrame(weaponOrbitAnimId)
      weaponOrbitAnimId = null
    }
    showScreen('title')
  })
}

const btnWeaponBack = document.querySelector('#btn-weapon-back')
if (btnWeaponBack) {
  btnWeaponBack.addEventListener('click', () => {
    sound.click()
    charSelectStep = 1
    if (typeof weaponOrbitAnimId !== 'undefined' && weaponOrbitAnimId) {
      cancelAnimationFrame(weaponOrbitAnimId)
      weaponOrbitAnimId = null
    }
    renderCharSelect()
  })
}

const btnCharConfirm = document.querySelector('#btn-char-confirm')
if (btnCharConfirm) {
  btnCharConfirm.addEventListener('click', () => {
    sound.click()
    if (typeof weaponOrbitAnimId !== 'undefined' && weaponOrbitAnimId) {
      cancelAnimationFrame(weaponOrbitAnimId)
      weaponOrbitAnimId = null
    }
    startRunFromSelection()
  })
}

// 3. 战斗中右上角暂停按钮
const btnPause = document.querySelector('#btn-pause')
if (btnPause) {
  btnPause.addEventListener('click', () => {
    sound.click()
    togglePause()
  })
}

// 4. 暂停面板控制与详细属性渲染
function togglePause(forced) {
  const modalLoot = document.querySelector('#modal-loot-review')
  if (modalLoot && !modalLoot.classList.contains('hidden')) return
  const pauseModal = document.querySelector('#modal-pause')
  const next = forced !== undefined ? forced : !game.paused
  game.paused = next

  if (game.paused) {
    renderPausePanel()
    openModal('modal-pause')
  } else {
    closeModal('modal-pause')
  }
}

function renderPausePanel() {
  const pauseRealm = document.querySelector('#pause-realm')
  const pauseQi = document.querySelector('#pause-qi')
  const pauseHp = document.querySelector('#pause-hp')
  const pauseBaseHp = document.querySelector('#pause-base-hp')
  const pauseRange = document.querySelector('#pause-range')
  const pauseAttack = document.querySelector('#pause-attack')
  const pauseSpeed = document.querySelector('#pause-speed')
  const pauseMoveSpeed = document.querySelector('#pause-movespeed')
  const pauseTiles = document.querySelector('#pause-build-tiles')

  if (pauseRealm) pauseRealm.textContent = realmLabel()
  if (pauseQi) pauseQi.textContent = `${game.xp} / ${game.xpNeed}`
  if (pauseHp) pauseHp.textContent = `${Math.ceil(game.hp)} / ${game.maxHp}`
  if (pauseBaseHp) pauseBaseHp.textContent = `基础 ${game.baseHp} (${game.bonusHp >= 0 ? '+' : ''}${game.bonusHp})`
  if (pauseRange) pauseRange.textContent = `${Math.round(game.attackRange || 140)} px`
  if (pauseAttack) pauseAttack.textContent = `${game.attack} 点`
  if (pauseSpeed) pauseSpeed.textContent = `${(1 / Math.max(.18, .78 / game.attackSpeed)).toFixed(1)} 次/秒`
  if (pauseMoveSpeed) pauseMoveSpeed.textContent = `${Math.round(game.moveSpeed)} px/s`

  if (pauseTiles) {
    const builds = [...game.weapons, ...game.formations, ...game.passives, ...game.pets, ...game.treasures]
    if (!builds.length) {
      pauseTiles.innerHTML = '<div class="build-tile-empty">初涉仙途，暂无法宝法门</div>'
    } else {
      pauseTiles.innerHTML = builds.map(b => `
        <div class="build-tile" title="${b.name} (${b.category})&#10;${b.detail || ''}">
          <span class="tile-icon">${b.icon || '✧'}</span>
          <span class="tile-name">${b.name}</span>
          ${b.count > 1 ? `<span class="tile-count">×${b.count}</span>` : ''}
        </div>
      `).join('')
    }
  }
}

let charSelectStep = 1
let weaponOrbitAnimId = null

function drawPreviewOrbitWeapon(ctx, wType, cx, cy, rx, ry, orbitAngle, props, t, scaleFactor = 1.0) {
  const tilt = -0.08
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)

  const ox = Math.cos(orbitAngle) * rx
  const oy = Math.sin(orbitAngle) * ry + Math.sin(t * 3.5 + orbitAngle) * 2.5

  const wx = cx + (ox * cosT - oy * sinT)
  const wy = cy + (ox * sinT + oy * cosT)

  const tangentAngle = orbitAngle + Math.PI * 0.55 + tilt

  ctx.save()
  for (let p = 1; p <= 3; p++) {
    const trailAngle = orbitAngle - p * 0.12
    const tox = Math.cos(trailAngle) * rx
    const toy = Math.sin(trailAngle) * ry
    const tx = cx + (tox * cosT - toy * sinT)
    const ty = cy + (tox * sinT + toy * cosT)
    ctx.fillStyle = props.glow || '#64e8cb'
    ctx.globalAlpha = (0.42 - p * 0.11) * scaleFactor
    ctx.beginPath()
    ctx.arc(tx, ty, (5.0 - p * 1.1) * scaleFactor, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  ctx.save()
  const drawn = (typeof drawOrientedWeaponSprite === 'function')
    ? drawOrientedWeaponSprite(ctx, wType, wx, wy, tangentAngle, (props.size || 42) * scaleFactor, props.glow || '#64e8cb')
    : false
  if (!drawn && props.fallback) {
    props.fallback(ctx, wx, wy, tangentAngle, scaleFactor, false, 0)
  }
  ctx.restore()
}

function startWeaponOrbitAnimation() {
  if (weaponOrbitAnimId) {
    cancelAnimationFrame(weaponOrbitAnimId)
    weaponOrbitAnimId = null
  }
  if (typeof window === 'undefined' || isHeadless || typeof requestAnimationFrame === 'undefined') return

  const canvas = document.querySelector('#weapon-orbit-canvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let startTime = performance.now()

  function frame(now) {
    if (typeof game !== 'undefined' && game.screen !== 'char-select') {
      weaponOrbitAnimId = null
      return
    }
    if (charSelectStep !== 2) {
      weaponOrbitAnimId = null
      return
    }

    const t = (now - startTime) / 1000
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const curChar = (typeof characters !== 'undefined' && characters[selectedCharIndex]) || characters[0]
    const curWeapon = (curChar && curChar.weapons && curChar.weapons[selectedWeaponIndex]) || (curChar && curChar.weapons && curChar.weapons[0]) || {}
    const wType = (curWeapon.type || 'sword').replace(/^(sword_|spell_|body_)/, '')
    const props = (typeof WEAPON_RENDER_PROPS !== 'undefined' && WEAPON_RENDER_PROPS[wType]) || { size: 44, glow: '#64e8cb' }

    const cx = w / 2
    const cy = h / 2 + 10
    const bob = Math.sin(t * 2.6) * 3.5

    // 1. 地面灵气法阵光晕与符文
    ctx.save()
    ctx.translate(cx, cy + 90)
    ctx.scale(1, 0.32)
    const groundGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 135)
    groundGrad.addColorStop(0, `${props.glow}44`)
    groundGrad.addColorStop(0.5, 'rgba(184, 152, 82, 0.15)')
    groundGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = groundGrad
    ctx.beginPath()
    ctx.arc(0, 0, 135, 0, Math.PI * 2)
    ctx.fill()

    ctx.rotate(t * 0.35)
    ctx.strokeStyle = `${props.glow}66`
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(0, 0, 115, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(212, 181, 104, 0.45)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([12, 8])
    ctx.beginPath()
    ctx.arc(0, 0, 88, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    // 2. 环绕轨迹物理参数
    const rx = 118
    const ry = 42
    const orbitSpeed = ['daggers'].includes(wType) ? 3.4 : (['sword', 'thunder_sword'].includes(wType) ? 2.5 : 2.0)
    const baseOrbitAngle = t * orbitSpeed
    const weaponCount = ['sword', 'thunder_sword', 'pill_poison'].includes(wType) ? 3 : (['daggers', 'beast_horn'].includes(wType) ? 2 : 1)

    // 绘制剑环轨迹光带 (后半段)
    ctx.save()
    ctx.strokeStyle = `${props.glow}33`
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.ellipse(cx, cy - 8 + bob, rx, ry, -0.08, Math.PI, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    // 3. 绘制处于角色后方的武器 (sin(orbitAngle) < 0)
    for (let i = 0; i < weaponCount; i++) {
      const angle = baseOrbitAngle + (i / weaponCount) * Math.PI * 2
      const sinA = Math.sin(angle)
      if (sinA < 0) {
        drawPreviewOrbitWeapon(ctx, wType, cx, cy - 8 + bob, rx, ry, angle, props, t, 0.88)
      }
    }

    // 4. 绘制角色本体 (动作序列帧优先，其次立绘，最后矢量模型)
    ctx.save()
    const charSprite = (typeof charSprites !== 'undefined') ? charSprites[curChar.id] : null
    const charImg = (charSprite && charSprite.loaded && charSprite.img) ? charSprite.img : null
    let drewSheet = false

    // 与战斗内保持同一套解析逻辑：统一走 getPlayerWeaponSheet，
    // 法修等职业才能用到自己的帧集；未登记帧集的职业返回 null 回退立绘。
    // （原先此处硬编码 curChar.id === 'sword' 并用 sword_qingfeng 兜底，
    //   导致清虚仙子在候选大厅只显示静态立绘，且兜底会把剑修帧错给别的职业）
    const previewSheet = (typeof getPlayerWeaponSheet === 'function')
      ? getPlayerWeaponSheet({ charId: curChar.id, weaponId: curWeapon.id, weaponType: curWeapon.type })
      : null
    if (previewSheet && previewSheet.loaded && previewSheet.img) {
      // 在法宝环绕展台中循环演练该法宝的 6 帧起手与斩击连招。
      // 节奏刻意做成"待机停留 + 连招快放"：帧 0 是待机、帧 1~5 才是起手到收招，
      // 若对 6 帧做匀速循环（原先 2.8fps，每帧约 357ms），既慢得像幻灯片，
      // 又把待机和出招混成一串，看不出攻击的爆发感。
      const IDLE_HOLD = 0.5      // 待机帧停留秒数
      const ACTION_FPS = 15      // 连招帧率：5 帧约 0.33s，接近战斗内 0.28s 的出招时长
      const actionSpan = 5 / ACTION_FPS
      const loopT = t % (IDLE_HOLD + actionSpan)
      const frameIdx = loopT < IDLE_HOLD
        ? 0
        : Math.min(5, 1 + Math.floor((loopT - IDLE_HOLD) * ACTION_FPS))
      const cols = previewSheet.cols || 3
      const fw = previewSheet.frameW || 180
      const fh = previewSheet.frameH || 180
      const dw = 170
      const dh = 170
      // 序列帧内角色脚底位于 93% 处，据此把落脚点对到地面法阵上，
      // 与下面立绘分支的视觉落点保持一致
      const drawY = cy + 85 - dh * 0.93 + bob
      ctx.shadowColor = props.glow || 'rgba(100, 232, 203, 0.7)'
      ctx.shadowBlur = 18
      ctx.drawImage(previewSheet.img, (frameIdx % cols) * fw, Math.floor(frameIdx / cols) * fh, fw, fh,
        cx - dw / 2, drawY, dw, dh)
      drewSheet = true
    }


    if (!drewSheet) {
      if (charImg) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
        ctx.shadowBlur = 18
        const drawW = 145
        const drawH = 195
        ctx.drawImage(charImg, cx - drawW / 2, cy - drawH / 2 + bob - 15, drawW, drawH)
      } else {
        if (typeof drawVectorPlayerModel === 'function') {
          const fakeP = { x: cx, y: cy + bob - 10 }
          drawVectorPlayerModel(ctx, fakeP, curChar.id, true, 0, 0, 0, 0, 0, false, 0, null)
        }
      }
    }
    ctx.restore()

    // 5. 绘制剑环轨迹光带 (前半段)
    ctx.save()
    ctx.strokeStyle = `${props.glow}66`
    ctx.lineWidth = 2.2
    ctx.shadowColor = props.glow
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.ellipse(cx, cy - 8 + bob, rx, ry, -0.08, 0, Math.PI)
    ctx.stroke()
    ctx.restore()

    // 6. 绘制处于角色前方的武器 (sin(orbitAngle) >= 0)
    for (let i = 0; i < weaponCount; i++) {
      const angle = baseOrbitAngle + (i / weaponCount) * Math.PI * 2
      const sinA = Math.sin(angle)
      if (sinA >= 0) {
        drawPreviewOrbitWeapon(ctx, wType, cx, cy - 8 + bob, rx, ry, angle, props, t, 1.0)
      }
    }

    weaponOrbitAnimId = requestAnimationFrame(frame)
  }

  weaponOrbitAnimId = requestAnimationFrame(frame)
}

function renderCharSelect() {
  const container = document.querySelector('#char-select-cards')
  if (!container) return

  const curChar = (typeof characters !== 'undefined' && characters[selectedCharIndex]) || characters[0]
  if (!curChar) return
  if (selectedWeaponIndex >= curChar.weapons.length) selectedWeaponIndex = 0
  const curWeapon = curChar.weapons[selectedWeaponIndex] || curChar.weapons[0]

  const titleEl = document.querySelector('#char-header-title')
  const subEl = document.querySelector('#char-header-sub')
  const btnWeaponBack = document.querySelector('#btn-weapon-back')
  const btnCharBack = document.querySelector('#btn-char-back')
  const actionsBar = document.querySelector('#char-actions-bar')
  const hintsEl = document.querySelector('#char-gamepad-hints')

  if (charSelectStep === 1) {
    if (weaponOrbitAnimId) {
      cancelAnimationFrame(weaponOrbitAnimId)
      weaponOrbitAnimId = null
    }

    if (titleEl) titleEl.textContent = '道号择定 · 宗门真传'
    if (subEl) subEl.textContent = '挑选入世历练弟子（八派宗门）踏入仙途'
    if (btnWeaponBack) btnWeaponBack.classList.add('hidden')
    if (btnCharBack) btnCharBack.classList.remove('hidden')
    if (actionsBar) actionsBar.style.display = 'none'
    if (hintsEl) {
      hintsEl.classList.remove('hidden')
      hintsEl.textContent = '🎮 [LB/RB] 切换弟子 · [A] 择定道号 · [B] 返回主页'
    }

    const hpVal = curChar.id === 'body' ? 150 : 100
    const atkVal = curChar.id === 'sword' ? 28 : (curChar.id === 'demon' ? 25 : (curChar.id === 'beast' ? 20 : 18))
    const spdVal = curChar.id === 'body' ? 235 : (curChar.id === 'ghost' ? 230 : 220)
    const pickVal = curChar.id === 'spell' ? 121 : (curChar.id === 'beast' ? 111 : 86)
    const rngVal = curChar.id === 'spell' ? 170 : (curChar.id === 'formation_master' ? 170 : 140)

    container.innerHTML = `
      <div class="char-step1-container">
        <!-- 上方区域: 动态立绘与基本信息 -->
        <div class="char-upper-region">
          <!-- 左侧: 动态立绘展台 -->
          <div class="char-portrait-showcase">
            <div class="char-halo-bg">
              <div class="char-halo-ring"></div>
            </div>
            <div class="char-portrait-frame">
              <img src="${curChar.spriteUrl}" class="char-full-portrait" alt="${curChar.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <span class="char-avatar-fallback" style="display:none; font-size: 80px;">${curChar.icon}</span>
            </div>
            <div class="char-class-floating-badge">${curChar.class} · 宗门真传</div>
          </div>

          <!-- 右侧: 基本信息与属性 -->
          <div class="char-details-panel">
            <div class="char-details-header">
              <div class="char-title-wrap">
                <span class="char-badge-sect">${curChar.class}</span>
                <h1 class="char-hero-name">${curChar.name}</h1>
              </div>
              <div class="char-hero-motto">“${curChar.desc}”</div>
            </div>

            <!-- 本命天赋 -->
            <div class="char-passive-box">
              <div class="passive-box-title">
                <span class="passive-icon">✧</span>
                <span>本命真传 · 灵根特质</span>
              </div>
              <div class="passive-box-desc">${curChar.passiveText}</div>
            </div>

            <!-- 初始底蕴属性 -->
            <div class="char-stats-grid">
              <div class="char-stat-card">
                <span class="stat-label">初始气血</span>
                <span class="stat-val hp">${hpVal}</span>
              </div>
              <div class="char-stat-card">
                <span class="stat-label">基础攻击</span>
                <span class="stat-val atk">${atkVal}</span>
              </div>
              <div class="char-stat-card">
                <span class="stat-label">身法遁速</span>
                <span class="stat-val spd">${spdVal} px/s</span>
              </div>
              <div class="char-stat-card">
                <span class="stat-label">神识拾取</span>
                <span class="stat-val pick">${pickVal} px</span>
              </div>
              <div class="char-stat-card">
                <span class="stat-label">灵识感知</span>
                <span class="stat-val rng">${rngVal} px</span>
              </div>
              <div class="char-stat-card">
                <span class="stat-label">起手法宝</span>
                <span class="stat-val wpn">${curChar.weapons.length} 门本命神兵</span>
              </div>
            </div>

            <!-- 确认进入二级界面选择武器按钮 -->
            <button class="btn-step1-next" id="btn-step1-confirm">
              <span>择定道号 · 挑选起手法宝</span>
              <span class="btn-arrow">➔</span>
            </button>
          </div>
        </div>

        <!-- 下方区域: 角色列表，只有角色贴图，无具体信息 -->
        <div class="char-lower-region">
          <div class="char-lower-bar-header">
            <span class="strip-label">八派宗门 · 历练弟子</span>
            <span class="strip-count">${selectedCharIndex + 1} / ${characters.length}</span>
          </div>
          <div class="char-avatar-strip">
            ${characters.map((c, idx) => `
              <button type="button" class="char-avatar-tile${idx === selectedCharIndex ? ' active' : ''}" data-char="${idx}" title="${c.name} (${c.class})">
                <div class="char-avatar-inner">
                  <img src="${c.spriteUrl}" class="char-strip-avatar-img" alt="${c.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                  <span class="char-avatar-fallback" style="display:none; font-size: 32px; line-height: 74px; text-align: center;">${c.icon}</span>
                </div>
                <div class="char-avatar-selector-pip"></div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `

    container.querySelectorAll('.char-avatar-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const idx = Number(tile.dataset.char)
        if (idx !== selectedCharIndex) {
          selectedCharIndex = idx
          selectedWeaponIndex = 0
          if (sound && sound.click) sound.click()
          renderCharSelect()
        }
      })
    })

    const btnNext = container.querySelector('#btn-step1-confirm')
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        charSelectStep = 2
        if (sound && sound.click) sound.click()
        renderCharSelect()
      })
    }
  } else {
    // Step 2: 二级界面 · 选择武器 (带角色周围法宝环绕展示)
    if (titleEl) titleEl.textContent = '本命法宝择定 · 起手神兵'
    if (subEl) subEl.textContent = `为【${curChar.name}】择定起手本命法宝，法宝将随身飞旋护体迎敌`
    if (btnWeaponBack) btnWeaponBack.classList.remove('hidden')
    if (btnCharBack) btnCharBack.classList.add('hidden')
    if (actionsBar) actionsBar.style.display = 'none'
    if (hintsEl) {
      hintsEl.classList.remove('hidden')
      hintsEl.textContent = '🎮 [LT/RT/上下] 切换法宝 · [A] 启程历练 · [B] 重选道号'
    }

    container.innerHTML = `
      <div class="char-step2-container">
        <!-- 左侧: 角色环绕武器动态展台 -->
        <div class="weapon-orbit-stage">
          <div class="stage-title-tag">
            <span class="stage-disc-name">${curChar.name} · ${curChar.class}</span>
            <span class="stage-orbit-hint">✧ 法宝环绕护体效果 ✧</span>
          </div>
          <div class="canvas-wrap">
            <canvas id="weapon-orbit-canvas" width="460" height="340"></canvas>
          </div>
          <div class="stage-current-weapon-label">
            当前起手法宝：<strong style="color: ${curWeapon.bulletColor || '#e5c572'}">${curWeapon.name}</strong> (${curWeapon.type})
          </div>
        </div>

        <!-- 右侧: 三大本命起手法宝列表 -->
        <div class="weapon-selection-panel">
          <div class="weapon-panel-header">
            <h3>挑选入世本命法宝</h3>
            <p>法宝将于战斗中环绕周身自动索敌斩妖，点击切换实时预览环绕妙相</p>
          </div>
          <div class="weapon-cards-list">
            ${curChar.weapons.map((w, wIdx) => {
              const isAct = wIdx === selectedWeaponIndex
              const s = w.stats || { dmg: 20, spd: '1.2/s', rng: '140px', feat: '独门妙法' }
              return `
                <div class="weapon-select-card${isAct ? ' active' : ''}" data-weapon="${wIdx}">
                  <div class="w-card-left">
                    <div class="w-card-icon-box">
                      <img src="./weapon_${w.type}.png" class="w-card-icon-img" alt="${w.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                      <span class="weapon-icon-fallback" style="display:none;">${w.icon}</span>
                    </div>
                  </div>
                  <div class="w-card-body">
                    <div class="w-card-title-row">
                      <span class="w-card-name">${w.name}</span>
                      <span class="w-card-badge">${w.type}</span>
                      ${isAct ? '<span class="w-card-chosen-tag">已配装 ✦</span>' : ''}
                    </div>
                    <div class="w-card-desc">${w.desc}</div>
                    <div class="w-card-stats-row">
                      <span class="w-stat-pill dmg">伤害 <b>${s.dmg}</b></span>
                      <span class="w-stat-pill spd">攻速 <b>${s.spd}</b></span>
                      <span class="w-stat-pill rng">范围 <b>${s.rng}</b></span>
                      <span class="w-stat-pill feat">${s.feat}</span>
                    </div>
                  </div>
                </div>
              `
            }).join('')}
          </div>
          
          <button class="btn-start-run" id="btn-char-confirm-step2">
            <span>踏入青冥秘境 ➔</span>
          </button>
        </div>
      </div>
    `

    container.querySelectorAll('.weapon-select-card').forEach(card => {
      card.addEventListener('click', () => {
        const wIdx = Number(card.dataset.weapon)
        if (wIdx !== selectedWeaponIndex) {
          selectedWeaponIndex = wIdx
          if (sound && sound.click) sound.click()
          renderCharSelect()
        }
      })
    })

    const btnConfirmStep2 = container.querySelector('#btn-char-confirm-step2')
    if (btnConfirmStep2) {
      btnConfirmStep2.addEventListener('click', () => {
        if (sound && sound.click) sound.click()
        if (weaponOrbitAnimId) {
          cancelAnimationFrame(weaponOrbitAnimId)
          weaponOrbitAnimId = null
        }
        startRunFromSelection()
      })
    }

    if (!isHeadless) {
      startWeaponOrbitAnimation()
    }
  }
}

function startRunFromSelection() {
  if (typeof weaponOrbitAnimId !== 'undefined' && weaponOrbitAnimId) {
    cancelAnimationFrame(weaponOrbitAnimId)
    weaponOrbitAnimId = null
  }
  if (typeof stopBossStage === 'function') stopBossStage()
  game.isBossStage = false
  game.pendingBossStage = false
  game.primordialGodEncountered = false
  game.primordialGodTriggered = false
  game.boss = null
  game.bossAoEs = []
  game.bossProjectiles = []
  game.isEndlessMode = false
  game.endlessElapsed = 0
  game.endlessKills = 0
  const bossHud = document.querySelector('#boss-hud-bar')
  if (bossHud) bossHud.classList.add('hidden')
  if (typeof ui !== 'undefined' && ui.timer) ui.timer.classList.remove('hidden')

  game.stage = 1
  game.stageTime = STAGE_SECONDS
  game.stageElapsed = 0
  game.stageKills = 0
  game.bossesDefeated = 0
  game.defeatedRedDragon = false
  game.playerBurnTimer = 0
  game.playerBurnTick = 0
  game.playerBurnDmg = 0
  game.playerChillTimer = 0
  game.playerChillSlow = 0
  game.playerFreezeTimer = 0
  if (typeof initStageDropTracker === 'function') initStageDropTracker()
  game.spawnTimer = 0
  game.shotTimer = 0
  game.petTimer = 0
  game.thunderTimer = 0
  game.formationTimer = 0
  game.fireTimer = 0
  game.xp = 0
  game.xpNeed = FIRST_QI_COST
  game.kills = 0
  game.realm = 0
  game.subStage = 0
  game.baseHp = BASE_HP
  game.bonusHp = 0
  game.maxHp = BASE_HP
  game.hp = BASE_HP
  game.attack = 18
  game.attackSpeed = 1
  game.moveSpeed = 220
  game.pickup = 86
  game.baseAttackRange = 140
  game.bonusAttackRange = 0
  game.attackRange = 140
  game.petDamage = 42
  game.firePower = 1
  game.formationPower = 1
  game.thunderDamage = 0
  game.flash = 0
  game.passives = []
  game.formations = []
  game.pets = []
  game.petFox = null
  game.treasures = []
  game.enemies = []
  game.markers = []
  game.projectiles = []
  game.specialAttacks = []
  game.damageNumbers = []
  game.showFloatingDamage = true
  game.cameraShake = 0
  game._lastShakeTime = 0
  game.hammerRadiusBonus = 0
  game.dingRadiusBonus = 0
  game.dragonRangeBonus = 0
  game.daggerRangeBonus = 0
  game.baozhuRadiusBonus = 0
  game.baguaRadiusBonus = 0
  game.fuchenRangeBonus = 0
  game.thunderChainBonus = 0
  game.chainArcLevel = 0
  game.chainArcN = null
  game.chainArcs = []
  game.chainArcCooldown = 0
  game.blazingFireLevel = 0
  game.blazingBursts = []
  game.blazingMotes = []
  game.blazingEmberParticles = []
  game.pendingDetonations = []
  game._isDetonating = false
  game._currentAttackIsPrimary = false
  game.offensiveSlots = [null, null, null, null]
  game.drops = []
  game.particles = []
  game.zaps = []
  game.lootBag = []
  game.settlement = null
  game.clearingStage = false
  game.stageClearPhase = null
  stageClearPhase = 'freeze'
  stageClearPhaseTimer = 0
  stageClearTotalTimer = 0
  game.gameOver = false
  game.paused = false
  game.player.x = ARENA_WIDTH / 2
  game.player.y = ARENA_HEIGHT / 2
  game.player.invuln = 0
  game.player.attackTimer = 0
  game.player.attackAngle = 0

  if (ui.overlay) ui.overlay.classList.add('hidden')
  if (ui.stageContinue) ui.stageContinue.onclick = null
  closeModal('modal-loot-review')
  closeModal('modal-pause')
  closeModal('modal-settings')
  closeModal('modal-slot-replace')

  const char = characters[selectedCharIndex] || characters[0]
  const weapon = char.weapons[selectedWeaponIndex] || char.weapons[0]

  game.player.charId = char.id
  game.player.charName = char.name
  game.player.spriteUrl = char.spriteUrl
  game.player.weaponId = weapon.id
  game.player.weaponType = weapon.type

  // 初始化唯一的本命法宝
  game.weapons = [{
    id: weapon.id,
    weaponType: weapon.type,
    type: '本命法宝',
    name: weapon.name,
    icon: weapon.icon,
    image: weapon.image || `./weapon_${weapon.type}.png`,
    detail: weapon.desc,
    count: 1
  }]

  char.applyBonus(game)
  weapon.apply(game)
  game.weapons[0].detail = `${weapon.name} · 基础伤害 ${weapon.stats ? weapon.stats.dmg : game.attack}`
  addLog(`择定弟子「${char.name}」(${char.class})，执本命法宝「${weapon.name}」入世历练。`, true)

  recomputeMaxHp()
  recomputeAttackRange()
  game.hp = game.maxHp
  game.last = performance.now()

  showScreen('game')
  updateUI()
}

// 键盘事件增强
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase()

  // 角色择定与法宝选择页面键盘操作
  if (game.screen === 'char-select') {
    if (typeof charSelectStep !== 'undefined' && charSelectStep === 1) {
      if (e.key === 'ArrowLeft' || k === 'a') {
        selectedCharIndex = (selectedCharIndex - 1 + characters.length) % characters.length
        selectedWeaponIndex = 0
        if (sound && sound.click) sound.click()
        renderCharSelect()
      } else if (e.key === 'ArrowRight' || k === 'd') {
        selectedCharIndex = (selectedCharIndex + 1) % characters.length
        selectedWeaponIndex = 0
        if (sound && sound.click) sound.click()
        renderCharSelect()
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        charSelectStep = 2
        if (sound && sound.click) sound.click()
        renderCharSelect()
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        const btnBack = document.querySelector('#btn-char-back')
        if (btnBack) btnBack.click()
      }
    } else if (typeof charSelectStep !== 'undefined' && charSelectStep === 2) {
      const curChar = characters[selectedCharIndex]
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || k === 'w' || k === 'a') {
        selectedWeaponIndex = (selectedWeaponIndex - 1 + curChar.weapons.length) % curChar.weapons.length
        if (sound && sound.click) sound.click()
        renderCharSelect()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || k === 's' || k === 'd') {
        selectedWeaponIndex = (selectedWeaponIndex + 1) % curChar.weapons.length
        if (sound && sound.click) sound.click()
        renderCharSelect()
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const btnStep2 = document.querySelector('#btn-char-confirm-step2') || document.querySelector('#btn-char-confirm')
        if (btnStep2) btnStep2.click()
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        const btnBack = document.querySelector('#btn-weapon-back')
        if (btnBack) btnBack.click()
      }
    }
    return
  }

  if (k === 't') {
    if (game.isTestLevel && game.screen === 'game') {
      sound.click()
      toggleTestPanel()
      return
    }
  }

  if (e.key === 'Escape' || k === 'p') {
    const modalTestPanel = document.querySelector('#modal-test-panel')
    if (modalTestPanel && !modalTestPanel.classList.contains('hidden')) {
      closeModal('modal-test-panel')
      return
    }
    const modalSettings = document.querySelector('#modal-settings')
    if (modalSettings && !modalSettings.classList.contains('hidden')) {
      closeModal('modal-settings')
      return
    }
    if (game.screen === 'game' && !game.gameOver && !game.clearingStage) {
      sound.click()
      togglePause()
    }
  }
})

const btnPauseClose = document.querySelector('#btn-pause-close')
if (btnPauseClose) {
  btnPauseClose.addEventListener('click', () => {
    sound.click()
    togglePause(false)
  })
}

const btnPauseResume = document.querySelector('#btn-pause-resume')
if (btnPauseResume) {
  btnPauseResume.addEventListener('click', () => {
    sound.click()
    togglePause(false)
  })
}

const btnPauseTestLevel = document.querySelector('#btn-pause-test-level')
if (btnPauseTestLevel) {
  btnPauseTestLevel.addEventListener('click', () => {
    sound.click()
    closeModal('modal-pause')
    startTestLevel()
  })
}

const btnPauseSettings = document.querySelector('#btn-pause-settings')
if (btnPauseSettings) {
  btnPauseSettings.addEventListener('click', () => {
    sound.click()
    openModal('modal-settings')
  })
}

const btnPauseAbandon = document.querySelector('#btn-pause-abandon')
if (btnPauseAbandon) {
  btnPauseAbandon.addEventListener('click', () => {
    sound.click()
    closeModal('modal-pause')
    closeModal('modal-loot-review')
    if (typeof stopBossStage === 'function') stopBossStage()
    game.isBossStage = false
    game.pendingBossStage = false
    game.primordialGodEncountered = false
    game.primordialGodTriggered = false
    game.boss = null
    game.bossAoEs = []
    game.bossProjectiles = []
    game.isEndlessMode = false
    game.paused = false
    game.clearingStage = false
    game.player.invuln = 0
    game.stageClearPhase = null
    stageClearPhase = 'freeze'
    stageClearPhaseTimer = 0
    stageClearTotalTimer = 0
    game.specialAttacks = []
    const bossHud = document.querySelector('#boss-hud-bar')
    if (bossHud) bossHud.classList.add('hidden')
    if (typeof ui !== 'undefined' && ui.timer) ui.timer.classList.remove('hidden')
    showScreen('title')
  })
}

// 5. 战利品清点窗口事件
const btnLootKeep = document.querySelector('#btn-loot-keep')
if (btnLootKeep) {
  btnLootKeep.addEventListener('click', () => {
    sound.click()
    if (game.settlement && game.settlement.loot && game.settlement.loot[currentLootIndex]) {
      game.settlement.loot[currentLootIndex].keep = true
    }
    currentLootIndex++
    showCurrentLootModal()
  })
}

const btnLootDrop = document.querySelector('#btn-loot-drop')
if (btnLootDrop) {
  btnLootDrop.addEventListener('click', () => {
    sound.click()
    if (game.settlement && game.settlement.loot && game.settlement.loot[currentLootIndex]) {
      game.settlement.loot[currentLootIndex].keep = false
    }
    currentLootIndex++
    showCurrentLootModal()
  })
}

// 6. 设置面板事件
const btnSettingsClose = document.querySelector('#btn-settings-close')
if (btnSettingsClose) {
  btnSettingsClose.addEventListener('click', () => {
    sound.click()
    closeModal('modal-settings')
  })
}

const btnSettingsSave = document.querySelector('#btn-settings-save')
if (btnSettingsSave) {
  btnSettingsSave.addEventListener('click', () => {
    sound.click()
    closeModal('modal-settings')
  })
}

const volSlider = document.querySelector('#volume-slider')
const volText = document.querySelector('#volume-value')
if (volSlider) {
  volSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value)
    sound.setVolume(val / 100)
    if (volText) volText.textContent = val + '%'
  })
  volSlider.addEventListener('change', () => {
    sound.click()
  })
}

const btnTestSound = document.querySelector('#btn-test-sound')
if (btnTestSound) {
  btnTestSound.addEventListener('click', () => {
    sound.shoot()
  })
}

const btnToggleFloat = document.querySelector('#btn-toggle-float-num')
if (btnToggleFloat) {
  btnToggleFloat.addEventListener('click', () => {
    sound.click()
    game.showFloatingDamage = !game.showFloatingDamage
    btnToggleFloat.textContent = game.showFloatingDamage ? '显示伤害飘字' : '关闭伤害飘字'
  })
}

const btnToggleRumble = document.querySelector('#btn-toggle-rumble')
if (btnToggleRumble) {
  btnToggleRumble.addEventListener('click', () => {
    sound.click()
    gamepadState.rumbleEnabled = !gamepadState.rumbleEnabled
    btnToggleRumble.textContent = gamepadState.rumbleEnabled ? '震动已开启' : '震动已关闭'
    if (gamepadState.rumbleEnabled) pulseGamepad(0.3, 0.5, 200)
  })
}

const btnToggleFs = document.querySelector('#btn-toggle-fullscreen')
if (btnToggleFs) {
  btnToggleFs.addEventListener('click', () => {
    sound.click()
    if (typeof document !== 'undefined' && document.documentElement) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch?.(() => {})
        btnToggleFs.textContent = '退出全屏显示'
      } else {
        document.exitFullscreen?.().catch?.(() => {})
        btnToggleFs.textContent = '切换全屏显示'
      }
    }
  })
}

if (ui.soundToggle) {
  ui.soundToggle.addEventListener('click', () => {
    const isEnabled = sound.toggle()
    ui.soundToggle.classList.toggle('muted', !isEnabled)
    if (ui.soundIcon) ui.soundIcon.textContent = isEnabled ? '🔊' : '🔇'
    if (ui.soundText) ui.soundText.textContent = isEnabled ? '开启' : '静音'
    if (isEnabled) sound.click()
  })
}

/* ---------- 秘境图鉴系统 (Codex System) ---------- */

const CODEX_DATA = {
  characters: [
    {
      id: 'sword',
      name: '凌虚子',
      title: '青冥剑宗首席 · 剑修',
      tag: '本命中坚',
      icon: '⚔️',
      image: './player_anime.png',
      lore: '心如止水，人剑合一。手握三尺青锋，气荡八荒妖邪。生平好弄剑光穿云，独辟御剑周身游曳之秘法，凡近身妖魔，瞬息间皆为凌厉剑芒所噬。',
      stats: [
        { label: '初始生命', val: '100' },
        { label: '移动速度', val: '220 px/s' },
        { label: '神识范围', val: '140 px' },
        { label: '灵气拾取', val: '86 px' },
        { label: '被动命格', val: '剑气凌厉 (攻击 +25%)' }
      ],
      weapons: ['青锋灵剑', '疾风残刃', '奔雷古剑'],
      tactics: '极度擅长中远距离精准打击与单点爆破。开局自带高额攻击加成，配合「聚灵诀」扩大感知与「御风行」提速拉扯，可轻松风筝一切强敌。'
    },
    {
      id: 'spell',
      name: '清虚仙子',
      title: '太虚灵阁真传 · 法修',
      tag: '范围控场',
      icon: '✨',
      image: './player_fairy.png',
      lore: '道法自然，虚怀若谷。神念如微尘拂照周天，随手摘星化气。精研八卦阵道与混元星力，指尖灵诀轻掐，便能在万妖重围中从容步罡踏斗。',
      stats: [
        { label: '初始生命', val: '100' },
        { label: '移动速度', val: '220 px/s' },
        { label: '神识范围', val: '175 px (+35)' },
        { label: '灵气拾取', val: '121 px (+35)' },
        { label: '被动命格', val: '灵台清明 (感知/拾取 +35)' }
      ],
      weapons: ['八卦阵盘', '灵木拂尘', '混元宝珠'],
      tactics: '超凡的神识与拾取范围使发育搜刮节奏极快。武器皆附带大范围多段伤害或弱引力奇点聚怪，配合「回风阵」能形成固若金汤的范围防御圈。'
    },
    {
      id: 'body',
      name: '铁狂徒',
      title: '万象魔山尊者 · 体修',
      tag: '磐石撼地',
      icon: '🛡️',
      image: './player_body.png',
      lore: '肉身通玄，气血如龙。生平以九天罡风淬骨、九幽地火炼髓。任凭千万妖魔狂潮汹涌，亦难损其玄铁重躯分毫。一拳轰出，山崩地裂！',
      stats: [
        { label: '初始生命', val: '150 (+50)' },
        { label: '移动速度', val: '235 px/s (+15)' },
        { label: '神识范围', val: '140 px' },
        { label: '灵气拾取', val: '86 px' },
        { label: '被动命格', val: '金刚不坏 (生命 +50 / 移速 +15)' }
      ],
      weapons: ['九疑重鼎', '龙鳞霸甲', '破军金锤'],
      tactics: '天生拥有超强血量底蕴与生存容错。重鼎重砸与金锤裂地拥有强大的震退击飞和范围压制，适合迎头痛击正面妖群，容错率极高。'
    },
    {
      id: 'beast',
      name: '白灵儿',
      title: '万兽神谷真传 · 灵兽师',
      tag: '统御群兽',
      icon: '🐾',
      image: './player_beast.png',
      lore: '通灵万物，天生异禀。生于万兽古林，幼时与白虎灵雀同眠。执百兽金铃可号令八荒灵物，心念一动，灵鹰巡天、灵蛟破水，群兽护驾所向披靡。',
      stats: [
        { label: '初始生命', val: '110 (+10)' },
        { label: '移动速度', val: '230 px/s (+10)' },
        { label: '神识范围', val: '150 px (+10)' },
        { label: '灵气拾取', val: '100 px (+14)' },
        { label: '被动命格', val: '万灵感应 (灵宠攻击+30% / 攻速+15%)' }
      ],
      weapons: ['百兽金铃', '缚兽玄绫', '唤灵法螺'],
      tactics: '擅长驱策兽灵协同作战。自带灵宠增益，金铃与玄绫兼具范围震荡与软控减速，唤灵法螺可穿透击杀远端敌怪。'
    },
    {
      id: 'formation_master',
      name: '诸葛玄清',
      title: '天机奇门宗掌教 · 阵法师',
      tag: '九宫奇门',
      icon: '☯️',
      image: './player_formation.png',
      lore: '胸藏万象，步踏天纲。执量天玉尺定乾坤方位，四象诛邪旗划地为牢。谈笑间阴阳落子星罗棋布，任凭万千妖邪潮涌，入阵者皆成齑粉。',
      stats: [
        { label: '初始生命', val: '95 (-5)' },
        { label: '移动速度', val: '215 px/s (-5)' },
        { label: '神识范围', val: '185 px (+45)' },
        { label: '灵气拾取', val: '135 px (+49)' },
        { label: '被动命格', val: '奇门遁甲 (阵法持续+35% / 结界多段打击)' }
      ],
      weapons: ['四象诛邪旗', '天星弈棋', '量天玉尺'],
      tactics: '阵地战大师。诛邪旗与量天尺能在地面布下持续存在的大范围伤害与禁锢减速泥潭，棋子天降阴阳爆发，重重结界让敌人难以近身。'
    },
    {
      id: 'alchemist',
      name: '云舒',
      title: '神农百草门魁首 · 丹药师',
      tag: '丹火毒煞',
      icon: '🌿',
      image: './player_alchemist.png',
      lore: '手握乾坤炉，袖藏百草仙。辨识九幽异草，淬炼九转金丹。一念丹火纯阳济世疗伤，一念腐仙化骨寸草不生。药香所至，妖魔骨软筋酥。',
      stats: [
        { label: '初始生命', val: '120 (+20)' },
        { label: '移动速度', val: '220 px/s' },
        { label: '神识范围', val: '140 px' },
        { label: '灵气拾取', val: '110 px (+24)' },
        { label: '被动命格', val: '妙手回春 (丹药掉落率+25% / 药效+20%)' }
      ],
      weapons: ['紫金八卦炉', '碧玉药王杵', '千草腐仙葫'],
      tactics: '攻守兼备，续航能力极强。八卦炉喷涌真火扇面，药王杵重砸碎骨，腐仙葫芦留下大范围腐蚀毒雾池，极其擅长持久消耗战。'
    },
    {
      id: 'demon',
      name: '厉苍溟',
      title: '修罗血狱道魔尊 · 魔功修者',
      tag: '嗜血狂暴',
      icon: '🩸',
      image: './player_demon.png',
      lore: '逆天修道，以杀止杀。披玄黑血煞重袍，掌修罗血皇玺。越是浴血死战，凶威越发炽盛。狂刀挥出腥风血雨，修罗血浪吞噬万千神魂。',
      stats: [
        { label: '初始生命', val: '130 (+30)' },
        { label: '移动速度', val: '230 px/s (+10)' },
        { label: '神识范围', val: '130 px (-10)' },
        { label: '灵气拾取', val: '75 px (-11)' },
        { label: '被动命格', val: '逆命魔煞 (血量越低伤害越高，最高+50%)' }
      ],
      weapons: ['化血狂刀', '天魔血煞爪', '修罗血皇玺'],
      tactics: '狂战士输出流派。低血量时享有极高伤害狂暴倍率，化血狂刀高速贯穿斩击，血煞爪撕裂群体，血皇玺泰山压顶造成毁灭性血浪冲击。'
    },
    {
      id: 'ghost',
      name: '幽月',
      title: '酆都九幽引魂使 · 鬼修尊者',
      tag: '百鬼索命',
      icon: '👻',
      image: './player_ghost.png',
      lore: '身游九幽，魂驭阴阳。提白骨幽冥灯，摇百鬼聚灵幡。苍白鬼影与碧磷鬼火常伴左右，万千厉鬼呼啸夜行，令敌怪闻风丧胆、神魂尽丧。',
      stats: [
        { label: '初始生命', val: '85 (-15)' },
        { label: '移动速度', val: '240 px/s (+20)' },
        { label: '神识范围', val: '160 px (+20)' },
        { label: '灵气拾取', val: '115 px (+29)' },
        { label: '被动命格', val: '幽魂隐遁 (闪避率+15% / 击杀有概率召幽魂)' }
      ],
      weapons: ['幽冥引魂灯', '白骨哀丧棒', '百鬼聚灵幡'],
      tactics: '身法极其诡谲飘逸。引魂灯释放追踪鬼火自动锁敌，哀丧棒发出鬼哭震退环推开敌怪，聚灵幡释放鬼潮贯穿敌群。'
    }
  ],

  weapons: [
    {
      id: 'sword_qingfeng',
      name: '青锋灵剑',
      title: '剑修起手飞剑 · 本命神兵',
      tag: '单点索敌贯穿',
      icon: '🗡️',
      image: './weapon_sword.png',
      lore: '青冥剑宗传承本命飞剑，御剑凌虚悬浮游曳。遇敌时本体如穿云电芒呼啸贯穿敌阵，连续穿透并爆发青碧十字剑气斩。',
      stats: [
        { label: '基础伤害', val: '28' },
        { label: '攻击攻速', val: '1.3 次/秒 (0.78s)' },
        { label: '索敌神识', val: '140 px' },
        { label: '弹道速度', val: '370 px/s' },
        { label: '攻击模式', val: '悬浮伴行 · 飞出贯穿 · 十字剑斩' }
      ],
      upgrade: '升级卡片「流云飞剑」可使伤害 +12，并增加一柄周身环绕飞剑数量。',
      tactics: '单体杀伤力极高，优先清理高威胁精英怪，飞剑穿透轨迹能顺带清空直线上的杂鱼。'
    },
    {
      id: 'sword_jifeng',
      name: '疾风残刃',
      title: '剑修起手双刃 · 回旋飞刃',
      tag: '360°回旋风暴',
      icon: '🗡️',
      image: './weapon_daggers.png',
      lore: '翡翠灵玉淬炼而成的双生残刃，平时周身低语游弋，出击时化为 360 度近身翡翠风暴高速回旋，多段高频切割。',
      stats: [
        { label: '基础伤害', val: '22' },
        { label: '攻击攻速', val: '1.8 次/秒 (0.55s)' },
        { label: '回旋半径', val: '105 px' },
        { label: '飞刃移速', val: '440 px/s' },
        { label: '攻击模式', val: '翡翠双刃 · 360度近身环绕风暴' }
      ],
      upgrade: '配合攻速与伤害升级，可让周身风暴近乎无缝衔接。',
      tactics: '攻速快、打击频次高，能极其有效地阻断近身飞扑型敌人的靠近。'
    },
    {
      id: 'sword_benlei',
      name: '奔雷古剑',
      title: '剑修引雷神兵 · 天雷古剑',
      tag: '九天神雷连锁',
      icon: '⚡',
      image: './weapon_thunder_sword.png',
      lore: '引九天神霄天雷淬锋，剑锋周身游曳泛起紫电弧光，出鞘时引动天雷轰顶重击，并在妖群间爆裂出跳跃连锁闪电。',
      stats: [
        { label: '剑体伤害', val: '26' },
        { label: '落雷伤害', val: '16 (附带连锁紫电)' },
        { label: '攻击攻速', val: '1.1 次/秒 (0.95s)' },
        { label: '索敌神识', val: '150 px' },
        { label: '攻击模式', val: '天雷淬锋 · 落雷轰顶 · 紫电弹射' }
      ],
      upgrade: '升级雷击威力与连锁弹射次数，清群怪极为凌厉。',
      tactics: '兼备单体轰击与群怪连锁弹射，是面对混合怪潮的顶尖法宝。'
    },
    {
      id: 'spell_bagua',
      name: '八卦阵盘',
      title: '法修起手阵法 · 乾坤道阵',
      tag: '乾坤道阵绞杀',
      icon: '☯️',
      image: './weapon_bagua.png',
      lore: '乾坤太极凝炼而成的古老阵盘，在敌群脚下凭空构筑旋转八卦太极阵，中心阴阳阵眼多段绞杀，外围扩散衰减。',
      stats: [
        { label: '阵眼伤害', val: '12 (阵眼多段，外围衰减)' },
        { label: '攻击频率', val: '0.9 次/秒 (1.10s)' },
        { label: '阵法半径', val: '110 px' },
        { label: '阵法存续', val: '0.45 秒持续绞杀' },
        { label: '攻击模式', val: '八卦太极降临 · 中心高频绞杀' }
      ],
      upgrade: '提升阵法威力倍率与多段判定判定半径。',
      tactics: '敌人聚集越多伤害效率越高，中心阵眼爆发极具压制力。'
    },
    {
      id: 'spell_fuchen',
      name: '灵木拂尘',
      title: '法修起手法宝 · 回春仙尘',
      tag: '碧霞仙浪轻推',
      icon: '🪶',
      image: './weapon_fuchen.png',
      lore: '万载灵木柔丝与太虚天蚕丝编织，装备即赋予生机（生命上限 +15）。挥扫荡开扇面碧霞仙浪，微幅击退妖群，近身伤害递减。',
      stats: [
        { label: '基础伤害', val: '12' },
        { label: '附加被动', val: '生命上限 +15' },
        { label: '攻击频率', val: '1.1 次/秒 (0.90s)' },
        { label: '扇面射程', val: '110 px / 60度扇区' },
        { label: '攻击模式', val: '碧霞仙浪 · 扇形轻推击退' }
      ],
      upgrade: '提升仙浪推拒力度与扇面推进速度。',
      tactics: '攻守兼备，自带生命上限加成，扇形波纹能有效防止被近身围困。'
    },
    {
      id: 'spell_baozhu',
      name: '混元宝珠',
      title: '法修起手灵珠 · 太虚奇点',
      tag: '星河微引奇点',
      icon: '🔮',
      image: './weapon_baozhu.png',
      lore: '太虚混元之气所凝灵珠，装备提升神识感知（感知 +20）。祭出后化为微引力奇点，核心多段引力微引牵聚周围散怪。',
      stats: [
        { label: '基础伤害', val: '12' },
        { label: '附加被动', val: '神识感知 +20 px' },
        { label: '攻击频率', val: '0.9 次/秒 (1.15s)' },
        { label: '奇点范围', val: '120 px' },
        { label: '攻击模式', val: '弱引力奇点 · 核心多段/牵聚群怪' }
      ],
      upgrade: '扩大奇点微引吸附半径与终结微爆伤害。',
      tactics: '将散开的游灵或群怪微引聚集，为后续范围武器创造绝佳聚怪爆发条件。'
    },
    {
      id: 'body_ding',
      name: '九疑重鼎',
      title: '体修起手重鼎 · 山岳古器',
      tag: '泰山压顶碾压',
      icon: '🏺',
      image: './weapon_ding.png',
      lore: '远古九疑玄黄铜所铸巨鼎，气势沉浑（装备生命上限 +30）。祭出重鼎从天而降沉重砸地，震中泰山压顶重碾，外圈扩散微衰。',
      stats: [
        { label: '基础伤害', val: '15' },
        { label: '附加被动', val: '生命上限 +30 并回满' },
        { label: '攻击频率', val: '0.8 次/秒 (1.25s)' },
        { label: '震地半径', val: '110 px' },
        { label: '攻击模式', val: '重鼎从天而降 · 泰山压顶/震波扩散' }
      ],
      upgrade: '大幅提升巨鼎落地震波与核心重创判定面积。',
      tactics: '极为强悍的防御型法宝，直接提供 30 点生命上限，重鼎砸地能打断敌怪冲锋。'
    },
    {
      id: 'body_dragon_armor',
      name: '龙鳞霸甲',
      title: '体修起手拳甲 · 真龙金铠',
      tag: '赤金龙炎贯通',
      icon: '🥋',
      image: './weapon_dragon_armor.png',
      lore: '真龙坚鳞与玄铁合炼而成的霸道拳甲（装备生命上限 +20）。身前轰出赤金狂暴龙炎，拳心贯穿重伤，边缘掠击扩散递减。',
      stats: [
        { label: '基础伤害', val: '14' },
        { label: '附加被动', val: '生命上限 +20' },
        { label: '攻击频率', val: '1.2 次/秒 (0.85s)' },
        { label: '龙炎射程', val: '115 px 冲拳轨迹' },
        { label: '攻击模式', val: '赤金龙炎前冲 · 拳心穿透' }
      ],
      upgrade: '延长龙炎冲拳喷涌长度与穿透威力。',
      tactics: '出拳迅捷，龙炎轨迹穿透多个敌怪，提供可观的生命提升与贴脸强击。'
    },
    {
      id: 'body_hammer',
      name: '破军金锤',
      title: '体修起手巨锤 · 破军撼地',
      tag: '撼地金锤裂地',
      icon: '🔨',
      image: './weapon_hammer.png',
      lore: '纯阳庚金巨锤，重愈万钧。挥动巨锤狠狠砸击大地，爆发出裂地金光冲击波，震中核心重创，外围强烈击退妖邪。',
      stats: [
        { label: '核心伤害', val: '16' },
        { label: '攻击频率', val: '0.85 次/秒 (1.18s)' },
        { label: '裂地半径', val: '105 px' },
        { label: '击退效果', val: '高击退系数' },
        { label: '攻击模式', val: '撼地金锤重砸 · 震中重创/外围击退' }
      ],
      upgrade: '扩大金锤碎地范围并强化震退击退距离。',
      tactics: '面对高速近战妖物群时，金锤的强力击退能够完美建立安全缓冲区。'
    },
    {
      id: 'skill_gourd',
      name: '赤炎宝葫芦',
      title: '纯阳随身法宝 · 烈焰贯穿',
      tag: '三层真火射线',
      icon: '◈',
      image: './skill_gourd.png',
      lore: '朱红温润纯阳宝葫，铭刻赤炎八卦金纹。平时悬浮伴行在道友肩侧，每 2.2 秒锁定敌怪开塞，喷射出一条贯穿战场的纯阳三昧真火激光！',
      stats: [
        { label: '喷发周期', val: '每 2.2 秒锁定一次' },
        { label: '火线宽度', val: '16 px 三层真火光束' },
        { label: '射程表现', val: '贯穿全屏直线' },
        { label: '初得加成', val: '法宝伤害 +5' },
        { label: '攻击模式', val: '肩侧悬浮 · 炽热火线激光 · 贯穿多段' }
      ],
      upgrade: '通过掉落物「赤炎砂」或天道卡片，每次提升火线威力 +40%。',
      tactics: '绝佳的穿透杀伤法宝，火线贯通整条直线上的所有妖邪，配合高击退形成火力网。'
    },
    {
      id: 'skill_fox',
      name: '青羽灵狐',
      title: '随行护主灵宠 · 破空撕裂',
      tag: '灵狐飞扑爪爆',
      icon: '♢',
      image: './skill_fox.png',
      lore: '仙门九尾瑞兽，雪白碧羽相间，金眸熠熠。常态轻盈跟跑在道友身侧，每 4 秒如离弦之箭凌空飞跃，爆发裂空爪爆与 55px 震地灵火震荡环。',
      stats: [
        { label: '扑击伤害', val: '42 (范围 AoE 伤害)' },
        { label: '飞扑周期', val: '每 4 秒一次' },
        { label: '飞跃轨迹', val: '空中优美抛物线 (碧羽残影)' },
        { label: '轰爆半径', val: '55 px 范围灵火爪击' },
        { label: '攻击模式', val: '独立跟随 · 凌空扑击 · 裂空爪击 AoE' }
      ],
      upgrade: '通过掉落物「灵兽蛋」或天道卡片，每次提升扑击伤害 +26。',
      tactics: '不占道友攻击动作的独立战力，飞扑爆发能瞬秒突入后方的杂妖与小群怪物。'
    },
    {
      id: 'beast_bell',
      name: '百兽金铃',
      title: '灵兽师御兽法宝 · 摄魂金铃',
      tag: '金铃音波震慑',
      icon: '🔔',
      image: './weapon_beast_bell.png',
      lore: '万兽谷镇谷秘宝，摇动金铃可发出慑服百兽的金色音浪，震慑妖魔心神，削弱敌怪移速并造成范围震荡伤害。',
      stats: [
        { label: '基础伤害', val: '20' },
        { label: '音波范围', val: '135 px 扇形扩散' },
        { label: '攻击攻速', val: '1.4 次/秒 (0.71s)' },
        { label: '特殊效能', val: '音波击退 · 范围伤害衰减' },
        { label: '攻击模式', val: '金铃摇曳 · 金色音波扇面震荡' }
      ],
      upgrade: '升级强化音波扩散宽度与击退距离。',
      tactics: '极好的前方推怪与自保武器，能持续将企图贴身的妖邪震退。'
    },
    {
      id: 'beast_lash',
      name: '缚兽玄绫',
      title: '灵兽师近身法宝 · 灵索破空',
      tag: '大弧灵索扫荡',
      icon: '➰',
      image: './weapon_beast_lash.png',
      lore: '采集万年天蚕丝与蛟龙筋混织而成的碧蓝长绫，挥动时在周身划出长达 180 度的大弧鞭影，横扫一切阻碍。',
      stats: [
        { label: '基础伤害', val: '22' },
        { label: '扫荡弧度', val: '180 度大半圆 (120 px 半径)' },
        { label: '攻击攻速', val: '1.5 次/秒 (0.66s)' },
        { label: '横扫范围', val: '半月大弧扫荡' },
        { label: '攻击模式', val: '玄绫大弧横扫 · 击退多段打击' }
      ],
      upgrade: '提升玄绫打击长度与攻速，近身防守严丝合缝。',
      tactics: '适合应对从侧翼或正面大群扑来的飞行怪与快速杂鱼。'
    },
    {
      id: 'beast_horn',
      name: '唤灵法螺',
      title: '灵兽师远击法宝 · 灵鹰袭杀',
      tag: '双鹰巡天破阵',
      icon: '📯',
      image: './weapon_beast_horn.png',
      lore: '深海沧龙法螺所制，吹奏时唤出两道巡天青金灵鹰幻影，疾速掠空交叉飞扑，贯穿沿途所有敌人。',
      stats: [
        { label: '基础伤害', val: '25' },
        { label: '突袭距离', val: '220 px 巡天交叉' },
        { label: '攻击攻速', val: '1.2 次/秒 (0.83s)' },
        { label: '贯穿性能', val: '完全贯穿直线敌怪' },
        { label: '攻击模式', val: '法螺鸣响 · 巡天双鹰交叉穿透' }
      ],
      upgrade: '增加灵鹰体型与撕裂伤害。',
      tactics: '精准超远距离直线杀伤，适合定点狙杀远端的妖兽头领。'
    },
    {
      id: 'formation_flag',
      name: '四象诛邪旗',
      title: '阵法师核心法宝 · 四方结界',
      tag: '四象诛邪大阵',
      icon: '🚩',
      image: './weapon_formation_flag.png',
      lore: '分立青龙、白虎、朱雀、玄武四方神位之阵旗，凭空在目标区域插立并激发四象光索大阵，持续绞杀困在其中的妖群。',
      stats: [
        { label: '单段伤害', val: '12 (每0.22秒频发)' },
        { label: '结界半径', val: '65 px (覆盖 130px 范围)' },
        { label: '结界时效', val: '0.9 秒持续绞杀' },
        { label: '特殊效能', val: '四象锁灵 · 中心高伤外围衰减' },
        { label: '攻击模式', val: '四方落旗 · 灵索连线 · 持续绞杀' }
      ],
      upgrade: '扩大结界覆盖范围并增加持续存在时间。',
      tactics: '阵地防守神技，将旗阵布设在怪物潮必经之路上可实现持续融化。'
    },
    {
      id: 'formation_chess',
      name: '天星弈棋',
      title: '阵法师爆发法宝 · 阴阳落子',
      tag: '黑白双子天元爆',
      icon: '♟️',
      image: './weapon_formation_chess.png',
      lore: '天元星盘落子，黑白阴阳交融。引动周天星斗之力，黑白棋子自九天坠落相撞，引发毁灭性的太极阴阳气爆。',
      stats: [
        { label: '轰爆伤害', val: '26 (核心高伤)' },
        { label: '轰爆半径', val: '55 px 阴阳冲击波' },
        { label: '攻击攻速', val: '1.1 次/秒 (0.91s)' },
        { label: '特殊效能', val: '天元落子 · 中心1.0x/外围0.6x' },
        { label: '攻击模式', val: '黑白二子相撞 · 阴阳太极轰爆' }
      ],
      upgrade: '强化阴阳对撞产生的震波范围与暴击率。',
      tactics: '阵法师的即时范围爆发手段，对扎堆的强力精英怪效果拔群。'
    },
    {
      id: 'formation_ruler',
      name: '量天玉尺',
      title: '阵法师控场法宝 · 九宫重力',
      tag: '九宫泥潭锁足',
      icon: '📏',
      image: './weapon_formation_ruler.png',
      lore: '昆仑羊脂白玉尺，尺面雕刻周天星纬。凌空划出九宫重力法阵，阵内空间如陷泥沼，敌人寸步难行并受重力挤压。',
      stats: [
        { label: '单段伤害', val: '10 (每0.25秒频发)' },
        { label: '九宫范围', val: '90x90 px 矩形禁区' },
        { label: '牵引减速', val: '阵心强力泥沼阻滞' },
        { label: '持续时间', val: '0.85 秒重力压制' },
        { label: '攻击模式', val: '九宫画界 · 重力泥沼锁足 · 频发挤压' }
      ],
      upgrade: '延长九宫泥沼持续时间并加剧牵制阻滞力度。',
      tactics: '顶级的软控阵法，与四象诛邪旗配合可将强敌死死控在阵中绞杀。'
    },
    {
      id: 'pill_furnace',
      name: '紫金八卦炉',
      title: '丹药师攻击法宝 · 三昧丹火',
      tag: '三昧丹火扇面',
      icon: '⚱️',
      image: './weapon_pill_furnace.png',
      lore: '上古兜率紫金鼎炉，鼎内终年燃烧纯阳三昧真火与药煞浓烟。开炉倾泻，化作滚滚赤金烈焰扇面焚尽诸邪。',
      stats: [
        { label: '基础伤害', val: '18' },
        { label: '丹火喷角', val: '75 度广角扇面' },
        { label: '丹火射程', val: '120 px 扇面灼烧' },
        { label: '攻击攻速', val: '1.3 次/秒 (0.77s)' },
        { label: '攻击模式', val: '开炉倾火 · 纯阳三昧扇面焚烧' }
      ],
      upgrade: '提升三昧真火宽度与射程，灼烧范围更广。',
      tactics: '丹药师近身主要范围清怪手段，扇面覆盖度大，压制大面积贴身妖群。'
    },
    {
      id: 'pill_pestle',
      name: '碧玉药王杵',
      title: '丹药师重击法宝 · 碎骨震荡',
      tag: '药王神杵震地',
      icon: '🏏',
      image: './weapon_pill_pestle.png',
      lore: '药王神农氏捣药之杵，通体碧翠沉实。凌空飞起轰然下捣，药力震波如翡翠巨浪碎地裂石，将敌怪筋骨震碎。',
      stats: [
        { label: '基础伤害', val: '24' },
        { label: '震地半径', val: '55 px 药力冲击环' },
        { label: '攻击攻速', val: '1.2 次/秒 (0.83s)' },
        { label: '特殊效能', val: '药劲碎骨 · 强力震退' },
        { label: '攻击模式', val: '神杵飞坠 · 药力碎骨裂地 · 翠浪震荡' }
      ],
      upgrade: '扩大药力震荡波半径并提高震退距离。',
      tactics: '定点中等范围重击，打击判定坚实，是对付中体型头目的利器。'
    },
    {
      id: 'pill_poison',
      name: '千草腐仙葫',
      title: '丹药师毒煞法宝 · 腐蚀酸雾',
      tag: '三枚毒丹腐蚀沼',
      icon: '🧪',
      image: './weapon_pill_poison.png',
      lore: '百草门淬炼万毒之灵葫，倾斜喷射出三枚幽绿毒丹，坠地炸开化为剧毒腐蚀酸液池，使踏入其中的敌怪持续消融。',
      stats: [
        { label: '单池伤害', val: '11 (每0.18秒频发)' },
        { label: '散布发数', val: '扇形 3 颗毒丹' },
        { label: '毒沼半径', val: '36 px x 3 处酸池' },
        { label: '存留时间', val: '0.75 秒持续腐蚀' },
        { label: '攻击模式', val: '三散毒丸 · 落地爆开 · 毒沼持续腐蚀' }
      ],
      upgrade: '增加毒丹发射数量与毒沼存留时长。',
      tactics: '大面积铺设毒沼陷阱，敌人涉足其中瞬间遭受持续多段高频消融。'
    },
    {
      id: 'demon_blade',
      name: '化血狂刀',
      title: '魔功修者本命神兵 · 猩红半月',
      tag: '高速血月穿透',
      icon: '🗡️',
      image: './weapon_demon_blade.png',
      lore: '九幽化血魔刀，刀出必饮血。斩出猩红夺目的半月刀芒撕裂虚空，超高速呼啸贯穿敌群，所过之处妖血四溅。',
      stats: [
        { label: '基础伤害', val: '26' },
        { label: '飞行速度', val: '440 px/s 极速血月' },
        { label: '攻击攻速', val: '1.4 次/秒 (0.71s)' },
        { label: '穿透特性', val: '沿途完全穿透' },
        { label: '攻击模式', val: '挥斩狂刀 · 猩红半月弧光贯穿' }
      ],
      upgrade: '提升半月刀光尺寸与飞行动能。',
      tactics: '极高速全穿透直线神兵，配合魔功低血高伤被动，输出毁天灭地。'
    },
    {
      id: 'demon_claws',
      name: '天魔血煞爪',
      title: '魔功修者利爪法宝 · 虚空撕裂',
      tag: '暗劲三爪撕裂',
      icon: '🐾',
      image: './weapon_demon_claws.png',
      lore: '采九幽天魔骨打磨而成的血煞利爪，无视空间阻隔在目标上空撕开三道血色裂隙，暗劲入体撕碎敌怪肉身。',
      stats: [
        { label: '基础伤害', val: '23' },
        { label: '攻击攻速', val: '1.6 次/秒 (0.62s)' },
        { label: '撕裂范围', val: '32 px 虚空三爪' },
        { label: '出招特性', val: '无弹道瞬发撕裂' },
        { label: '攻击模式', val: '虚空裂隙 · 三道天魔血爪撕裂' }
      ],
      upgrade: '提高爪击攻速与暴击伤害倍率。',
      tactics: '瞬发无视弹道阻挡，对高速移动或绕后的难缠敌怪能精准收割。'
    },
    {
      id: 'demon_seal',
      name: '修罗血皇玺',
      title: '魔功修者霸道法宝 · 皇玺震山',
      tag: '巨玺镇世血浪',
      icon: '👑',
      image: './weapon_demon_seal.png',
      lore: '修罗魔皇本命印玺，如一座血岳悬于苍穹。祭出时万丈血光冲天，轰然泰山压顶，激荡起席卷全场的滔天血浪冲击波。',
      stats: [
        { label: '震世伤害', val: '27' },
        { label: '血浪半径', val: '65 px 范围冲击' },
        { label: '攻击攻速', val: '0.9 次/秒 (1.1s)' },
        { label: '特殊震感', val: '强力屏幕震颤 · 中心1.0x外围0.65x' },
        { label: '攻击模式', val: '血岳飞悬 · 泰山砸落 · 冲天血浪' }
      ],
      upgrade: '扩大血浪冲击半径并增加暴击几率。',
      tactics: '毁灭性的单发范围大招，面对密密麻麻的妖潮一印即可清空一片。'
    },
    {
      id: 'ghost_lantern',
      name: '幽冥引魂灯',
      title: '鬼修追魂法宝 · 碧磷鬼火',
      tag: '双发追踪幽火',
      icon: '🏮',
      image: './weapon_ghost_lantern.png',
      lore: '酆都白骨引魂青灯，灯芯燃烧万载不灭的碧磷鬼火。一击祭出双朵灵动鬼火，呼啸穿空自动追踪妖邪轰爆。',
      stats: [
        { label: '单发伤害', val: '15 (双发并发)' },
        { label: '弹道速度', val: '320 px/s 灵敏追踪' },
        { label: '攻击攻速', val: '1.3 次/秒 (0.77s)' },
        { label: '特殊效能', val: '自适应目标追踪转向' },
        { label: '攻击模式', val: '引魂灯晃 · 碧磷双幽火自动追踪' }
      ],
      upgrade: '增加鬼火追踪转向速度与命中爆鸣威力。',
      tactics: '全自动追踪索敌，让鬼修在高速移速走位避战的同时保持稳定输出。'
    },
    {
      id: 'ghost_wand',
      name: '白骨哀丧棒',
      title: '鬼修护体法宝 · 厉鬼哭嚎',
      tag: '苍白音煞推拒',
      icon: '🦴',
      image: './weapon_ghost_wand.png',
      lore: '以万年极阴玄骨所铸哭丧棒，摇动时爆发凄厉如鬼哭神嚎的苍白音浪，形成 360 度圆环气劲将敌怪强行击退推拒。',
      stats: [
        { label: '基础伤害', val: '19' },
        { label: '退敌半径', val: '115 px 苍白全向音波' },
        { label: '攻击攻速', val: '1.4 次/秒 (0.71s)' },
        { label: '推怪效能', val: '极强全向击退阻绝' },
        { label: '攻击模式', val: '白骨哀鸣 · 360度音煞圆环震退' }
      ],
      upgrade: '增强全向击退力度与音煞波纹伤害。',
      tactics: '鬼修面对围攻时的保命神兵，全方位将突进怪潮推开，保障安全输出空间。'
    },
    {
      id: 'ghost_banner',
      name: '百鬼聚灵幡',
      title: '鬼修群攻神兵 · 百鬼夜行',
      tag: '百鬼螺旋穿刺',
      icon: '🎏',
      image: './weapon_ghost_banner.png',
      lore: '招展黑煞阴风幡，引动百鬼夜行。无数怨魂恶鬼凝聚成螺旋阴风锥呼啸穿刺敌群，所到之处阴寒蚀骨。',
      stats: [
        { label: '基础伤害', val: '22' },
        { label: '穿刺距离', val: '150 px 螺旋突进' },
        { label: '攻击攻速', val: '1.2 次/秒 (0.83s)' },
        { label: '穿透特性', val: '多段螺旋贯穿' },
        { label: '攻击模式', val: '阴幡展动 · 百鬼怨魂螺旋穿刺' }
      ],
      upgrade: '提升怨魂螺旋密度与穿刺射程。',
      tactics: '中距离穿透法宝，鬼潮如钻头般在怪群中撕开一道生路。'
    }
  ],

  cards: [
    {
      id: 'sword',
      name: '流云飞剑',
      type: '法宝 · 强化',
      icon: '✧',
      lore: '青冥飞剑诀奥义，聚气凝剑，虚空生刃。修习此法可化生出更多飞剑游曳伴行。',
      effect: '飞剑伤害 +12，并额外增加一柄周身游曳飞剑。',
      stats: [
        { label: '卡片类型', val: '法宝强化' },
        { label: '伤害增幅', val: '+12 伤害' },
        { label: '飞剑数量', val: '+1 柄' }
      ],
      tactics: '剑修必选核心卡片，直接翻倍飞剑弹幕火力密度。'
    },
    {
      id: 'fire',
      name: '赤炎葫芦',
      type: '法宝 · 新得',
      icon: '◈',
      image: './skill_gourd.png',
      lore: '纯阳宫秘制火葫芦，封印地脉三昧纯阳真火，随行护主喷吐炽烈火浪。',
      effect: '获得随身悬浮法宝「赤炎宝葫芦」，每 2.2 秒向最近敌人喷出一道灼热火线。已拥有则火线威力 +40%。',
      stats: [
        { label: '卡片类型', val: '新得法宝 / 进阶' },
        { label: '攻击频率', val: '每 2.2 秒' },
        { label: '附加威力', val: '初得法宝伤害+5 / 叠层威力+40%' }
      ],
      tactics: '提供稳定远程穿透输出，尤其适合缺少直线贯穿手段的体修与法修道友。'
    },
    {
      id: 'gather',
      name: '聚灵诀',
      type: '功法 · 被动',
      icon: '◎',
      lore: '吐纳天地元气，神识如网。大幅扩展神念笼罩范围，身法随灵气流转愈发轻盈。',
      effect: '灵气拾取范围 +45 px，移动速度 +12%。',
      stats: [
        { label: '卡片类型', val: '功法被动' },
        { label: '拾取范围', val: '+45 px' },
        { label: '移动速度', val: '+12%' }
      ],
      tactics: '前期快速吸纳灵气晶石冲刺境界的核心神技，避免冒进怪堆捡拾灵气。'
    },
    {
      id: 'formation',
      name: '回风阵',
      type: '阵法 · 新得',
      icon: '⌘',
      lore: '以自身为阵眼构筑四象回风阵，罡风护体呼啸旋转，任何妖邪不敢轻易近身。',
      effect: '在身边展开护体阵法，持续击退并灼伤周围妖物。已拥有则阵法威力 +50%。',
      stats: [
        { label: '卡片类型', val: '护体阵法 / 进阶' },
        { label: '作用范围', val: '周身防护阵圈' },
        { label: '附加效果', val: '周期性击退 / 叠层威力+50%' }
      ],
      tactics: '高关卡怪物移速飙升时的保命神阵，有效弹开近身杂怪。'
    },
    {
      id: 'pet',
      name: '青羽灵狐',
      type: '灵兽 · 新得',
      icon: '♢',
      image: './skill_fox.png',
      lore: '通灵瑞兽青羽灵狐，因缘际会追随道友。身怀破空撕裂妖魔之威能。',
      effect: '召唤随行灵宠「青羽灵狐」，每 4 秒扑向一名敌人造成范围伤害。已拥有则扑击伤害 +26。',
      stats: [
        { label: '卡片类型', val: '灵兽伙伴 / 进阶' },
        { label: '扑击间隔', val: '每 4 秒一次' },
        { label: '初次伤害', val: '42 点范围 AoE' }
      ],
      tactics: '不仅可爱灵动，更是输出极高且不占用人物动作的绝对杀手锏。'
    },
    {
      id: 'body',
      name: '玄木灵体',
      type: '体质 · 被动',
      icon: '✦',
      lore: '引青帝长生之木入体，气血如泉涌，生机勃勃绵绵不绝。',
      effect: '最大生命上限 +30，并立即回复等量 30 点生命。',
      stats: [
        { label: '卡片类型', val: '体质被动' },
        { label: '生命上限', val: '+30' },
        { label: '即时自愈', val: '恢复 30 点生命' }
      ],
      tactics: '血量告急或关卡推进时提升容错上限的绝佳卡片，兼顾即时自愈回血。'
    },
    {
      id: 'haste',
      name: '御风行',
      type: '身法 · 被动',
      icon: '↝',
      lore: '身融清风，行迹无定。脚踏七星步法，法宝与身法齐齐加速。',
      effect: '移动速度 +5%，法宝攻击间隔缩短 12%（攻击攻速 +12%）。',
      stats: [
        { label: '卡片类型', val: '身法被动' },
        { label: '移动速度', val: '+5%' },
        { label: '攻击攻速', val: '+12%' }
      ],
      tactics: '温和提升身法移速并加快法宝出手频率，平稳控场不打滑。'
    },
    {
      id: 'meridian',
      name: '逆脉诀',
      type: '功法 · 被动',
      icon: '⧉',
      lore: '险走偏锋的古修秘法，倒行逆施经脉气血，以折损肉身为代价换取狂暴杀力。',
      effect: '最大生命上限 -20，法宝伤害 +18。以命换力，极其霸道。',
      stats: [
        { label: '卡片类型', val: '极险功法' },
        { label: '生命折损', val: '-20 生命上限' },
        { label: '伤害暴增', val: '+18 基础攻击' }
      ],
      tactics: '极致输出流派必拿，18 点基础攻击力对所有武器弹幕均有巨大提升。'
    },
    {
      id: 'chain_arc',
      name: '连锁电弧',
      type: '神通 · 绝技',
      icon: '⚡',
      image: './skill_chain_lightning.png',
      lore: '引九天金煞神雷化为跳跃金弧。主武器击中妖魔时，金雷激荡爆射，于群妖之间疾速跃动传递，形成毁灭雷网。',
      effect: '主武器攻击命中时触发金黄连锁电弧，在 n 个敌怪间传递，每个敌怪受到主武器当前伤害的 n%（随该技能卡数量升级）。',
      stats: [
        { label: '卡片类型', val: '神通秘术 / 可叠层' },
        { label: '初重传递', val: '10 个敌怪' },
        { label: '初重伤害', val: '主武器伤害的 10%' },
        { label: '进阶成长', val: '每重 +5 传递数 & +5% 伤害' }
      ],
      tactics: '清场绝技！面对妖魔潮围攻时，主武器一击即可引爆大范围金色雷暴连击。'
    },
    {
      id: 'blazing_fire',
      name: '离火焚原',
      type: '神通 · 绝技',
      icon: '🔥',
      image: './skill_blazing_fire.png',
      lore: '取南明离火与三昧真火之精粹。主武器命中附着离火烙印，焚骨灼魂；妖魔毙命或受重创时轰然引爆，漫天烈焰流星溅射八方。',
      effect: '主武器命中附带离火灼煞；被点燃敌怪阵亡或受重击时引发真火大爆裂，并向四周溅射飞火流星点燃周围敌群（随卡片数量升级）。',
      stats: [
        { label: '卡片类型', val: '神通秘术 / 可叠层' },
        { label: '初重灼烧', val: '每秒持续灼烧 10%' },
        { label: '初重爆裂', val: '20% 范围伤害 / 105px' },
        { label: '初重溅射', val: '3 颗飞火流星' },
        { label: '进阶成长', val: '每重 +5% 灼烧 & +5% 爆裂 & +20px 范围 & +2 颗火种' }
      ],
      tactics: '割草连环大爆炸！密集群怪中一旦有一只引爆，飞火流星将瞬间点燃全屏，连环爆破，烈焰焚天。'
    }
  ],

  items: [
    {
      id: 'qi-pill',
      name: '聚气丹',
      type: '灵丹妙药',
      tag: '疗伤回春',
      icon: '●',
      image: './drop_heal.png',
      lore: '采集天地纯净草木精气炼制的初阶灵丹，入口即化，温养筋脉气血。',
      effect: '立即回复 30 点生命值。',
      qiVal: 18,
      stats: [
        { label: '物品类型', val: '丹药' },
        { label: '疗愈生命', val: '+30 HP' },
        { label: '放弃灵气', val: '+18 灵气' }
      ],
      tactics: '生命健康时可果断放弃换取 18 点灵气加速境界突破。'
    },
    {
      id: 'ward',
      name: '护体符',
      type: '道门符箓',
      tag: '金甲护身',
      icon: '▤',
      lore: '朱砂龙纹绘制的护身灵符，佩戴于胸前可激发生命潜能。',
      effect: '最大生命上限 +25，并回复 25 点生命。',
      qiVal: 20,
      stats: [
        { label: '物品类型', val: '符箓' },
        { label: '生命上限', val: '+25 HP' },
        { label: '放弃灵气', val: '+20 灵气' }
      ],
      tactics: '必留的高性价比保命遗物，稳步提升面对 boss 或群妖的生存底线。'
    },
    {
      id: 'edge',
      name: '锐金丹',
      type: '灵丹妙药',
      tag: '庚金杀力',
      icon: '◆',
      lore: '蕴含西方白虎庚金之气的丹药，服之法宝锋芒毕露，杀气腾腾。',
      effect: '法宝基础攻击力 +8。',
      qiVal: 24,
      stats: [
        { label: '物品类型', val: '丹药' },
        { label: '攻击加成', val: '+8 攻击' },
        { label: '放弃灵气', val: '+24 灵气' }
      ],
      tactics: '直接提升法宝伤害面板，无脑保留的高价值丹药。'
    },
    {
      id: 'feather',
      name: '疾风羽',
      type: '天地灵材',
      tag: '身轻如燕',
      icon: '↝',
      lore: '九天大鹏蜕落的一片青羽，灵风缭绕，持之身轻如燕。',
      effect: '移动速度永久 +2%。',
      qiVal: 16,
      stats: [
        { label: '物品类型', val: '灵材' },
        { label: '速度提升', val: '+2% 移速' },
        { label: '放弃灵气', val: '+16 灵气' }
      ],
      tactics: '微幅提升身法移速，多次炼化亦不失控，提供细腻丝滑的微操走位体验。'
    },
    {
      id: 'herb',
      name: '聚灵草',
      type: '天地灵草',
      tag: '神识汲取',
      icon: '❀',
      lore: '生长在灵脉源头的奇异仙草，天生具有牵引四周天地灵气的神效。',
      effect: '灵气拾取范围永久 +30 px。',
      qiVal: 15,
      stats: [
        { label: '物品类型', val: '灵草' },
        { label: '拾取范围', val: '+30 px' },
        { label: '放弃灵气', val: '+15 灵气' }
      ],
      tactics: '省去走位捡水晶的繁琐步骤，提升战场安全感。'
    },
    {
      id: 'egg',
      name: '灵兽蛋',
      type: '通灵异宝',
      tag: '灵狐降世',
      icon: '♢',
      image: './skill_fox.png',
      lore: '仙禽异兽留下的通灵之卵，青碧霞光流动，隐隐有灵狐九尾虚影。',
      effect: '获得随行灵宠「青羽灵狐」，已拥有则扑击伤害 +26。',
      qiVal: 30,
      stats: [
        { label: '物品类型', val: '灵兽之种' },
        { label: '契约效果', val: '激活/强化青羽灵狐' },
        { label: '放弃灵气', val: '+30 灵气' }
      ],
      tactics: '珍稀宝物，能在无需选卡机会的情况下白嫖或强化灵宠！'
    },
    {
      id: 'cinnabar',
      name: '赤炎砂',
      type: '天地灵材',
      tag: '地火纯阳',
      icon: '◈',
      image: './skill_gourd.png',
      lore: '从地心炎脉深处采集的九阳地火晶砂，炙热滚烫，可蕴养火系至宝。',
      effect: '获得随身法宝「赤炎宝葫芦」，已拥有则火线威力 +40%。',
      qiVal: 28,
      stats: [
        { label: '物品类型', val: '天地灵材' },
        { label: '法宝进阶', val: '激活/强化赤炎葫芦' },
        { label: '放弃灵气', val: '+28 灵气' }
      ],
      tactics: '直接激活火葫芦穿透真火激光，叠加后火线伤害极其夸张。'
    },
    {
      id: 'jade',
      name: '回风玉',
      type: '阵道天材',
      tag: '清风道韵',
      icon: '⌘',
      lore: '凝聚天地罡风的一块温润青玉，内蕴天然微缩防御法阵。',
      effect: '获得随身护体「回风阵」，已拥有则阵法威力 +50%。',
      qiVal: 26,
      stats: [
        { label: '物品类型', val: '阵材' },
        { label: '阵法进阶', val: '激活/强化回风阵' },
        { label: '放弃灵气', val: '+26 灵气' }
      ],
      tactics: '强化护体阵法，提升近身防御反击与抗怪压制力。'
    },
    {
      id: 'nine-turn',
      name: '九转丹',
      type: '绝品仙丹',
      tag: '九转金丹',
      icon: '✦',
      lore: '太上兜率宫流传而下的九转金丹，九炼九转，服之逆天改命，气血充盈。',
      effect: '最大生命上限 +45，并立即回满全部生命！',
      qiVal: 34,
      stats: [
        { label: '物品类型', val: '绝品丹药' },
        { label: '生命上限', val: '+45 HP' },
        { label: '回血效果', val: '生命完全回满' },
        { label: '放弃灵气', val: '+34 灵气' }
      ],
      tactics: '绝处逢生的至尊仙丹，遇到几乎必留，既能扩容生命上限又能满血复活。'
    },
    {
      id: 'thunder',
      name: '御雷符',
      type: '道门符箓',
      tag: '天罚神霄',
      icon: '⚡',
      lore: '神霄派真传天雷符，引九天苍雷降罚，妖孽闻之丧胆。',
      effect: '每 3 秒降下一道天雷轰顶（40 伤害），已拥有则雷击伤害 +20。',
      qiVal: 32,
      stats: [
        { label: '物品类型', val: '攻击符箓' },
        { label: '雷击伤害', val: '40 / 叠层+20' },
        { label: '降雷周期', val: '每 3 秒一次' },
        { label: '放弃灵气', val: '+32 灵气' }
      ],
      tactics: '全自动后台落雷打击，是补足单体爆发打击精英的绝佳辅助。'
    },
    {
      id: 'drop_qi',
      name: '灵气水晶',
      type: '修仙资粮',
      tag: '境界本源',
      icon: '💎',
      image: './drop_qi.png',
      lore: '击杀普通妖物与精怪掉落的纯净菱形灵气结晶，蕴含天地清气，乃突破大境界的核心资粮。',
      effect: '拾取后直接增加境界修为灵气经验，达到阶段上限即可突破下一境界。',
      qiVal: 1,
      stats: [
        { label: '掉落来源', val: '普通妖兽' },
        { label: '外观形态', val: '蓝色菱形结晶' },
        { label: '拾取机制', val: '神识自动牵引吸附' }
      ],
      tactics: '每关务必多消灭妖物搜集灵气结晶，尽早实现境界突破（炼气 → 筑基等），以获得基础生命翻倍。'
    },
    {
      id: 'drop_item',
      name: '秘境宝箱',
      type: '机缘法宝',
      tag: '乾坤遗珍',
      icon: '🎁',
      image: './drop_item.png',
      lore: '击败秘境强敌或高危妖兽后掉落的乾坤储物宝箱，内藏诸多修仙遗物、丹药符箓与罕见天材地宝。',
      effect: '拾取后存入随身储物袋，通关时在清点阶段逐一开箱并决定保留或融炼为灵气。',
      qiVal: 25,
      stats: [
        { label: '掉落来源', val: '精英怪 / 强敌' },
        { label: '外观形态', val: '暗金雕花乾坤宝箱' },
        { label: '结算机制', val: '关卡终结逐一清点' }
      ],
      tactics: '遇见宝箱务必第一时间拾取入袋，通关后可自由抉择保留心仪的构筑物品。'
    }
  ],
  bosses: [
    {
      id: 'red_dragon',
      name: '千年赤炼蛟',
      title: '筑基境领主 · 赤焰火煞',
      tag: '筑基领主',
      icon: '🐉',
      image: './boss_red_dragon.png',
      lore: '隐伏于赤焰熔渊深处修道千年的凶煞恶蛟。吞吐地心熔岩，赤鳞如烈火燎原，头顶独角蕴含狂暴火毒。凡修士踏入筑基之境，必受其焚天火煞考验。',
      stats: [
        { label: '境界归属', val: '筑基期 (大境界突破遭遇)' },
        { label: '领主血量', val: '1200 / 1600 (共2阶段)' },
        { label: '近战突刺', val: '蛟龙穿云突 (预警暴冲)' },
        { label: '弹幕法术', val: '扇形赤炼毒火弹 (5~9发)' },
        { label: '范围法阵', val: '地脉火煞 (地面延时喷涌)' }
      ],
      tactics: '近战冲刺带有醒目的红色长方形预警线，看到预警立刻垂直走位躲避；地火法阵蓄力1秒后喷发，切勿贪刀站在光圈内；第二阶段进入狂暴，注意应对二连暴冲。'
    },
    {
      id: 'corpse_emperor',
      name: '幽冥白骨尸皇',
      title: '结丹境领主 · 幽冥玄煞',
      tag: '结丹领主',
      icon: '💀',
      lore: '上古神魔战场千万枯骨怨念凝聚的尸道皇者。身披九幽骨铠，手持玄冥白骨巨剑，挥洒黄泉死气。突破至结丹境后，其自九幽黄泉踏空而来。',
      stats: [
        { label: '境界归属', val: '结丹期 (大境界突破遭遇)' },
        { label: '领主血量', val: '2400 / 3200 (共2阶段)' },
        { label: '近战突刺', val: '白骨瞬影斩 (幽绿残影)' },
        { label: '弹幕法术', val: '双环幽冥白骨刺齐射' },
        { label: '范围法阵', val: '黄泉尸煞阵 (超大范围减速腐蚀)' }
      ],
      tactics: '骨皇瞬影斩近身极快，保持中远距离拉扯；骨刺弹幕呈螺旋旋转发射，顺着弹幕缝隙穿梭即可安然无恙；进入第二阶段会召唤白骨怨灵，需配合范围法宝清场。'
    },
    {
      id: 'asura_demon',
      name: '九天噬魂魔尊',
      title: '元婴境领主 · 虚空真魔',
      tag: '元婴领主',
      icon: '👹',
      lore: '撕裂域外虚空降临凡界的元神巨魔，吞纳万千修士精魂。三头六臂，魔气滔天，擅使空间崩塌与魔魂弹幕。修士破丹成婴之时，天魔必降夺其元神。',
      stats: [
        { label: '境界归属', val: '元婴期 (大境界突破遭遇)' },
        { label: '领主血量', val: '2800 / 3600 / 4400 (分3阶段)' },
        { label: '近战突刺', val: '修罗破虚闪 (瞬移强袭)' },
        { label: '弹幕法术', val: '天魔噬魂弹 (微追踪骷髅弹)' },
        { label: '范围法阵', val: '虚空塌陷 (全屏黑洞强引力场)' }
      ],
      tactics: '拥有罕见的三阶段终极形态演进！三阶段进入终焉狂化，全屏暗紫变幻，弹幕与冲锋频率极大提高，必须依赖高等级防御与极品法宝爆发击杀。'
    },
    {
      id: 'celestial_peng',
      name: '巡天金翅大鹏',
      title: '化神境领主 · 太古神禽',
      tag: '化神领主',
      icon: '🦅',
      lore: '水击三千里，抟扶摇而上九万里！太古金翅神禽，羽化神雷，飞扑破空如金虹贯日，执掌天地太乙罡风。乃化神大能悟道登仙之路上的护道神禽。',
      stats: [
        { label: '境界归属', val: '化神期及更高境界' },
        { label: '领主血量', val: '4200 / 5500 (共2阶段)' },
        { label: '近战突刺', val: '九霄金芒冲 (超神速雷霆俯冲)' },
        { label: '弹幕法术', val: '太乙金羽剑雨 (高速破空)' },
        { label: '范围法阵', val: '九霄天雷阵 (连环神雷轰击)' }
      ],
      tactics: '大鹏机动速度极高，俯冲速度惊人；太乙金羽剑雨呈高密度扇形倾泻，建议强化神识拉开远距离射程，在其施放天雷阵时找空档集火输出。'
    }
  ]
};

let currentCodexCat = 'characters';
let selectedCodexItem = null;

function initCodex() {
  if (isHeadless) return;
  const tabsContainer = document.querySelector('#codex-tabs');
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.codex-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.cat;
        if (cat && cat !== currentCodexCat) {
          if (typeof sound !== 'undefined' && sound.click) sound.click();
          tabsContainer.querySelectorAll('.codex-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          currentCodexCat = cat;
          renderCodexGrid();
        }
      });
    });
  }

  const btnCodexBack = document.querySelector('#btn-codex-back');
  if (btnCodexBack) {
    btnCodexBack.addEventListener('click', () => {
      if (typeof sound !== 'undefined' && sound.click) sound.click();
      if (typeof showScreen === 'function') showScreen('title');
    });
  }

  // 默认渲染第一个分类
  renderCodexGrid();
}

function renderCodexGrid() {
  if (isHeadless) return;
  const grid = document.querySelector('#codex-grid');
  if (!grid) return;

  const items = CODEX_DATA[currentCodexCat] || [];
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = '<div class="codex-empty">此卷道法尚未出世</div>';
    renderCodexDetail(null);
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'codex-item-card';
    if (selectedCodexItem && selectedCodexItem.id === item.id) {
      card.classList.add('active');
    } else if (!selectedCodexItem && index === 0) {
      card.classList.add('active');
      selectedCodexItem = item;
    }

    const imgMarkup = item.image
      ? `<img src="${item.image}" alt="${item.name}" class="codex-card-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/><div class="codex-card-fallback-icon" style="display:none;">${item.icon || '✧'}</div>`
      : `<div class="codex-card-fallback-icon">${item.icon || '✧'}</div>`;

    card.innerHTML = `
      <div class="codex-card-visual">
        ${imgMarkup}
      </div>
      <div class="codex-card-info">
        <div class="codex-card-name-row">
          <span class="codex-card-name">${item.name}</span>
          ${item.tag ? `<span class="codex-card-tag">${item.tag}</span>` : ''}
        </div>
        <div class="codex-card-title">${item.title || item.type || ''}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      if (typeof sound !== 'undefined' && sound.click) sound.click();
      grid.querySelectorAll('.codex-item-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedCodexItem = item;
      renderCodexDetail(item);
    });

    grid.appendChild(card);
  });

  // 如果没有选中项或者选中项不属于当前分类，默认选第一项
  if (!selectedCodexItem || !items.some(x => x.id === selectedCodexItem.id)) {
    selectedCodexItem = items[0] || null;
    const firstCard = grid.querySelector('.codex-item-card');
    if (firstCard) firstCard.classList.add('active');
  }

  renderCodexDetail(selectedCodexItem);
}

function renderCodexDetail(item) {
  if (isHeadless) return;
  const detail = document.querySelector('#codex-detail');
  if (!detail) return;

  if (!item) {
    detail.innerHTML = `
      <div class="codex-detail-placeholder">
        <div class="placeholder-icon">☯</div>
        <p>在左侧选择一项图鉴以查阅其具体道法介绍与属性</p>
      </div>
    `;
    return;
  }

  const imgMarkup = item.image
    ? `<img src="${item.image}" alt="${item.name}" class="codex-detail-portrait" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="codex-detail-fallback-icon" style="display:none;">${item.icon || '✧'}</div>`
    : `<div class="codex-detail-fallback-icon">${item.icon || '✧'}</div>`;

  let statsHtml = '';
  if (item.stats && item.stats.length > 0) {
    statsHtml = `
      <div class="codex-section">
        <div class="codex-sec-title">❖ 基础属性与道法规约</div>
        <div class="codex-stats-grid">
          ${item.stats.map(s => `
            <div class="codex-stat-row">
              <span class="stat-lbl">${s.label}</span>
              <b class="stat-val">${s.val}</b>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let weaponsHtml = '';
  if (item.weapons && item.weapons.length > 0) {
    weaponsHtml = `
      <div class="codex-section">
        <div class="codex-sec-title">⚔️ 本命起手法宝</div>
        <div class="codex-tag-list">
          ${item.weapons.map(w => `<span class="codex-pill">${w}</span>`).join('')}
        </div>
      </div>
    `;
  }

  let upgradeHtml = '';
  if (item.upgrade) {
    upgradeHtml = `
      <div class="codex-section">
        <div class="codex-sec-title">📈 升级与成长路线</div>
        <div class="codex-sec-desc">${item.upgrade}</div>
      </div>
    `;
  }

  let effectHtml = '';
  if (item.effect) {
    effectHtml = `
      <div class="codex-section">
        <div class="codex-sec-title">✨ 天道妙效</div>
        <div class="codex-sec-desc highlight">${item.effect}</div>
      </div>
    `;
  }

  let tacticsHtml = '';
  if (item.tactics) {
    tacticsHtml = `
      <div class="codex-section">
        <div class="codex-sec-title">💡 实战妙用与心得</div>
        <div class="codex-sec-desc">${item.tactics}</div>
      </div>
    `;
  }

  detail.innerHTML = `
    <div class="codex-detail-inner">
      <div class="codex-detail-header">
        <div class="detail-avatar-box">
          ${imgMarkup}
        </div>
        <div class="detail-title-box">
          <div class="detail-name-row">
            <h3 class="detail-name">${item.name}</h3>
            ${item.tag ? `<span class="detail-tag">${item.tag}</span>` : ''}
          </div>
          <div class="detail-sub">${item.title || item.type || ''}</div>
        </div>
      </div>

      <div class="codex-section">
        <div class="codex-sec-title">📜 溯源典故</div>
        <div class="codex-lore-text">${item.lore || '此乃秘境天成之物，玄妙莫测。'}</div>
      </div>

      ${effectHtml}
      ${statsHtml}
      ${weaponsHtml}
      ${upgradeHtml}
      ${tacticsHtml}
    </div>
  `;
}

// ==========================================
// 演武试炼 (测试关卡) 系统实现 (Test Level System)
// ==========================================

let testActiveTab = 'weapons';

function initTestStats() {
  game.testStats = {
    totalDamage: 0,
    hits: 0,
    peakHit: 0,
    startTime: performance.now(),
    recentHits: [],
    sources: {
      primary: 0,
      chain_arc: 0,
      blazing_fire: 0,
      pets: 0,
      other: 0
    }
  };
  updateTestHUD();
}

function resetTestStats() {
  initTestStats();
  if (game.enemies) {
    for (const e of game.enemies) {
      if (e.isDummy) {
        e.totalDamageTaken = 0;
      }
    }
  }
  updateTestHUD();
  if (testActiveTab === 'stats') {
    renderTestPanelTab('stats');
  }
}

function recordTestDamage(amount, enemy, source = null) {
  if (!game.testStats) initTestStats();
  const dmg = Math.max(1, Math.round(amount));
  const now = performance.now();

  game.testStats.totalDamage += dmg;
  game.testStats.hits += 1;
  if (dmg > game.testStats.peakHit) {
    game.testStats.peakHit = dmg;
  }

  if (enemy && enemy.isDummy) {
    enemy.totalDamageTaken = (enemy.totalDamageTaken || 0) + dmg;
    enemy.lastHitTime = now;
  }

  let src = source;
  if (!src) {
    if (enemy && enemy._currentDamageSource) {
      src = enemy._currentDamageSource;
    } else if (game._currentAttackIsPrimary) {
      src = 'primary';
    } else {
      src = 'other';
    }
  }

  if (game.testStats.sources[src] !== undefined) {
    game.testStats.sources[src] += dmg;
  } else {
    game.testStats.sources.other = (game.testStats.sources.other || 0) + dmg;
  }

  game.testStats.recentHits.push({ time: now, dmg, src });
  updateTestHUD();
}

function updateTestStats(dt) {
  if (!game.testStats) return;
  const now = performance.now();
  game.testStats.recentHits = (game.testStats.recentHits || []).filter(h => now - h.time <= 3500);
  updateTestHUD();
}

function updateTestHUD() {
  if (isHeadless) return;
  const elDps = document.querySelector('#test-hud-dps');
  const elTotal = document.querySelector('#test-hud-total');
  const elPeak = document.querySelector('#test-hud-peak');
  const elHits = document.querySelector('#test-hud-hits');
  if (!elDps || !game.testStats) return;

  const now = performance.now();
  const recentHits = (game.testStats.recentHits || []).filter(h => now - h.time <= 3000);
  const rollingDamage = recentHits.reduce((acc, h) => acc + h.dmg, 0);
  const rollingDPS = Math.round(rollingDamage / 3.0);

  elDps.textContent = rollingDPS.toLocaleString();
  if (elTotal) elTotal.textContent = Math.round(game.testStats.totalDamage || 0).toLocaleString();
  if (elPeak) elPeak.textContent = Math.round(game.testStats.peakHit || 0).toLocaleString();
  if (elHits) elHits.textContent = (game.testStats.hits || 0).toLocaleString();
}

function spawnTestDummy(kind = 'immortal', x = 620, y = 270) {
  const dummy = {
    x: Math.max(30, Math.min(ARENA_WIDTH - 30, x)),
    y: Math.max(30, Math.min(ARENA_HEIGHT - 30, y)),
    r: kind === 'immortal' ? 22 : (kind === 'tank' ? 26 : 14),
    hp: kind === 'immortal' ? 99999999 : (kind === 'tank' ? 50000 : 50),
    maxHp: kind === 'immortal' ? 99999999 : (kind === 'tank' ? 50000 : 50),
    speed: 0,
    damage: 0,
    color: kind === 'immortal' ? '#d4af37' : (kind === 'tank' ? '#38bdf8' : '#a3e635'),
    kind,
    isDummy: true,
    immortal: kind === 'immortal',
    totalDamageTaken: 0,
    spawnTime: performance.now(),
    hit: 0,
    flameBrand: null
  };
  game.enemies.push(dummy);
  return dummy;
}

function spawnDummyCluster(count = 16, radius = 120, kind = 'straw') {
  const cx = game.player.x;
  const cy = game.player.y;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    spawnTestDummy(kind, x, y);
  }
}

function clearTestDummies() {
  game.enemies = [];
  game.markers = [];
}

function resetDummyPositions() {
  const immortal = game.enemies.find(e => e.isDummy && e.immortal);
  if (immortal) {
    immortal.x = ARENA_WIDTH / 2 + 130;
    immortal.y = ARENA_HEIGHT / 2;
  } else {
    spawnTestDummy('immortal', ARENA_WIDTH / 2 + 130, ARENA_HEIGHT / 2);
  }
}

function drawTrainingDummy(ctx, dummy) {
  if (isHeadless) return;
  const x = dummy.x;
  const y = dummy.y;
  const hitSquash = dummy.hit > 0 ? Math.sin((dummy.hit / 0.16) * Math.PI) * 0.18 : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1 + hitSquash, 1 - hitSquash * 0.8);

  if (dummy.kind === 'immortal') {
    // 1. 不死神木桩: 金色道门道标灵桩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 10, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const grad = ctx.createLinearGradient(-16, 0, 16, 0);
    grad.addColorStop(0, '#5c3a21');
    grad.addColorStop(0.5, '#8c5932');
    grad.addColorStop(1, '#3b2515');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-16, -26, 32, 36, 4);
    else ctx.rect(-16, -26, 32, 36);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, -8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -8, 4, 0, Math.PI * 2);
    ctx.fill();

    const pulse = Math.sin(performance.now() * 0.005) * 2;
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -28 + pulse, 12, 0, Math.PI * 2);
    ctx.stroke();

    if (dummy.hit > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(0, -8, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (dummy.kind === 'straw') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -22, 4, 32);
    ctx.fillRect(-14, -12, 28, 4);

    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(0, -6, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, -18, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-8, -7, 16, 2);

    if (dummy.hit > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(0, -10, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (dummy.kind === 'tank') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-18, -26, 36, 38, 6);
    else ctx.rect(-18, -26, 36, 38);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.lineTo(0, 6);
    ctx.moveTo(-10, -8); ctx.lineTo(10, -8);
    ctx.stroke();

    if (dummy.hit > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(0, -6, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.save();
  if (dummy.kind === 'immortal') {
    const badgeText = '【不死神桩】';
    const dmgText = `承伤: ${Math.round(dummy.totalDamageTaken || 0).toLocaleString()}`;

    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';

    ctx.fillStyle = 'rgba(10, 18, 24, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - 48, y - 52, 96, 26, 4);
    else ctx.rect(x - 48, y - 52, 96, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.fillText(badgeText, x, y - 39);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(dmgText, x, y - 28);
  } else if (dummy.kind === 'straw' || dummy.kind === 'tank') {
    const barW = dummy.kind === 'tank' ? 44 : 28;
    const barH = 4;
    const barX = x - barW / 2;
    const barY = y - dummy.r - 10;
    const hpPct = Math.max(0, Math.min(1, dummy.hp / dummy.maxHp));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2)
    ctx.fillStyle = dummy.kind === 'tank' ? '#38bdf8' : '#a3e635';
    ctx.fillRect(barX, barY, barW * hpPct, barH);

    if (dummy.kind === 'straw') {
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.fillText('易爆草人', x, barY - 3);
    } else {
      ctx.font = '9px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(dummy.hp)}`, x, barY - 3);
    }
  }
  ctx.restore();
}

function applyTestWeapon(charId, weaponId, notify = true) {
  const char = characters.find(c => c.id === charId) || characters[0];
  const weapon = char.weapons.find(w => w.id === weaponId) || char.weapons[0];

  game.player.charId = char.id;
  game.player.charName = char.name;
  game.player.spriteUrl = char.spriteUrl;
  game.player.weaponId = weapon.id;
  game.player.weaponType = weapon.type;

  const currentCount = (game.weapons[0] && game.weapons[0].count) || 1;
  game.weapons[0] = {
    id: weapon.id,
    weaponType: weapon.type,
    type: '本命法宝',
    name: weapon.name,
    icon: weapon.icon,
    image: weapon.image || `./weapon_${weapon.type}.png`,
    detail: weapon.desc,
    count: currentCount
  };

  char.applyBonus(game);
  weapon.apply(game);

  recomputeMaxHp();
  recomputeAttackRange();

  if (typeof updateCharStatusHUD === 'function') updateCharStatusHUD();
  if (typeof updateWeaponSlotHUD === 'function') updateWeaponSlotHUD();

  if (notify) {
    addLog(`演武调整：已切换至「${char.name}」本命神兵「${weapon.name}」。`, true);
  }
  if (testActiveTab === 'weapons') {
    renderTestPanelTab('weapons');
  }
}

function setTestSkillLevel(skillId, level) {
  const lvl = Math.max(0, parseInt(level) || 0);
  if (skillId === 'chain_arc') {
    game.chainArcLevel = lvl;
    const existing = game.passives.find(p => p.id === 'chain_arc');
    if (lvl > 0) {
      const n = getChainArcN();
      if (existing) {
        existing.count = lvl;
        existing.detail = `金雷传递 ${n} 怪 · 威力 ${n}%`;
      } else {
        addBuild(game.passives, {
          id: 'chain_arc',
          name: '连锁电弧',
          icon: '⚡',
          type: '神通',
          detail: `金雷传递 ${n} 怪 · 威力 ${n}%`,
          count: lvl
        });
      }
    } else {
      game.passives = game.passives.filter(p => p.id !== 'chain_arc');
    }
  } else if (skillId === 'blazing_fire') {
    game.blazingFireLevel = lvl;
    const existing = game.passives.find(p => p.id === 'blazing_fire');
    if (lvl > 0) {
      const p = getBlazingFireParams();
      if (existing) {
        existing.count = lvl;
        existing.detail = `持续灼烧 ${p.burnDmgPct}%/s · 爆裂 ${p.burstDamagePct}% · 溅射 ${p.motesCount} 流星`;
      } else {
        addBuild(game.passives, {
          id: 'blazing_fire',
          name: '离火焚原',
          icon: '🔥',
          image: './skill_blazing_fire.png',
          type: '神通',
          detail: `持续灼烧 ${p.burnDmgPct}%/s · 爆裂 ${p.burstDamagePct}% · 溅射 ${p.motesCount} 流星`,
          count: lvl
        });
      }
    } else {
      game.passives = game.passives.filter(p => p.id !== 'blazing_fire');
    }
  } else if (['fire', 'pet', 'formation', 'thunder'].includes(skillId)) {
    const slotIdx = getOffensiveSlotIndex(skillId);
    if (lvl <= 0) {
      if (slotIdx >= 0) {
        const itemDef = OFFENSIVE_ITEM_DEFS[skillId];
        if (itemDef && itemDef.onRemove) itemDef.onRemove(game);
        game.offensiveSlots[slotIdx] = null;
      }
    } else {
      if (slotIdx < 0) {
        const freeIdx = getAvailableOffensiveSlotIndex();
        const targetSlot = freeIdx >= 0 ? freeIdx : 0;
        if (game.offensiveSlots[targetSlot]) {
          const oldDef = OFFENSIVE_ITEM_DEFS[game.offensiveSlots[targetSlot].id];
          if (oldDef && oldDef.onRemove) oldDef.onRemove(game);
        }
        const itemDef = OFFENSIVE_ITEM_DEFS[skillId];
        game.offensiveSlots[targetSlot] = { id: skillId, level: lvl };
        if (itemDef && itemDef.onEquip) itemDef.onEquip(game);
        for (let i = 1; i < lvl; i++) {
          if (itemDef && itemDef.onUpgrade) itemDef.onUpgrade(game, i + 1);
        }
      } else {
        const itemDef = OFFENSIVE_ITEM_DEFS[skillId];
        game.offensiveSlots[slotIdx].level = lvl;
        if (itemDef && itemDef.onUpgrade) itemDef.onUpgrade(game, lvl);
      }
    }
    if (typeof updateWeaponSlotHUD === 'function') updateWeaponSlotHUD();
  } else if (skillId === 'primary_count') {
    if (game.weapons[0]) {
      game.weapons[0].count = Math.max(1, lvl);
      game.weapons[0].detail = `${game.weapons[0].name} · 强化重数 Lv.${game.weapons[0].count}`;
    }
  }

  if (typeof updateWeaponSlotHUD === 'function') updateWeaponSlotHUD();
  if (testActiveTab === 'skills') {
    renderTestPanelTab('skills');
  }
}

function setTestRealm(realmIdx, subIdx) {
  game.realm = Math.max(0, Math.min(realmNames.length - 1, realmIdx));
  game.subStage = Math.max(0, Math.min(3, subIdx));
  recomputeMaxHp();
  game.hp = game.maxHp;
  updateUI();
  if (testActiveTab === 'realms') {
    renderTestPanelTab('realms');
  }
}

function openTestPanel() {
  openModal('modal-test-panel');
  renderTestPanelTab(testActiveTab);
}

function closeTestPanel() {
  closeModal('modal-test-panel');
}

function toggleTestPanel(force) {
  const panel = document.querySelector('#modal-test-panel');
  if (!panel) return;
  const isHidden = panel.classList.contains('hidden');
  const shouldOpen = force !== undefined ? force : isHidden;
  if (shouldOpen) {
    openTestPanel();
  } else {
    closeTestPanel();
  }
}

function startTestLevel(config = {}) {
  if (typeof stopBossStage === 'function') stopBossStage();
  if (typeof weaponOrbitAnimId !== 'undefined' && weaponOrbitAnimId) {
    cancelAnimationFrame(weaponOrbitAnimId);
    weaponOrbitAnimId = null;
  }

  game.isBossStage = false;
  game.pendingBossStage = false;
  game.primordialGodEncountered = false;
  game.primordialGodTriggered = false;
  game.boss = null;
  game.bossAoEs = [];
  game.bossProjectiles = [];
  game.isEndlessMode = false;
  game.isTestLevel = true;
  game.testElapsed = 0;
  game.testAutoSpawn = config.autoSpawn !== undefined ? config.autoSpawn : false;
  game.testGodMode = config.godMode !== undefined ? config.godMode : true;

  game.stage = 1;
  game.stageTime = 999999;
  game.stageElapsed = 0;
  game.stageKills = 0;
  game.bossesDefeated = 0;
  game.defeatedRedDragon = false;
  game.playerBurnTimer = 0;
  game.playerBurnTick = 0;
  game.playerBurnDmg = 0;
  game.playerChillTimer = 0;
  game.playerChillSlow = 0;
  game.playerFreezeTimer = 0;

  game.spawnTimer = game.testAutoSpawn ? 0 : 999999;
  game.shotTimer = 0;
  game.petTimer = 0;
  game.thunderTimer = 0;
  game.formationTimer = 0;
  game.fireTimer = 0;

  game.xp = 0;
  game.xpNeed = FIRST_QI_COST;
  game.kills = 0;
  game.realm = config.realm !== undefined ? config.realm : 0;
  game.subStage = config.subStage !== undefined ? config.subStage : 0;

  game.baseHp = BASE_HP;
  game.bonusHp = 0;
  game.maxHp = BASE_HP;
  game.hp = BASE_HP;
  game.attack = 18;
  game.attackSpeed = 1;
  game.moveSpeed = 220;
  game.pickup = 86;
  game.baseAttackRange = 140;
  game.bonusAttackRange = 0;
  game.attackRange = 140;

  game.petDamage = 42;
  game.firePower = 1;
  game.formationPower = 1;
  game.thunderDamage = 0;
  game.flash = 0;

  game.passives = [];
  game.formations = [];
  game.pets = [];
  game.petFox = null;
  game.treasures = [];
  game.enemies = [];
  game.markers = [];
  game.projectiles = [];
  game.specialAttacks = [];
  game.damageNumbers = [];
  game.showFloatingDamage = true;
  game.cameraShake = 0;
  game._lastShakeTime = 0;

  game.chainArcLevel = 0;
  game.chainArcN = null;
  game.chainArcs = [];
  game.chainArcCooldown = 0;
  game.blazingFireLevel = 0;
  game.blazingBursts = [];
  game.blazingMotes = [];
  game.blazingEmberParticles = [];
  game.pendingDetonations = [];
  game._isDetonating = false;
  game._currentAttackIsPrimary = false;

  game.offensiveSlots = [null, null, null, null];
  game.drops = [];
  game.particles = [];
  game.zaps = [];
  game.lootBag = [];
  game.settlement = null;
  game.clearingStage = false;
  game.stageClearPhase = null;
  game.gameOver = false;
  game.paused = false;

  game.player.x = ARENA_WIDTH / 2;
  game.player.y = ARENA_HEIGHT / 2;
  game.player.invuln = 0;
  game.player.attackTimer = 0;
  game.player.attackAngle = 0;

  if (ui.overlay) ui.overlay.classList.add('hidden');
  closeModal('modal-loot-review');
  closeModal('modal-pause');
  closeModal('modal-settings');
  closeModal('modal-slot-replace');

  // 初始化角色与武器
  const charId = config.charId || (characters[selectedCharIndex] ? characters[selectedCharIndex].id : 'sword');
  const weaponId = config.weaponId || (characters[selectedCharIndex] && characters[selectedCharIndex].weapons[selectedWeaponIndex] ? characters[selectedCharIndex].weapons[selectedWeaponIndex].id : 'sword_qingfeng');
  applyTestWeapon(charId, weaponId, false);

  initTestStats();

  // 默认在玩家正前方偏右处召唤一个【不死神桩】
  spawnTestDummy('immortal', ARENA_WIDTH / 2 + 130, ARENA_HEIGHT / 2);

  showScreen('game');

  const testToolbar = document.querySelector('#test-hud-toolbar');
  if (testToolbar) testToolbar.classList.remove('hidden');

  const bossHud = document.querySelector('#boss-hud-bar');
  if (bossHud) bossHud.classList.add('hidden');

  if (ui.timer) ui.timer.textContent = '演武场';

  addLog('已进入【演武试炼场】，可按 T 随时呼出调控台切换24把神兵、技能与属性。', true);
  updateUI();
}

function exitTestLevel() {
  game.isTestLevel = false;
  const testToolbar = document.querySelector('#test-hud-toolbar');
  if (testToolbar) testToolbar.classList.add('hidden');
  closeModal('modal-test-panel');
  showScreen('title');
}

function renderTestPanelTab(tabName = 'weapons') {
  const body = document.querySelector('#test-panel-body');
  if (!body) return;
  testActiveTab = tabName;

  document.querySelectorAll('#test-panel-tabs .test-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  if (tabName === 'weapons') {
    let html = `
      <div class="test-section-box">
        <div class="test-section-title">
          <span>⚔️ 24把八派神兵法宝（点击立即切换并重算攻防与立绘）</span>
          <span style="font-size:11px;color:#a4beba;">当前本命：<b style="color:#ffd875;">${game.weapons[0]?.name || '未知'}</b> (${game.player.charName})</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
    `;

    characters.forEach(char => {
      html += `
        <div style="background:rgba(12,20,26,0.65); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:10px 12px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">${char.icon}</span>
              <b style="color:#f2e3be; font-size:13px;">${char.name}</b>
              <span style="font-size:10px; color:#8da49d; background:rgba(30,48,56,0.6); padding:1px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.08);">${char.class}</span>
            </div>
            <span style="font-size:11px; color:#7b948e;">${char.passiveText}</span>
          </div>
          <div class="test-grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px;">
      `;

      char.weapons.forEach(w => {
        const isCurrent = game.player.weaponId === w.id;
        html += `
          <div class="test-weapon-card-item" data-char="${char.id}" data-weapon="${w.id}"
            style="padding:8px 10px; border-radius:6px; background:${isCurrent ? 'rgba(212,175,55,0.18)' : 'rgba(20,32,40,0.65)'}; border:1px solid ${isCurrent ? '#ffd166' : 'rgba(255,255,255,0.1)'}; cursor:pointer; transition:all 0.15s; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:16px;">${w.icon}</span>
                <b style="color:${isCurrent ? '#ffd875' : '#e8eee9'}; font-size:12px;">${w.name}</b>
              </div>
              ${isCurrent ? '<span style="font-size:10px; color:#ffd166; background:rgba(212,175,55,0.25); padding:1px 6px; border-radius:4px; font-weight:bold;">当前装备</span>' : '<button class="test-pill-btn" style="padding:2px 8px; font-size:10px;">装备</button>'}
            </div>
            <div style="font-size:11px; color:#8da49d; line-height:1.4;">${w.desc}</div>
            <div style="display:flex; gap:8px; font-size:10px; color:#5ce6b6; margin-top:2px;">
              <span>伤害: ${w.stats?.dmg || 18}</span>
              <span>攻速: ${w.stats?.spd || '1.0/s'}</span>
              <span>范围: ${w.stats?.rng || '140px'}</span>
            </div>
          </div>
        `;
      });

      html += `</div></div>`;
    });

    html += `</div></div>`;
    body.innerHTML = html;

    body.querySelectorAll('.test-weapon-card-item').forEach(card => {
      card.addEventListener('click', () => {
        sound.click();
        const cid = card.dataset.char;
        const wid = card.dataset.weapon;
        applyTestWeapon(cid, wid);
      });
    });

  } else if (tabName === 'skills') {
    const chainArcLvl = game.chainArcLevel || 0;
    const chainArcN = getChainArcN();
    const blazingFireLvl = game.blazingFireLevel || 0;
    const blazingP = getBlazingFireParams();
    const primaryCount = (game.weapons[0] && game.weapons[0].count) || 1;

    const getSlotLvl = (id) => {
      const idx = getOffensiveSlotIndex(id);
      return idx >= 0 && game.offensiveSlots[idx] ? game.offensiveSlots[idx].level : 0;
    };
    const fireLvl = getSlotLvl('fire');
    const petLvl = getSlotLvl('pet');
    const formationLvl = getSlotLvl('formation');
    const thunderLvl = getSlotLvl('thunder');

    body.innerHTML = `
      <div class="test-section-box">
        <div class="test-section-title">
          <span>⚡ 核心神通绝技（即时调整重数与倍率）</span>
          <span style="font-size:11px;color:#8da49d;">数值设定已严格对齐设定手册与更新公式</span>
        </div>
        <div class="test-grid-2">
          <!-- 连锁电弧 -->
          <div class="test-control-box" style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:16px;">⚡</span>
                <b style="color:#ffd875; font-size:13px;">连锁电弧</b>
              </div>
              <div class="test-stepper">
                <button class="test-stepper-btn" data-act="step" data-target="chain_arc" data-delta="-1">-</button>
                <span class="test-stepper-val">${chainArcLvl === 0 ? '未领悟' : `第 ${chainArcLvl} 重`}</span>
                <button class="test-stepper-btn" data-act="step" data-target="chain_arc" data-delta="1">+</button>
              </div>
            </div>
            <div class="test-control-sub">
              ${chainArcLvl > 0 ? `当前效果：金雷跳跃 <b>${chainArcN}</b> 个敌怪 · 每次造成 <b>${chainArcN}%</b> 伤害` : '暂未激活（点击 + 号纳入神通）'}
            </div>
            <div style="font-size:10px; color:#5ce6b6; margin-top:4px;">计算公式：传递数量与威力 = 10 + (重数 - 1) × 5</div>
          </div>

          <!-- 离火焚原 -->
          <div class="test-control-box" style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:16px;">🔥</span>
                <b style="color:#ffd875; font-size:13px;">离火焚原</b>
              </div>
              <div class="test-stepper">
                <button class="test-stepper-btn" data-act="step" data-target="blazing_fire" data-delta="-1">-</button>
                <span class="test-stepper-val">${blazingFireLvl === 0 ? '未领悟' : `第 ${blazingFireLvl} 重`}</span>
                <button class="test-stepper-btn" data-act="step" data-target="blazing_fire" data-delta="1">+</button>
              </div>
            </div>
            <div class="test-control-sub">
              ${blazingFireLvl > 0 ? `持续灼烧 <b>${blazingP.burnDmgPct}%/s</b> · 爆裂 <b>${blazingP.burstDamagePct}%</b> · 溅射 <b>${blazingP.motesCount}</b> 颗流星` : '暂未激活（点击 + 号纳入神通）'}
            </div>
            <div style="font-size:10px; color:#5ce6b6; margin-top:4px;">计算公式：灼烧 10+(lvl-1)*5%/s，爆裂 20+(lvl-1)*5%，流星 3+(lvl-1)*2</div>
          </div>
        </div>
      </div>

      <div class="test-section-box">
        <div class="test-section-title">
          <span>⚔️ 本命神兵强化重数 & 进攻法宝槽位（四象槽位）</span>
        </div>
        <div class="test-grid-2">
          <!-- 本命神兵强化 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">🗡️ 本命神兵升级重数 (数量/强化)</div>
              <div class="test-control-sub">当前重数：Lv.${primaryCount} (剑系增发剑影，重器增幅伤害与冲击)</div>
            </div>
            <div class="test-stepper">
              <button class="test-stepper-btn" data-act="step" data-target="primary_count" data-delta="-1">-</button>
              <span class="test-stepper-val">Lv.${primaryCount}</span>
              <button class="test-stepper-btn" data-act="step" data-target="primary_count" data-delta="1">+</button>
            </div>
          </div>

          <!-- 赤炎葫芦 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">◈ 赤炎葫芦（每2.2秒喷射灼热火线）</div>
              <div class="test-control-sub">${fireLvl > 0 ? `槽位已装备 · 强化 Lv.${fireLvl}` : '未装备 (槽位空置)'}</div>
            </div>
            <div class="test-stepper">
              <button class="test-stepper-btn" data-act="step" data-target="fire" data-delta="-1">-</button>
              <span class="test-stepper-val">${fireLvl === 0 ? '空' : `Lv.${fireLvl}`}</span>
              <button class="test-stepper-btn" data-act="step" data-target="fire" data-delta="1">+</button>
            </div>
          </div>

          <!-- 青羽灵狐 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">♢ 青羽灵狐（每4秒扑击范围撕咬）</div>
              <div class="test-control-sub">${petLvl > 0 ? `槽位已装备 · 强化 Lv.${petLvl} (伤害 ${game.petDamage})` : '未装备 (槽位空置)'}</div>
            </div>
            <div class="test-stepper">
              <button class="test-stepper-btn" data-act="step" data-target="pet" data-delta="-1">-</button>
              <span class="test-stepper-val">${petLvl === 0 ? '空' : `Lv.${petLvl}`}</span>
              <button class="test-stepper-btn" data-act="step" data-target="pet" data-delta="1">+</button>
            </div>
          </div>

          <!-- 回风阵 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">⌘ 回风阵（身周回旋护体罡风）</div>
              <div class="test-control-sub">${formationLvl > 0 ? `槽位已装备 · 强化 Lv.${formationLvl}` : '未装备 (槽位空置)'}</div>
            </div>
            <div class="test-stepper">
              <button class="test-stepper-btn" data-act="step" data-target="formation" data-delta="-1">-</button>
              <span class="test-stepper-val">${formationLvl === 0 ? '空' : `Lv.${formationLvl}`}</span>
              <button class="test-stepper-btn" data-act="step" data-target="formation" data-delta="1">+</button>
            </div>
          </div>

          <!-- 昊天雷符 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">⚡ 昊天雷符（每3秒降下天劫落雷）</div>
              <div class="test-control-sub">${thunderLvl > 0 ? `槽位已装备 · 强化 Lv.${thunderLvl} (雷伤 ${game.thunderDamage})` : '未装备 (槽位空置)'}</div>
            </div>
            <div class="test-stepper">
              <button class="test-stepper-btn" data-act="step" data-target="thunder" data-delta="-1">-</button>
              <span class="test-stepper-val">${thunderLvl === 0 ? '空' : `Lv.${thunderLvl}`}</span>
              <button class="test-stepper-btn" data-act="step" data-target="thunder" data-delta="1">+</button>
            </div>
          </div>
        </div>
      </div>
    `;

    body.querySelectorAll('button[data-act="step"]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.click();
        const target = btn.dataset.target;
        const delta = parseInt(btn.dataset.delta) || 0;
        let cur = 0;
        if (target === 'chain_arc') cur = game.chainArcLevel || 0;
        else if (target === 'blazing_fire') cur = game.blazingFireLevel || 0;
        else if (target === 'primary_count') cur = (game.weapons[0] && game.weapons[0].count) || 1;
        else if (['fire', 'pet', 'formation', 'thunder'].includes(target)) cur = getSlotLvl(target);

        setTestSkillLevel(target, Math.max(0, cur + delta));
      });
    });

  } else if (tabName === 'realms') {
    const realmNames = ['炼气', '筑基', '结丹', '元婴', '化神'];
    const subNames = ['初期', '中期', '后期', '圆满'];
    const curR = game.realm || 0;
    const curSub = game.subStage || 0;

    let realmPills = realmNames.map((rn, idx) => `
      <button class="test-pill-btn ${curR === idx ? 'active' : ''}" data-act="set-realm" data-realm="${idx}">
        ${rn}
      </button>
    `).join('');

    let subPills = subNames.map((sn, idx) => `
      <button class="test-pill-btn ${curSub === idx ? 'active' : ''}" data-act="set-substage" data-sub="${idx}">
        ${sn}
      </button>
    `).join('');

    body.innerHTML = `
      <div class="test-section-box">
        <div class="test-section-title">
          <span>🥋 境界修为选定</span>
          <span style="font-size:11px;color:#ffd875;">当前：${realmNames[curR]} · ${subNames[curSub]}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:12px; color:#8da49d; min-width:60px;">大境界：</span>
            <div class="test-pill-group">${realmPills}</div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:12px; color:#8da49d; min-width:60px;">小阶段：</span>
            <div class="test-pill-group">${subPills}</div>
          </div>
        </div>
      </div>

      <div class="test-section-box">
        <div class="test-section-title">
          <span>⚔️ 基础数值即时微调（拖动滑块或修改数值直接生效）</span>
        </div>
        <div class="test-grid-2">
          <!-- 基础攻击力 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">⚔️ 基础攻击伤害</div>
              <div class="test-control-sub">当前：${game.attack} 点</div>
            </div>
            <div class="test-slider-wrap" style="width:160px;">
              <input type="range" class="test-slider" min="5" max="300" step="1" value="${game.attack}" data-bind="attack">
              <span style="min-width:32px; font-family:monospace; color:#ffd166; font-size:12px;">${game.attack}</span>
            </div>
          </div>

          <!-- 御剑攻速 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">⚡ 御剑攻击频率</div>
              <div class="test-control-sub">当前：${(game.attackSpeed || 1).toFixed(2)}x 倍速</div>
            </div>
            <div class="test-slider-wrap" style="width:160px;">
              <input type="range" class="test-slider" min="0.5" max="3.0" step="0.05" value="${game.attackSpeed || 1}" data-bind="attackSpeed">
              <span style="min-width:32px; font-family:monospace; color:#ffd166; font-size:12px;">${(game.attackSpeed || 1).toFixed(1)}x</span>
            </div>
          </div>

          <!-- 神识感知范围 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">👁️ 神识感知与索敌半径</div>
              <div class="test-control-sub">当前：${Math.round(game.attackRange || 140)} px</div>
            </div>
            <div class="test-slider-wrap" style="width:160px;">
              <input type="range" class="test-slider" min="80" max="360" step="10" value="${Math.round(game.attackRange || 140)}" data-bind="attackRange">
              <span style="min-width:32px; font-family:monospace; color:#ffd166; font-size:12px;">${Math.round(game.attackRange || 140)}</span>
            </div>
          </div>

          <!-- 最大生命 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">❤️ 最大气血上限</div>
              <div class="test-control-sub">当前：${game.maxHp} / ${game.maxHp}</div>
            </div>
            <div class="test-slider-wrap" style="width:160px;">
              <input type="range" class="test-slider" min="50" max="2000" step="25" value="${game.maxHp}" data-bind="maxHp">
              <span style="min-width:32px; font-family:monospace; color:#ffd166; font-size:12px;">${game.maxHp}</span>
            </div>
          </div>

          <!-- 移速 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">👟 御风移动速度</div>
              <div class="test-control-sub">当前：${Math.round(game.moveSpeed)} px/s</div>
            </div>
            <div class="test-slider-wrap" style="width:160px;">
              <input type="range" class="test-slider" min="120" max="450" step="10" value="${Math.round(game.moveSpeed)}" data-bind="moveSpeed">
              <span style="min-width:32px; font-family:monospace; color:#ffd166; font-size:12px;">${Math.round(game.moveSpeed)}</span>
            </div>
          </div>

          <!-- 金刚不坏锁血开关 -->
          <div class="test-control-row">
            <div>
              <div class="test-control-label">🛡️ 金刚不坏 (无敌锁血模式)</div>
              <div class="test-control-sub">受到怪物或领主攻击时不扣生命</div>
            </div>
            <button class="test-btn ${game.testGodMode ? 'amber' : ''}" id="btn-toggle-godmode">
              ${game.testGodMode ? '已开启 (无敌锁血)' : '已关闭 (正常受击)'}
            </button>
          </div>
        </div>
      </div>
    `;

    body.querySelectorAll('button[data-act="set-realm"]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.click();
        const ridx = parseInt(btn.dataset.realm);
        setTestRealm(ridx, game.subStage || 0);
      });
    });

    body.querySelectorAll('button[data-act="set-substage"]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.click();
        const sidx = parseInt(btn.dataset.sub);
        setTestRealm(game.realm || 0, sidx);
      });
    });

    body.querySelectorAll('input[data-bind]').forEach(input => {
      input.addEventListener('input', (e) => {
        const prop = input.dataset.bind;
        const val = parseFloat(e.target.value);
        if (prop === 'attack') game.attack = Math.round(val);
        else if (prop === 'attackSpeed') game.attackSpeed = val;
        else if (prop === 'attackRange') { game.attackRange = val; game.baseAttackRange = val; }
        else if (prop === 'maxHp') { game.baseHp = val; recomputeMaxHp(); game.hp = game.maxHp; }
        else if (prop === 'moveSpeed') game.moveSpeed = val;

        const valSpan = input.parentElement.querySelector('span');
        if (valSpan) valSpan.textContent = prop === 'attackSpeed' ? `${val.toFixed(1)}x` : Math.round(val);
        updateUI();
      });
    });

    const godBtn = body.querySelector('#btn-toggle-godmode');
    if (godBtn) {
      godBtn.addEventListener('click', () => {
        sound.click();
        game.testGodMode = !game.testGodMode;
        if (game.testGodMode) game.hp = game.maxHp;
        renderTestPanelTab('realms');
      });
    }

  } else if (tabName === 'dummies') {
    const dummyCount = game.enemies.filter(e => e.isDummy).length;
    const monsterCount = game.enemies.filter(e => !e.isDummy && !e.isBoss).length;

    body.innerHTML = `
      <div class="test-section-box">
        <div class="test-section-title">
          <span>🪵 演武场靶标与木桩召唤</span>
          <span style="font-size:11px;color:#8da49d;">场上靶标：<b style="color:#ffd875;">${dummyCount}</b> 尊 · 杂妖：<b style="color:#ffd875;">${monsterCount}</b> 只</span>
        </div>
        <div class="test-grid-2">
          <!-- 不死木桩 -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#ffd875; font-size:13px;">🪵 不死神桩 (金光道标)</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">永不消亡，桩头铭牌实时显示累计承伤</div>
            </div>
            <button class="test-btn" data-act="spawn" data-kind="immortal">召唤神桩</button>
          </div>

          <!-- 环形易爆草人群 -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#a3e635; font-size:13px;">🌾 环形易爆草人群 (16只)</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">极低血量，阵亡殉爆，完美测试离火与电弧AOE</div>
            </div>
            <button class="test-btn amber" data-act="spawn-cluster" data-count="16">召唤环阵</button>
          </div>

          <!-- 巨岩沙包木桩 -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#38bdf8; font-size:13px;">🛡️ 巨岩玄石桩 (50,000 HP)</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">高血量定桩，用于测试单体击杀耗时与爆发</div>
            </div>
            <button class="test-btn" data-act="spawn" data-kind="tank">召唤玄石</button>
          </div>

          <!-- 散布草人群 -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#a3e635; font-size:13px;">🌾 广域散布草人群 (30只)</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">全场随机散布，测试神识索敌与连锁跳跃范围</div>
            </div>
            <button class="test-btn" data-act="spawn-scatter" data-count="30">散布全场</button>
          </div>

          <!-- 测试妖兽群 -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#cbd5e1; font-size:13px;">👾 秘境妖兽群 (5幽魂 + 5暴猿)</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">移动攻击的真实小怪，测试实战击退与走位</div>
            </div>
            <button class="test-btn" data-act="spawn-monsters">召唤妖群</button>
          </div>

          <!-- 测试领主 (赤炼蛟) -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#f87171; font-size:13px;">👹 领主木桩 (赤炼蛟)</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">召唤秘境领主进行血量削减与机制测试</div>
            </div>
            <button class="test-btn danger" data-act="spawn-boss">召唤蛟龙</button>
          </div>

          <!-- 测试领主 (白骨尸皇) -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(6,214,160,0.25); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#06d6a0; font-size:13px;">💀 【领主】幽冥白骨尸皇</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">分散多部位领主：一阶神颅+双臂(骨盾90%减伤+指节弹幕)；二阶三首狂骨+六臂(拍击/鬼火/狂暴冲撞)</div>
            </div>
            <button class="test-btn primary" data-act="spawn-corpse-emperor" style="background:#059669; color:#fff; border-color:#06d6a0;">召唤尸皇</button>
          </div>

          <!-- 测试精英怪 (赤炼熔岩巨兕) -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#fb923c; font-size:13px;">🔥 【精英】赤炼熔岩巨兕</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">披挂玄曜地火甲的精英怪，高血量且周期性发射熔岩扇形弹幕</div>
            </div>
            <button class="test-btn warning" data-act="spawn-elite-brute">召唤熔岩</button>
          </div>

          <!-- 测试反转精英怪 (玄霜凝晶巨兕) -->
          <div style="background:rgba(12,20,26,0.6); padding:10px 12px; border-radius:6px; border:1px solid rgba(56,189,248,0.2); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="color:#38bdf8; font-size:13px;">❄️ 【精英】玄霜凝晶巨兕</b>
              <div style="font-size:11px; color:#8da49d; margin-top:2px;">披挂万载玄冰甲的反转版精英怪，冰蓝主色调，高速发射五棱冰晶弹幕</div>
            </div>
            <button class="test-btn primary" data-act="spawn-elite-frost-brute" style="background:#0284c7; color:#fff; border-color:#38bdf8;">召唤玄霜</button>
          </div>
        </div>
      </div>

      <div class="test-section-box">
        <div class="test-section-title">
          <span>🧹 场地与靶标管理</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:10px;">
          <button class="test-btn danger" id="btn-clear-all-dummies">🧹 清空全场所有靶标与怪</button>
          <button class="test-btn" id="btn-reset-dummy-pos">🎯 重置神桩至身前 (正前方 130px)</button>
          <button class="test-btn ${game.testAutoSpawn ? 'amber' : ''}" id="btn-toggle-autospawn">
            ${game.testAutoSpawn ? '🔄 自动刷怪中 (点击关闭)' : '⏸ 自动刷怪已停止 (点击开启)'}
          </button>
        </div>
      </div>
    `;

    body.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.click();
        const act = btn.dataset.act;
        if (act === 'spawn') {
          const kind = btn.dataset.kind;
          spawnTestDummy(kind, game.player.x + 120, game.player.y);
          addLog(`已召唤【${kind === 'immortal' ? '不死神桩' : '巨岩玄石桩'}】。`, true);
        } else if (act === 'spawn-cluster') {
          spawnDummyCluster(16, 120, 'straw');
          addLog('已召唤 16 只【环形易爆草人】。', true);
        } else if (act === 'spawn-scatter') {
          for (let i = 0; i < 30; i++) {
            const rx = 40 + Math.random() * (ARENA_WIDTH - 80);
            const ry = 40 + Math.random() * (ARENA_HEIGHT - 80);
            spawnTestDummy('straw', rx, ry);
          }
          addLog('已在全场散布 30 只【易爆草人】。', true);
        } else if (act === 'spawn-monsters') {
          for (let i = 0; i < 5; i++) createEnemy('wisp', 50 + Math.random() * 100, 50 + Math.random() * (ARENA_HEIGHT - 100));
          for (let i = 0; i < 5; i++) createEnemy('brute', ARENA_WIDTH - 150 + Math.random() * 100, 50 + Math.random() * (ARENA_HEIGHT - 100));
          addLog('已召唤 10 只实战妖魔。', true);
        } else if (act === 'spawn-elite-brute') {
          createEnemy('elite_brute', game.player.x + 160, game.player.y);
          addLog('【精英】赤炼熔岩巨兕已降临演武场！', true);
        } else if (act === 'spawn-elite-frost-brute') {
          createEnemy('elite_frost_brute', game.player.x + 160, game.player.y);
          addLog('【精英】玄霜凝晶巨兕已降临演武场！', true);
        } else if (act === 'spawn-boss') {
          if (!game.enemies.some(e => e.isBoss)) {
            spawnBoss('red_dragon', 1);
            addLog('领主【千年赤炼蛟】已降临演武场！', true);
          }
        } else if (act === 'spawn-corpse-emperor') {
          if (!game.enemies.some(e => e.isBoss)) {
            spawnBoss(BOSS_CONFIGS.corpse_emperor);
            addLog('领主【幽冥白骨尸皇】已降临演武场！', true);
          }
        }
        renderTestPanelTab('dummies');
      });
    });

    body.querySelector('#btn-clear-all-dummies')?.addEventListener('click', () => {
      sound.click();
      clearTestDummies();
      addLog('已清除全场靶标与妖魔。');
      renderTestPanelTab('dummies');
    });

    body.querySelector('#btn-reset-dummy-pos')?.addEventListener('click', () => {
      sound.click();
      resetDummyPositions();
      addLog('已将不死神桩归位至玩家身前。', true);
      renderTestPanelTab('dummies');
    });

    body.querySelector('#btn-toggle-autospawn')?.addEventListener('click', () => {
      sound.click();
      game.testAutoSpawn = !game.testAutoSpawn;
      game.spawnTimer = game.testAutoSpawn ? 0 : 999999;
      renderTestPanelTab('dummies');
    });

  } else if (tabName === 'stats') {
    const stats = game.testStats || { totalDamage: 0, hits: 0, peakHit: 0, recentHits: [], sources: {} };
    const now = performance.now();
    const recentHits = (stats.recentHits || []).filter(h => now - h.time <= 3000);
    const rollingDamage = recentHits.reduce((acc, h) => acc + h.dmg, 0);
    const rollingDPS = Math.round(rollingDamage / 3.0);
    const elapsedSec = Math.max(1, Math.round((now - (stats.startTime || now)) / 1000));
    const avgDPS = Math.round(stats.totalDamage / elapsedSec);

    const total = Math.max(1, stats.totalDamage || 1);
    const srcPrimary = stats.sources?.primary || 0;
    const srcChain = stats.sources?.chain_arc || 0;
    const srcFire = stats.sources?.blazing_fire || 0;
    const srcOther = stats.sources?.other || 0;

    const pctPrimary = Math.round((srcPrimary / total) * 100);
    const pctChain = Math.round((srcChain / total) * 100);
    const pctFire = Math.round((srcFire / total) * 100);
    const pctOther = Math.round((srcOther / total) * 100);

    body.innerHTML = `
      <div class="test-section-box">
        <div class="test-section-title">
          <span>📊 伤害与秒伤统计面板</span>
          <span style="font-size:11px;color:#8da49d;">测试运行时长：${Math.floor(elapsedSec / 60)}分 ${elapsedSec % 60}秒</span>
        </div>
        <div class="test-stat-summary-grid">
          <div class="test-stat-box">
            <span class="test-stat-box-lbl">实时秒伤 (3秒平滑 DPS)</span>
            <span class="test-stat-box-val red">${rollingDPS.toLocaleString()}</span>
          </div>
          <div class="test-stat-box">
            <span class="test-stat-box-lbl">累计平均秒伤 (Avg DPS)</span>
            <span class="test-stat-box-val gold">${avgDPS.toLocaleString()}</span>
          </div>
          <div class="test-stat-box">
            <span class="test-stat-box-lbl">累计总伤害</span>
            <span class="test-stat-box-val">${Math.round(stats.totalDamage || 0).toLocaleString()}</span>
          </div>
          <div class="test-stat-box">
            <span class="test-stat-box-lbl">单次最高命中极值</span>
            <span class="test-stat-box-val gold">${Math.round(stats.peakHit || 0).toLocaleString()}</span>
          </div>
          <div class="test-stat-box">
            <span class="test-stat-box-lbl">累计总命中次数</span>
            <span class="test-stat-box-val">${(stats.hits || 0).toLocaleString()} 次</span>
          </div>
        </div>
      </div>

      <div class="test-section-box">
        <div class="test-section-title">
          <span>🎯 伤害来源分布比例 (Damage Breakdown)</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <!-- 本命法宝 -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#c0d3ce; margin-bottom:3px;">
              <span>🗡️ 本命神兵法宝输出</span>
              <span>${srcPrimary.toLocaleString()} 点 (${pctPrimary}%)</span>
            </div>
            <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${pctPrimary}%; background:#ffd166; border-radius:3px;"></div>
            </div>
          </div>

          <!-- 连锁电弧 -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#c0d3ce; margin-bottom:3px;">
              <span>⚡ 连锁电弧传导输出</span>
              <span>${srcChain.toLocaleString()} 点 (${pctChain}%)</span>
            </div>
            <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${pctChain}%; background:#38bdf8; border-radius:3px;"></div>
            </div>
          </div>

          <!-- 离火焚原 -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#c0d3ce; margin-bottom:3px;">
              <span>🔥 离火焚原 (灼烧+爆裂+流星)</span>
              <span>${srcFire.toLocaleString()} 点 (${pctFire}%)</span>
            </div>
            <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${pctFire}%; background:#f97316; border-radius:3px;"></div>
            </div>
          </div>

          <!-- 其他 -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#c0d3ce; margin-bottom:3px;">
              <span>🔮 槽位法宝/灵宠/雷击</span>
              <span>${srcOther.toLocaleString()} 点 (${pctOther}%)</span>
            </div>
            <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${pctOther}%; background:#a855f7; border-radius:3px;"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end;">
        <button class="test-btn" id="btn-reset-test-stats">🔄 重置清空所有统计数据</button>
      </div>
    `;

    body.querySelector('#btn-reset-test-stats')?.addEventListener('click', () => {
      sound.click();
      resetTestStats();
      addLog('已重置演武场伤害与秒伤统计。');
    });
  }
}

function bindTestLevelHUD() {
  document.querySelector('#test-hud-btn-panel')?.addEventListener('click', () => {
    sound.click();
    toggleTestPanel();
  });
  document.querySelector('#test-hud-btn-dummy')?.addEventListener('click', () => {
    sound.click();
    spawnTestDummy('immortal', game.player.x + 120, game.player.y);
    addLog('已在身前召唤【不死神桩】。', true);
  });
  document.querySelector('#test-hud-btn-straw')?.addEventListener('click', () => {
    sound.click();
    spawnDummyCluster(16, 120, 'straw');
    addLog('已在周围召唤 16 只【易爆草人】。', true);
  });
  document.querySelector('#test-hud-btn-clear')?.addEventListener('click', () => {
    sound.click();
    clearTestDummies();
    addLog('已清除全场木桩与怪物。');
  });
  document.querySelector('#test-hud-btn-reset-stat')?.addEventListener('click', () => {
    sound.click();
    resetTestStats();
    addLog('已重置伤害与秒伤统计。');
  });
  document.querySelector('#test-hud-btn-exit')?.addEventListener('click', () => {
    sound.click();
    exitTestLevel();
  });

  // Panel Header and Footer
  document.querySelector('#btn-test-panel-close')?.addEventListener('click', () => {
    sound.click();
    closeTestPanel();
  });
  document.querySelector('#btn-test-panel-resume')?.addEventListener('click', () => {
    sound.click();
    closeTestPanel();
  });
  document.querySelector('#btn-test-quick-straw')?.addEventListener('click', () => {
    sound.click();
    spawnDummyCluster(16, 125, 'straw');
    addLog('已召唤环形草人群。', true);
  });
  const pauseBtn = document.querySelector('#btn-test-panel-pause');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      sound.click();
      game.paused = !game.paused;
      pauseBtn.textContent = game.paused ? '▶ 继续时间' : '⏸ 暂停时间';
      pauseBtn.classList.toggle('active', game.paused);
    });
  }

  // Tabs
  const tabBtns = document.querySelectorAll('#test-panel-tabs .test-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sound.click();
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      testActiveTab = tab;
      renderTestPanelTab(tab);
    });
  });
}

initCodex();
bindTestLevelHUD();

if (typeof window !== 'undefined') {
  window.__gameControls = {
    game,
    confirmSettlement,
    startRunFromSelection,
    shoot,
    executeWeaponAttack,
    characters,
    getWeaponDef,
    CODEX_DATA,
    initCodex,
    showScreen,
    startBossStage,
    stopBossStage,
    spawnBoss,
    defeatBoss,
    damageBoss,
    BOSS_CONFIGS,
    SpriteSheetAnimation,
    getSpriteSquash,
    spawnPlayerGhostTrail,
    spawnBossGhostTrail,
    spawnHitImpact,
    playVFXAnimation,
    getStageEnemyQi,
    getStageItemDropRange,
    initStageDropTracker,
    trySpawnEnemyItemDrop,
    guaranteeStageMinDrops,
    capStageMaxDrops,
    showAscensionModal,
    startEndlessMode,
    gamepadState,
    pollGamepad,
    pulseGamepad,
    setChar: (c, w) => {
      selectedCharIndex = c
      selectedWeaponIndex = w
      if (typeof renderCharSelect === 'function') renderCharSelect()
    },
    getCharSelectStep: () => (typeof charSelectStep !== 'undefined' ? charSelectStep : 1),
    setCharSelectStep: (s) => {
      charSelectStep = s
      if (typeof renderCharSelect === 'function') renderCharSelect()
    },
    isMaxRealmMaxLevel: () => (typeof isMaxRealmMaxLevel === 'function' ? isMaxRealmMaxLevel() : false),
    triggerChainArc,
    getChainArcN,
    applyBlazingFireBrand,
    triggerBlazingDetonation,
    getBlazingFireParams,
    updateBlazingFire,
    defeat,
    isOffensiveItem,
    getOffensiveSlotIndex,
    getAvailableOffensiveSlotIndex,
    getOccupiedOffensiveSlotCount,
    equipOrUpgradeOffensiveItem,
    replaceOffensiveSlot,
    updateCharStatusHUD,
    updateWeaponSlotHUD,
    renderSettlement,
    cards,
    startTestLevel,
    exitTestLevel,
    spawnTestDummy,
    spawnDummyCluster,
    clearTestDummies,
    resetDummyPositions,
    applyTestWeapon,
    setTestSkillLevel,
    setTestRealm,
    resetTestStats,
    recordTestDamage,
    toggleTestPanel,
    openTestPanel,
    closeTestPanel,
    renderTestPanelTab,
    getDragonTextures: () => ({
      get fireballImg() { return bossDragonFireballImg },
      get fireballLoaded() { return bossDragonFireballLoaded },
      get lavaImg() { return bossDragonLavaImg },
      get lavaLoaded() { return bossDragonLavaLoaded },
      get sheetImg() { return bossRedDragonSheetImg },
      get sheetLoaded() { return bossRedDragonSheetLoaded },
      setFireballLoaded: (v) => { bossDragonFireballLoaded = v },
      setLavaLoaded: (v) => { bossDragonLavaLoaded = v },
      setSheetLoaded: (v) => { bossRedDragonSheetLoaded = v }
    }),
    getEnemyTextures: () => ({
      get wispImg() { return enemyWispImg },
      get wispLoaded() { return enemyWispLoaded },
      get wispSheetImg() { return enemyWispSheetImg },
      get wispSheetLoaded() { return enemyWispSheetLoaded },
      get bruteImg() { return enemyBruteImg },
      get bruteLoaded() { return enemyBruteLoaded },
      get bruteSheetImg() { return enemyBruteSheetImg },
      get bruteSheetLoaded() { return enemyBruteSheetLoaded },
      get frostBruteImg() { return enemyFrostBruteImg },
      get frostBruteLoaded() { return enemyFrostBruteLoaded },
      get frostBruteSheetImg() { return enemyFrostBruteSheetImg },
      get frostBruteSheetLoaded() { return enemyFrostBruteSheetLoaded },
      get frostCrystalImg() { return frostCrystalImg },
      get frostCrystalLoaded() { return frostCrystalLoaded },
      setWispLoaded: (v) => { enemyWispLoaded = v },
      setWispSheetLoaded: (v) => { enemyWispSheetLoaded = v },
      setBruteLoaded: (v) => { enemyBruteLoaded = v },
      setBruteSheetLoaded: (v) => { enemyBruteSheetLoaded = v },
      setFrostBruteLoaded: (v) => { enemyFrostBruteLoaded = v },
      setFrostBruteSheetLoaded: (v) => { enemyFrostBruteSheetLoaded = v },
      setFrostCrystalLoaded: (v) => { frostCrystalLoaded = v }
    }),
    getCorpseEmperorTextures: () => ({
      get skullSheetImg() { return bossCorpseSkullSheetImg },
      get skullSheetLoaded() { return bossCorpseSkullSheetLoaded },
      get triSkullSheetImg() { return bossCorpseTriSkullSheetImg },
      get triSkullSheetLoaded() { return bossCorpseTriSkullSheetLoaded },
      get armSheetImg() { return bossCorpseArmSheetImg },
      get armSheetLoaded() { return bossCorpseArmSheetLoaded },
      get knuckleImg() { return bossCorpseKnuckleImg },
      get knuckleLoaded() { return bossCorpseKnuckleLoaded },
      get ghostFireImg() { return bossCorpseGhostFireImg },
      get ghostFireLoaded() { return bossCorpseGhostFireLoaded },
      get poisonPoolImg() { return bossCorpsePoisonPoolImg },
      get poisonPoolLoaded() { return bossCorpsePoisonPoolLoaded },
      setSkullSheetLoaded: (v) => { bossCorpseSkullSheetLoaded = v },
      setTriSkullSheetLoaded: (v) => { bossCorpseTriSkullSheetLoaded = v },
      setArmSheetLoaded: (v) => { bossCorpseArmSheetLoaded = v },
      setKnuckleLoaded: (v) => { bossCorpseKnuckleLoaded = v },
      setGhostFireLoaded: (v) => { bossCorpseGhostFireLoaded = v },
      setPoisonPoolLoaded: (v) => { bossCorpsePoisonPoolLoaded = v }
    }),
    initCorpseEmperorArms,
    onCorpseEmperorArmDestroyed,
    fireCorpseKnuckleBarrage,
    fireCorpseSkullBreath,
    fireCorpseSkullSpikeBurst,
    fireCorpseGhostFire,
    fireTriSkullGiantGhostFire,
    updateCorpseEmperor,
    damageEnemy,
    drawBossProjectiles,
    drawBossAoEs,
    executeBarrageAttack,
    executeAoEAttack,
    getPlayerWeaponSheet,
    getPlayerWeaponTextures: () => ({
      get sheets() { return playerWeaponSheets },
      getSheet: (key) => playerWeaponSheets[key],
      setSheetLoaded: (key, v) => { if (playerWeaponSheets[key]) playerWeaponSheets[key].loaded = v }
    }),
    createEnemy,
    fireMagmaBarrage,
    fireFrostCrystalBarrage,
    updateBossProjectiles
  }
}

if (isHeadless) {
  showScreen('game')
} else {
  showScreen('title')
}
