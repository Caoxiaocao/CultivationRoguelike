/**
 * 帧捕获工具 —— 无需手动开游戏即可验证贴图/法宝的实装效果
 *
 * 在 Electron 离屏窗口中加载构建产物，驱动到「战斗中」画面，
 * 再把游戏画布导出成 PNG。用于抠底/配色/尺寸改动后的实装回归。
 *
 * 用法:
 *   npm run build
 *   npm run art:frame -- --char spell --weapon spell_fuchen --out shot.png
 *   npm run art:frame -- --char spell --weapon spell_bagua --screen char-select --out hall.png
 *
 * 参数:
 *   --char   角色 id (sword/spell/body/beast/formation/alchemist/demon/ghost)，默认 spell
 *   --weapon 起手法宝 id (如 spell_fuchen)，默认取该角色第一件
 *   --screen 截哪个界面：game=战斗内 #game（默认）；char-select=候选大厅
 *            二级界面「法宝环绕护体效果」的 #weapon-orbit-canvas
 *   --out    输出 PNG，默认 tools/_frame.png
 *   --wait   开始跑关后等待的毫秒数（让法宝绕行到可见角度），默认 1400
 *
 * 注意: 主角位于画布中心 (W/2, H/2)。要放大观察法宝细节，
 *       用 Python/Pillow 裁剪该区域即可，例如:
 *       Image.open(shot).crop((W//2-170, H//2-170, W//2+170, H//2+170)).resize(...)
 */
const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('headless')
app.commandLine.appendSwitch('no-sandbox')

function arg(name, dflt) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : dflt
}

const charId = arg('char', 'spell')
const weaponId = arg('weapon', null)
const screen = arg('screen', 'game')   // game | char-select
const outPath = path.resolve(arg('out', path.join(__dirname, '_frame.png')))
const waitMs = Number(arg('wait', 1400))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    // 关键：必须是 offscreen 渲染。
    //  - show:false 的普通窗口不会绘制，rAF 被 Chromium 节流：实测等 4s 游戏内只推进 0.17s，
    //    敌人根本来不及刷出，截不到任何战斗画面（backgroundThrottling:false 也救不了）。
    //  - show:true 在无交互桌面的环境里会直接卡住（实测挂起 5 分钟无输出）。
    //  offscreen 既不出窗口、又持续出帧，是唯一稳妥的取帧方式。
    show: false,
    width: 960,
    height: 540,
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  })
  win.webContents.setFrameRate(60)

  win.webContents.on('console-message', (e, lvl, msg) => {
    if (lvl >= 2) console.log('[renderer]', msg)
  })

  try {
    await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

    // 等构建产物挂上调试句柄
    for (let i = 0; i < 40; i++) {
      await sleep(200)
      const ready = await win.webContents.executeJavaScript('Boolean(window.__gameControls)')
      if (ready) break
    }

    const info = await win.webContents.executeJavaScript(`(() => {
      const C = window.__gameControls
      if (!C) return { error: 'window.__gameControls 未挂载，请先执行 npm run build' }
      const ci = C.characters.findIndex(c => c.id === ${JSON.stringify(charId)})
      if (ci < 0) return { error: '找不到角色 ' + ${JSON.stringify(charId)}, chars: C.characters.map(c => c.id) }
      const list = C.characters[ci].weapons || []
      const want = ${JSON.stringify(weaponId || '')}
      const wi = want ? list.findIndex(w => w.id === want) : 0
      if (wi < 0) return { error: '角色 ' + C.characters[ci].name + ' 没有法宝 ' + want, weapons: list.map(w => w.id) }
      C.setChar(ci, wi)
      if (${JSON.stringify(screen)} === 'char-select') {
        // 顺序很重要：showScreen('char-select') 内部会把 charSelectStep 重置为 1
        // 并重新渲染，所以必须先切屏、再切到二级界面，否则画布会被清掉。
        C.showScreen('char-select')
        C.setCharSelectStep(2)
      } else {
        C.startRunFromSelection()
      }
      return {
        char: C.characters[ci].name, charId: C.characters[ci].id,
        weapon: list[wi] && list[wi].name, weaponId: list[wi] && list[wi].id,
        screen: C.game && C.game.screen,
      }
    })()`)

    if (info.error) {
      console.error('FAIL:', info.error, info.chars || info.weapons || '')
      app.exit(1)
      return
    }
    console.log('角色:', info.char, `(${info.charId})`, '| 法宝:', info.weapon, `(${info.weaponId})`, '| 界面:', info.screen)

    await sleep(waitMs)

    // 打印运行时状态：便于判断"画面里没东西"是没刷出来还是没画出来
    const state = await win.webContents.executeJavaScript(`(() => {
      const g = window.__gameControls && window.__gameControls.game
      if (!g) return null
      return {
        screen: g.screen, paused: !!g.paused, elapsed: +(g.elapsed || 0).toFixed(2),
        stage: g.stage, enemies: (g.enemies || []).length, markers: (g.markers || []).length,
        kills: g.kills, specials: (g.specialAttacks || []).length,
        weapon: (g.player && g.player.weaponType) || '', attackTimer: +((g.player && g.player.attackTimer) || 0).toFixed(2),
      }
    })()`)
    if (state) {
      console.log(`状态: 界面=${state.screen} 暂停=${state.paused} 已运行=${state.elapsed}s 关卡=${state.stage} ` +
        `敌人=${state.enemies} 预兆=${state.markers} 击杀=${state.kills} 特殊攻击=${state.specials} ` +
        `法宝=${state.weapon} 出招计时=${state.attackTimer}`)
    }

    const canvasSel = screen === 'char-select' ? '#weapon-orbit-canvas' : '#game'
    const size = await win.webContents.executeJavaScript(`(() => {
      const c = document.querySelector(${JSON.stringify(canvasSel)})
      return c ? { w: c.width, h: c.height } : null
    })()`)
    if (!size || !size.w) {
      console.error(`FAIL: 找不到画布 ${canvasSel}`)
      app.exit(1)
      return
    }

    const dataUrl = await win.webContents.executeJavaScript(
      `document.querySelector(${JSON.stringify(canvasSel)}).toDataURL('image/png')`
    )
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'))
    console.log(`已导出: ${outPath}  (${size.w}x${size.h})`)
    console.log('提示: 主角位于画布中心，需要放大时用 Pillow 裁剪中心区域。')

    app.exit(0)
  } catch (err) {
    console.error('FAIL:', err && err.message ? err.message : err)
    app.exit(1)
  }
})
