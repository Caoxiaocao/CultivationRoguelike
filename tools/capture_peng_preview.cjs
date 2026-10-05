const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const previewPath = path.join(__dirname, 'preview_peng_sheets.html');
  await win.loadFile(previewPath);
  await new Promise(r => setTimeout(r, 1800));

  const img = await win.webContents.capturePage();
  const brainDir = 'C:/Users/Administrator/.gemini/antigravity/brain/bce5c981-c741-4fb6-b269-6bc282a5d487';
  const outPath = path.join(brainDir, 'peng_actions_preview_showcase.png');
  fs.writeFileSync(outPath, img.toPNG());
  console.log('Saved showcase:', outPath);
  app.quit();
});
