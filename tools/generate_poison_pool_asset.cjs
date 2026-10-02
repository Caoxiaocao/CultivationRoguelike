const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

// 原始 AI 出图目录：默认取仓库内归档 art-source/raw，可用环境变量 ART_SOURCE_DIR 覆盖。
// 原先硬编码 Antigravity 的绝对路径（C:/Users/Administrator/.gemini/...），换机器即失效。
const brainDir = (process.env.ART_SOURCE_DIR
  || path.join(__dirname, '..', 'art-source', 'raw')).replace(/\\/g, '/');
const poolArtPath = path.join(brainDir, 'corpse_poison_pool_art_1790850655543.jpg').replace(/\\/g, '/');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const tempHtml = path.join(__dirname, 'temp_pool_gen.html');
  const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: transparent; margin: 0;">
    <canvas id="cvs_pool" width="512" height="512"></canvas>
    <img id="img_pool" src="file:///${poolArtPath}" style="display:none;" />
  <script>
    function extractTransparentCanvas(sourceImg, targetW, targetH, padding = 16) {
      const srcW = sourceImg.naturalWidth || sourceImg.width;
      const srcH = sourceImg.naturalHeight || sourceImg.height;

      const tmpCvs = document.createElement('canvas');
      tmpCvs.width = srcW;
      tmpCvs.height = srcH;
      const tmpCtx = tmpCvs.getContext('2d');
      tmpCtx.drawImage(sourceImg, 0, 0);

      const imgData = tmpCtx.getImageData(0, 0, srcW, srcH);
      const data = imgData.data;
      const halfW = srcW / 2;
      const halfH = srcH / 2;
      const maxRadius = Math.min(halfW, halfH) * 0.95;

      for (let y = 0; y < srcH; y++) {
        for (let x = 0; x < srcW; x++) {
          const pi = (y * srcW + x) * 4;
          const r = data[pi], g = data[pi + 1], b = data[pi + 2];
          const minVal = Math.min(r, g, b);
          const maxVal = Math.max(r, g, b);
          const sat = maxVal - minVal;

          const dx = x - halfW;
          const dy = y - halfH;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // 四周边框清理
          if (x < 16 || x > srcW - 16 || y < 16 || y > srcH - 16) {
            if (minVal > 180 && sat < 30) {
              data[pi + 3] = 0;
              continue;
            }
          }

          let alpha = 1.0;
          if (minVal >= 238 && sat < 20) {
            alpha = 0;
          } else if (minVal >= 200 && sat < 30) {
            const satBonus = sat / 30;
            const whiteRatio = (minVal - 200) / 38;
            alpha = Math.max(0, (1 - whiteRatio) * 0.85 + satBonus * 0.4);
          } else {
            const whiteRatio = minVal / 255;
            if (whiteRatio > 0.85) {
              alpha = Math.max(0.2, 1 - (whiteRatio - 0.85) / 0.15 * 0.6);
            } else {
              alpha = 1.0;
            }
          }

          if (dist > maxRadius) {
            const edgeFade = Math.max(0, 1 - (dist - maxRadius) / (Math.min(halfW, halfH) - maxRadius));
            alpha *= edgeFade;
          }

          if (alpha <= 0.02) {
            data[pi + 3] = 0;
          } else {
            data[pi + 3] = Math.round(alpha * 255);
            if (alpha < 0.98) {
              const a = alpha;
              data[pi] = Math.min(255, Math.max(0, Math.round((r - (1 - a) * 255) / a)));
              data[pi + 1] = Math.min(255, Math.max(0, Math.round((g - (1 - a) * 255) / a)));
              data[pi + 2] = Math.min(255, Math.max(0, Math.round((b - (1 - a) * 255) / a)));
            }
          }
        }
      }

      tmpCtx.putImageData(imgData, 0, 0);

      // 计算包围盒
      let minX = srcW, maxX = 0, minY = srcH, maxY = 0;
      for (let y = 0; y < srcH; y++) {
        for (let x = 0; x < srcW; x++) {
          const a = data[(y * srcW + x) * 4 + 3];
          if (a > 15) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (minX > maxX) { minX = 0; maxX = srcW; minY = 0; maxY = srcH; }

      const bboxW = Math.max(1, maxX - minX + 1);
      const bboxH = Math.max(1, maxY - minY + 1);

      const outCvs = document.createElement('canvas');
      outCvs.width = targetW;
      outCvs.height = targetH;
      const outCtx = outCvs.getContext('2d');

      const maxDim = Math.max(bboxW, bboxH);
      const availableSize = Math.min(targetW, targetH) - padding * 2;
      const scale = availableSize / maxDim;

      const drawW = bboxW * scale;
      const drawH = bboxH * scale;
      const drawX = (targetW - drawW) / 2;
      const drawY = (targetH - drawH) / 2;

      outCtx.drawImage(tmpCvs, minX, minY, bboxW, bboxH, drawX, drawY, drawW, drawH);
      return outCvs;
    }

    document.getElementById('img_pool').onload = () => {
      const img = document.getElementById('img_pool');
      const cvs = document.getElementById('cvs_pool');
      const ctx = cvs.getContext('2d');
      ctx.clearRect(0, 0, 512, 512);

      const trans = extractTransparentCanvas(img, 512, 512, 16);
      ctx.drawImage(trans, 0, 0);

      window.__poolBase64 = cvs.toDataURL('image/png');
      window.__ready = true;
    };
  </script>
  </body>
  </html>`;

  fs.writeFileSync(tempHtml, html, 'utf8');
  await win.loadFile(tempHtml);

  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    const ready = await win.webContents.executeJavaScript('window.__ready');
    if (ready) break;
  }

  const b64 = await win.webContents.executeJavaScript('window.__poolBase64');
  if (!b64) {
    console.error('Failed to generate poison pool image');
    process.exit(1);
  }

  const cleanB64 = b64.replace(/^data:image\/png;base64,/, '');
  const outPath = path.join(__dirname, '..', 'public', 'effect_corpse_poison_pool.png');

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      fs.writeFileSync(outPath, cleanB64, 'base64');
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 250));
    }
  }

  const stat = fs.statSync(outPath);
  console.log(`Successfully generated effect_corpse_poison_pool.png (${stat.size} bytes)!`);
  try { fs.unlinkSync(tempHtml); } catch (e) {}
  app.quit();
});
