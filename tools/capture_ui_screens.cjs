const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('headless')
app.commandLine.appendSwitch('no-sandbox')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 720,
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  })
  win.webContents.setFrameRate(60)

  try {
    await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

    for (let i = 0; i < 40; i++) {
      await sleep(200)
      const ready = await win.webContents.executeJavaScript('Boolean(window.__gameControls)')
      if (ready) break
    }

    const outDir = path.join(__dirname, 'art_screenshots')
    fs.mkdirSync(outDir, { recursive: true })

    async function saveShot(name) {
      await sleep(300)
      const image = await win.webContents.capturePage()
      const filePath = path.join(outDir, `${name}.png`)
      fs.writeFileSync(filePath, image.toPNG())
      console.log(`Saved screenshot: ${filePath}`)
    }

    // 1. Title Screen
    await win.webContents.executeJavaScript(`(() => {
      window.__gameControls.showScreen('title')
    })()`)
    await saveShot('1_title_screen')

    // 2. Character Select Step 1
    await win.webContents.executeJavaScript(`(() => {
      window.__gameControls.showScreen('char-select')
      window.__gameControls.setCharSelectStep(1)
    })()`)
    await saveShot('2_char_select_step1')

    // 3. Character Select Step 2 (Weapon choice)
    await win.webContents.executeJavaScript(`(() => {
      window.__gameControls.setCharSelectStep(2)
    })()`)
    await saveShot('3_char_select_step2')

    // 4. Codex Screen (万象图鉴)
    await win.webContents.executeJavaScript(`(() => {
      window.__gameControls.showScreen('codex')
    })()`)
    await saveShot('4_codex_screen')

    // 5. In-Game Combat & HUD
    await win.webContents.executeJavaScript(`(() => {
      window.__gameControls.setChar(0, 0)
      window.__gameControls.startRunFromSelection()
      // Trigger boss telegraph banner for showcase
      if (window.__gameControls.showBossTelegraph) {
        window.__gameControls.showBossTelegraph('万骨噬魂阵', '九幽死气凝聚，幽冥黑洞即将撕裂！')
      }
    })()`)
    await sleep(600)
    await saveShot('5_combat_hud')

    // 6. Level Up Choice Modal (古籍线装秘籍折页三选一)
    const metrics = await win.webContents.executeJavaScript(`(() => {
      const C = window.__gameControls
      if (C) {
        const pool = C.cards || []
        const sampleCards = pool.slice(0, 3).map(c => ({ ...c }))
        C.game.settlement = {
          cards: sampleCards,
          chosen: null,
          loot: [
            { item: { name: '极品朱雀灵羽', type: '灵材', desc: '散发炽热真火气息的神禽之翎' }, keep: true },
            { item: { name: '万年温玉残片', type: '玉髓', desc: '滋养紫府，稳固道基之圣物' }, keep: true }
          ]
        }
        if (C.showStageOverlay) {
          C.showStageOverlay()
        }
        const overlay = document.querySelector('#stage-overlay')
        const container = document.querySelector('.stage-modal-container')
        const main = document.querySelector('.stage-modal-main')
        const sidebar = document.querySelector('.stage-modal-sidebar')
        const topSection = document.querySelector('.stage-top-section')
        const choices = document.querySelector('#stage-choices')
        const b = document.querySelector('.choice')
        return {
          windowInnerWidth: window.innerWidth,
          overlayWidth: overlay ? overlay.getBoundingClientRect().width : 0,
          containerWidth: container ? container.getBoundingClientRect().width : 0,
          mainWidth: main ? main.getBoundingClientRect().width : 0,
          sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : 0,
          topSectionWidth: topSection ? topSection.getBoundingClientRect().width : 0,
          choicesWidth: choices ? choices.getBoundingClientRect().width : 0,
          cardWidth: b ? b.getBoundingClientRect().width : 0,
        }
      }
      return null
    })()`)
    console.log('CHOICE CONTAINER SIZES:', JSON.stringify(metrics, null, 2))
    await sleep(400)
    await saveShot('6_levelup_choices')

    console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!')
    app.exit(0)
  } catch (err) {
    console.error('ERROR CAPTURING SCREENSHOTS:', err)
    app.exit(1)
  }
})
