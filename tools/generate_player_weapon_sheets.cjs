const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

// 原始 AI 出图目录：默认取仓库内归档 art-source/raw，可用环境变量 ART_SOURCE_DIR 覆盖。
// 原先硬编码 Antigravity 的绝对路径（C:/Users/Administrator/.gemini/...），换机器即失效。
const brainDir = (process.env.ART_SOURCE_DIR
  || path.join(__dirname, '..', 'art-source', 'raw')).replace(/\\/g, '/');
const publicDir = path.resolve('public');

const weapons = [
  {
    id: 'sword_qingfeng',
    inputFile: path.join(brainDir, 'lingxuzi_q_qingfeng_1790926930102.jpg').replace(/\\/g, '/'),
    outputFile: path.join(publicDir, 'player_sword_qingfeng_sheet.png')
  },
  {
    id: 'sword_jifeng',
    inputFile: path.join(brainDir, 'lingxuzi_q_jifeng_1790926948735.jpg').replace(/\\/g, '/'),
    outputFile: path.join(publicDir, 'player_sword_jifeng_sheet.png')
  },
  {
    id: 'sword_benlei',
    inputFile: path.join(brainDir, 'lingxuzi_q_benlei_1790926967859.jpg').replace(/\\/g, '/'),
    outputFile: path.join(publicDir, 'player_sword_benlei_sheet.png')
  }
];

app.whenReady().then(async () => {
  const { ipcMain } = require('electron');
  ipcMain.on('done', (event, res) => {
    console.log('SUCCESS:', res);
    app.quit();
  });
  ipcMain.on('error', (event, err) => {
    console.error('RENDERER ERROR:', err);
    app.quit();
  });

  const win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  win.webContents.on('console-message', (e, lvl, msg) => {
    console.log('[RENDERER]', msg);
  });

  const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: transparent; margin: 0;">
    <script>
      const fs = require('fs');
      const path = require('path');
      const brainDir = '${brainDir}';

      async function processAll() {
        const weapons = ${JSON.stringify(weapons)};
        const results = [];

        for (const w of weapons) {
          const img = new Image();
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = 'file:///' + w.inputFile;
          });

          const srcW = img.naturalWidth || 1376;
          const srcH = img.naturalHeight || 768;
          const midY = Math.round(srcH / 2);

          // 1. Draw full image into canvas
          const fullCvs = document.createElement('canvas');
          fullCvs.width = srcW;
          fullCvs.height = srcH;
          const fullCtx = fullCvs.getContext('2d');
          fullCtx.drawImage(img, 0, 0);

          const imgData = fullCtx.getImageData(0, 0, srcW, srcH);
          const d = imgData.data;

          // 2. Global flood fill background from borders
          const visited = new Uint8Array(srcW * srcH);
          const queue = [];

          function isBgPixel(x, y) {
            const idx = (y * srcW + x) * 4;
            const red = d[idx], green = d[idx + 1], blue = d[idx + 2];
            const minVal = Math.min(red, green, blue);
            const maxVal = Math.max(red, green, blue);
            const sat = maxVal - minVal;
            // Ignore text label at bottom-left corner of image if any
            if (y > srcH - 40 && x < 400 && minVal < 100) return true;
            return minVal >= 210 && sat < 32;
          }

          // Enqueue borders
          for (let x = 0; x < srcW; x++) {
            if (isBgPixel(x, 0)) { queue.push(x); visited[x] = 1; }
            if (isBgPixel(x, srcH - 1)) { queue.push((srcH - 1) * srcW + x); visited[(srcH - 1) * srcW + x] = 1; }
          }
          for (let y = 0; y < srcH; y++) {
            if (isBgPixel(0, y)) { queue.push(y * srcW); visited[y * srcW] = 1; }
            if (isBgPixel(srcW - 1, y)) { queue.push(y * srcW + (srcW - 1)); visited[y * srcW + (srcW - 1)] = 1; }
          }

          let head = 0;
          while (head < queue.length) {
            const pos = queue[head++];
            const px = pos % srcW;
            const py = Math.floor(pos / srcW);

            const nbors = [
              [px + 1, py],
              [px - 1, py],
              [px, py + 1],
              [px, py - 1]
            ];

            for (let k = 0; k < 4; k++) {
              const nx = nbors[k][0];
              const ny = nbors[k][1];
              if (nx >= 0 && nx < srcW && ny >= 0 && ny < srcH) {
                const nPos = ny * srcW + nx;
                if (!visited[nPos] && isBgPixel(nx, ny)) {
                  visited[nPos] = 1;
                  queue.push(nPos);
                }
              }
            }
          }

          // Apply transparency
          for (let y = 0; y < srcH; y++) {
            for (let x = 0; x < srcW; x++) {
              const idx = (y * srcW + x) * 4;
              const pos = y * srcW + x;
              const red = d[idx], green = d[idx + 1], blue = d[idx + 2];
              const minVal = Math.min(red, green, blue);
              const sat = Math.max(red, green, blue) - minVal;

              // Filter out text watermark in bottom left
              if (y > srcH - 48 && x < 650) {
                d[idx + 3] = 0;
                continue;
              }

              // Filter out tiny divider dots near middle line
              if (Math.abs(y - midY) <= 3 && minVal < 100) {
                d[idx + 3] = 0;
                continue;
              }

              if (visited[pos]) {
                d[idx + 3] = 0;
              } else {

                let isNearBg = false;
                for (let dy = -2; dy <= 2; dy++) {
                  for (let dx = -2; dx <= 2; dx++) {
                    const qx = x + dx, qy = y + dy;
                    if (qx >= 0 && qx < srcW && qy >= 0 && qy < srcH) {
                      if (visited[qy * srcW + qx]) { isNearBg = true; break; }
                    }
                  }
                  if (isNearBg) break;
                }

                if (isNearBg && minVal > 195 && sat < 35) {
                  const alpha = Math.max(0, 1 - (minVal - 195) / 60);
                  d[idx + 3] = Math.round(alpha * 255);
                }
              }
            }
          }

          fullCtx.putImageData(imgData, 0, 0);

          // 3. Extract 6 frames (3 in top row, 3 in bottom row)
          const rowRanges = [
            { yStart: 10, yEnd: midY - 5 },
            { yStart: midY + 5, yEnd: srcH - 10 }
          ];

          const frames = [];

          for (let r = 0; r < 2; r++) {
            const { yStart, yEnd } = rowRanges[r];

            // Compute horizontal density
            const colDensity = new Array(srcW).fill(0);
            for (let y = yStart; y <= yEnd; y++) {
              for (let x = 0; x < srcW; x++) {
                if (d[(y * srcW + x) * 4 + 3] > 20) {
                  colDensity[x]++;
                }
              }
            }

            // Find 3 contiguous spans of non-zero density
            // Smooth slightly with window of 5
            const smoothed = new Array(srcW).fill(0);
            for (let x = 0; x < srcW; x++) {
              let s = 0, c = 0;
              for (let dx = -4; dx <= 4; dx++) {
                if (x + dx >= 0 && x + dx < srcW) { s += colDensity[x + dx]; c++; }
              }
              smoothed[x] = s / c;
            }

            // Find spans where smoothed > 1
            const spans = [];
            let inSpan = false;
            let spanStart = 0;
            for (let x = 0; x < srcW; x++) {
              if (smoothed[x] > 1) {
                if (!inSpan) { inSpan = true; spanStart = x; }
              } else {
                if (inSpan) {
                  inSpan = false;
                  if (x - spanStart > 40) { // filter out noise
                    spans.push({ start: spanStart, end: x });
                  }
                }
              }
            }
            if (inSpan && srcW - spanStart > 40) {
              spans.push({ start: spanStart, end: srcW - 1 });
            }

            // If we have more than 3 spans, merge small gaps
            while (spans.length > 3) {
              let minGap = Infinity, minIdx = 0;
              for (let i = 0; i < spans.length - 1; i++) {
                const gap = spans[i + 1].start - spans[i].end;
                if (gap < minGap) { minGap = gap; minIdx = i; }
              }
              spans[minIdx].end = spans[minIdx + 1].end;
              spans.splice(minIdx + 1, 1);
            }

            // If less than 3 spans, fallback to dividing thirds
            if (spans.length < 3) {
              const thirdW = srcW / 3;
              spans.length = 0;
              spans.push({ start: 0, end: Math.round(thirdW) });
              spans.push({ start: Math.round(thirdW), end: Math.round(thirdW * 2) });
              spans.push({ start: Math.round(thirdW * 2), end: srcW - 1 });
            }

            // For each of the 3 spans, find precise bounding box
            for (let s = 0; s < 3; s++) {
              const sp = spans[s];
              let minX = sp.end, maxX = sp.start, minY = yEnd, maxY = yStart;
              for (let y = yStart; y <= yEnd; y++) {
                for (let x = sp.start; x <= sp.end; x++) {
                  if (d[(y * srcW + x) * 4 + 3] > 20) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                  }
                }
              }

              if (maxX > minX && maxY > minY) {
                frames.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
              } else {
                frames.push({ x: sp.start, y: yStart, w: sp.end - sp.start + 1, h: yEnd - yStart + 1 });
              }
            }
          }

          // 4. Draw the 6 frames into target spritesheet: 3 columns x 2 rows, 180x180 per frame -> 540 x 360
          const frameW = 180;
          const frameH = 180;
          const outW = 540;
          const outH = 360;

          const outCvs = document.createElement('canvas');
          outCvs.width = outW;
          outCvs.height = outH;
          const outCtx = outCvs.getContext('2d');

          for (let i = 0; i < 6; i++) {
            const fr = frames[i] || frames[frames.length - 1];
            const col = i % 3;
            const row = Math.floor(i / 3);
            const dstX = col * frameW;
            const dstY = row * frameH;

            // Scale to fit within 155x155
            const maxDim = Math.max(fr.w, fr.h);
            const scale = Math.min(1.0, 155 / (maxDim || 1));
            const drawW = fr.w * scale;
            const drawH = fr.h * scale;

            const placeX = dstX + (frameW - drawW) / 2;
            const placeY = dstY + (frameH - drawH) / 2;

            outCtx.drawImage(fullCvs, fr.x, fr.y, fr.w, fr.h, placeX, placeY, drawW, drawH);
          }

          // Save outCvs to w.outputFile
          const dataUrl = outCvs.toDataURL('image/png');
          const base64 = dataUrl.replace(/^data:image\\/png;base64,/, '');
          const buf = Buffer.from(base64, 'base64');
          fs.writeFileSync(w.outputFile, buf);

          // Also copy to brainDir
          const brainDst = path.join(brainDir, path.basename(w.outputFile));
          fs.writeFileSync(brainDst, buf);

          results.push({ id: w.id, size: buf.length, file: w.outputFile });
        }

        return results;
      }

      const { ipcRenderer } = require('electron');
      processAll().then(res => {
        console.log('ALL DONE:', JSON.stringify(res));
        ipcRenderer.send('done', res);
      }).catch(err => {
        console.error('ERROR:', err);
        ipcRenderer.send('error', err ? err.stack || err.message : 'Unknown error');
      });
    </script>
  </body>
  </html>`;

  const tempHtml = path.join(__dirname, 'temp_gen_player_sheets.html');
  fs.writeFileSync(tempHtml, html);
  win.loadURL('file:///' + tempHtml.replace(/\\/g, '/'));
});
