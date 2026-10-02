const { app, BrowserWindow, Menu, globalShortcut } = require('electron')
const path = require('node:path')

// 单实例锁：防止玩家重复双击启动多个游戏窗口造成音效重叠
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    useContentSize: true,
    center: true,
    title: '问道 · 青冥秘境',
    backgroundColor: '#060b0e',
    autoHideMenuBar: true,
    show: false, // 准备好后再平滑呈现，杜绝白屏闪烁
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // 窗口失焦时保持 60FPS 仙道心法运转与音效平稳
      devTools: !app.isPackaged,
    },
  })

  // 移除原生应用菜单栏，呈现纯净单机游戏画境
  Menu.setApplicationMenu(null)

  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 资源渲染就绪后雅致浮现
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 快捷键支持：F11 切换全屏，Alt+Enter 切换全屏
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if (input.key === 'F11' || (input.key === 'Enter' && input.alt)) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen())
        event.preventDefault()
      }
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
