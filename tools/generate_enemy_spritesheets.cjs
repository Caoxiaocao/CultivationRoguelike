const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const wispImgPath = path.resolve(__dirname, '..', 'public', 'enemy_wisp.png').replace(/\\/g, '/');
  const bruteImgPath = path.resolve(__dirname, '..', 'public', 'enemy_brute.png').replace(/\\/g, '/');

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background: transparent; margin: 0;">
  <canvas id="cvs_wisp" width="640" height="320"></canvas>
  <canvas id="cvs_brute" width="720" height="360"></canvas>
  <img id="img_wisp" src="file:///${wispImgPath}" style="display:none;" />
  <img id="img_brute" src="file:///${bruteImgPath}" style="display:none;" />
<script>
  let loadedCount = 0;
  function onImgLoad() {
    loadedCount++;
    if (loadedCount >= 2) {
      setTimeout(startGen, 100);
    }
  }
  document.getElementById('img_wisp').onload = onImgLoad;
  document.getElementById('img_brute').onload = onImgLoad;

  function startGen() {
    generateWispSheet();
    generateBruteSheet();
    window.__sheetsReady = true;
  }

  function generateWispSheet() {
    const img = document.getElementById('img_wisp');
    const cvs = document.getElementById('cvs_wisp');
    const ctx = cvs.getContext('2d');

    const cols = 4;
    const rows = 2;
    const totalFrames = 8;
    const frameW = 160;
    const frameH = 160;

    ctx.clearRect(0, 0, 640, 320);

    const emberSeeds = [];
    for (let i = 0; i < 12; i++) {
      emberSeeds.push({
        rx: 34 + (i % 3) * 12,
        ry: 42 + ((i * 2) % 3) * 10,
        tilt: -0.22 + ((i % 4) - 1.5) * 0.15,
        phaseOffset: (i / 12) * Math.PI * 2,
        speedMult: (i % 2 === 0 ? 1 : -1) * (1 + (i % 3) * 0.2),
        size: 1.2 + (i % 3) * 0.9,
        colorType: i % 3
      });
    }

    for (let f = 0; f < totalFrames; f++) {
      const col = f % cols;
      const row = Math.floor(f / cols);
      const cellX = col * frameW;
      const cellY = row * frameH;
      const cx = cellX + frameW / 2;
      const cy = cellY + frameH / 2;

      const theta = (f / totalFrames) * Math.PI * 2;

      ctx.save();

      // 1. 底层幽火灵光晕
      const auraPulse = Math.sin(theta) * 0.15;
      const auraGrad = ctx.createRadialGradient(cx, cy + 8, 10, cx, cy + 8, 58 + auraPulse * 12);
      auraGrad.addColorStop(0, 'rgba(80, 245, 205, 0.26)');
      auraGrad.addColorStop(0.45, 'rgba(42, 180, 155, 0.14)');
      auraGrad.addColorStop(0.8, 'rgba(15, 110, 95, 0.05)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy + 8, 58 + auraPulse * 12, 0, Math.PI * 2);
      ctx.fill();

      // 2. 灵体浮动与呼吸波浪切片形变
      const hoverY = Math.sin(theta) * 4.5;
      const tilt = Math.cos(theta) * 0.035;

      ctx.save();
      ctx.translate(cx, cy + hoverY);
      ctx.rotate(tilt);
      ctx.translate(-cx, -(cy + hoverY));

      const numSlices = 32;
      const sliceH = frameH / numSlices;
      const breathScaleY = 1.0 + Math.sin(theta) * 0.025;
      const breathScaleX = 1.0 - Math.sin(theta) * 0.015;

      for (let s = 0; s < numSlices; s++) {
        const sy = s * sliceH;
        const isTail = s >= 14;
        const tailFactor = isTail ? Math.pow((s - 13) / 19, 1.6) : (s / 14) * 0.2;
        const wavePhase = theta - s * 0.16;
        const dx = Math.sin(wavePhase) * (tailFactor * 7.5);
        const dy = Math.cos(theta * 1.3 - s * 0.06) * 1.2;

        const destW = frameW * breathScaleX;
        const destX = cellX + dx + (frameW - destW) / 2;
        const destY = cellY + sy * breathScaleY + dy + hoverY;

        const srcSliceH = 1024 / numSlices;
        ctx.drawImage(
          img,
          0, s * srcSliceH, 1024, srcSliceH,
          destX, destY, destW, sliceH * breathScaleY + 0.5
        );
      }
      ctx.restore();

      // 3. 动态灵火特效层
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // A. 发冠尖端飘动焰舌
      const crestX = cx + Math.sin(theta) * 1.2;
      const crestY = cy - 42 + hoverY;
      for (let m = 0; m < 3; m++) {
        const flameAng = -Math.PI * 0.5 + (m - 1) * 0.28 + Math.sin(theta + m) * 0.15;
        const flameLen = 14 + Math.sin(theta * 2 + m * 1.4) * 5 + (m % 2) * 3;
        const grad = ctx.createLinearGradient(crestX, crestY, crestX + Math.cos(flameAng) * flameLen, crestY + Math.sin(flameAng) * flameLen);
        grad.addColorStop(0, 'rgba(230, 255, 245, 0.85)');
        grad.addColorStop(0.4, 'rgba(100, 245, 210, 0.65)');
        grad.addColorStop(0.8, 'rgba(40, 180, 150, 0.3)');
        grad.addColorStop(1, 'rgba(0, 120, 100, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(crestX + (m - 1) * 4, crestY);
        const cpX = crestX + Math.cos(flameAng - 0.15) * (flameLen * 0.6);
        const cpY = crestY + Math.sin(flameAng - 0.15) * (flameLen * 0.6);
        const endX = crestX + Math.cos(flameAng) * flameLen;
        const endY = crestY + Math.sin(flameAng) * flameLen;
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.quadraticCurveTo(cpX - 3, cpY + 2, crestX + m * 4, crestY + 2);
        ctx.closePath();
        ctx.fill();
      }

      // B. 灵眸流光脉动与星芒
      const eyePulse = 0.5 + 0.5 * Math.sin(theta);
      const leftEyeX = cx - 18 + Math.sin(theta) * 0.8;
      const leftEyeY = cy - 5 + hoverY;
      const rightEyeX = cx + 8 + Math.sin(theta) * 0.8;
      const rightEyeY = cy - 8 + hoverY;

      for (const [ex, ey] of [[leftEyeX, leftEyeY], [rightEyeX, rightEyeY]]) {
        const eyeGrad = ctx.createRadialGradient(ex, ey, 1, ex, ey, 5 + eyePulse * 3);
        eyeGrad.addColorStop(0, 'rgba(240, 255, 250, 0.9)');
        eyeGrad.addColorStop(0.4, 'rgba(120, 255, 220, 0.7)');
        eyeGrad.addColorStop(1, 'rgba(40, 200, 170, 0)');
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(ex, ey, 5 + eyePulse * 3, 0, Math.PI * 2);
        ctx.fill();

        if (f === 2 || f === 3) {
          const slen = (f === 2 ? 6 : 4.5);
          ctx.strokeStyle = 'rgba(235, 255, 250, 0.85)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(ex - slen, ey);
          ctx.lineTo(ex + slen, ey);
          ctx.moveTo(ex, ey - slen);
          ctx.lineTo(ex, ey + slen);
          ctx.stroke();
        }
      }

      // C. 12 颗环绕无缝灵火碎屑
      for (const seed of emberSeeds) {
        const curAng = seed.phaseOffset + theta * seed.speedMult;
        const cosT = Math.cos(seed.tilt);
        const sinT = Math.sin(seed.tilt);
        const rawX = Math.cos(curAng) * seed.rx;
        const rawY = Math.sin(curAng) * seed.ry;

        const px = cx + (rawX * cosT - rawY * sinT);
        const py = cy + hoverY * 0.5 + (rawX * sinT + rawY * cosT);

        const pGrad = ctx.createRadialGradient(px, py, 0, px, py, seed.size * 2);
        if (seed.colorType === 0) {
          pGrad.addColorStop(0, 'rgba(230, 255, 245, 0.95)');
          pGrad.addColorStop(0.5, 'rgba(100, 240, 200, 0.65)');
          pGrad.addColorStop(1, 'rgba(30, 160, 130, 0)');
        } else if (seed.colorType === 1) {
          pGrad.addColorStop(0, 'rgba(160, 255, 220, 0.9)');
          pGrad.addColorStop(0.6, 'rgba(40, 200, 150, 0.5)');
          pGrad.addColorStop(1, 'rgba(10, 120, 90, 0)');
        } else {
          pGrad.addColorStop(0, 'rgba(255, 245, 180, 0.95)');
          pGrad.addColorStop(0.5, 'rgba(255, 200, 80, 0.6)');
          pGrad.addColorStop(1, 'rgba(200, 120, 20, 0)');
        }
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, seed.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.restore();
    }

    window.__wispSheetBase64 = cvs.toDataURL('image/png');
  }

  function generateBruteSheet() {
    const img = document.getElementById('img_brute');
    const cvs = document.getElementById('cvs_brute');
    const ctx = cvs.getContext('2d');

    const cols = 4;
    const rows = 2;
    const totalFrames = 8;
    const frameW = 180;
    const frameH = 180;

    ctx.clearRect(0, 0, 720, 360);

    const emberSeeds = [];
    for (let i = 0; i < 14; i++) {
      emberSeeds.push({
        originX: -35 + (i * 12) % 75,
        originY: -20 + ((i * 7) % 50),
        driftAmp: 4 + (i % 3) * 3,
        riseSpeed: 28 + (i % 4) * 8,
        phaseOffset: (i / 14),
        size: 1.3 + (i % 3) * 0.9,
        colorType: i % 3
      });
    }

    for (let f = 0; f < totalFrames; f++) {
      const col = f % cols;
      const row = Math.floor(f / cols);
      const cellX = col * frameW;
      const cellY = row * frameH;
      const cx = cellX + frameW / 2;
      const cy = cellY + frameH / 2;

      const theta = (f / totalFrames) * Math.PI * 2;

      ctx.save();

      // 1. 地面深沉投影与熔岩热能光环
      const stompDip = Math.abs(Math.sin(theta)) * 2.8;
      const swayX = Math.sin(theta) * 2.2;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 12, 18, 0.42)';
      ctx.beginPath();
      ctx.ellipse(cx + swayX * 0.6, cy + 62, 48, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      const groundHeat = ctx.createRadialGradient(cx + swayX * 0.5, cy + 54, 4, cx + swayX * 0.5, cy + 54, 38);
      groundHeat.addColorStop(0, 'rgba(255, 80, 10, 0.22)');
      groundHeat.addColorStop(0.6, 'rgba(180, 30, 0, 0.09)');
      groundHeat.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = groundHeat;
      ctx.beginPath();
      ctx.ellipse(cx + swayX * 0.5, cy + 54, 38, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. 四足走步与骨骼律动微切片形变
      const numSlices = 36;
      const sliceH = frameH / numSlices;
      const breathScaleY = 1.0 + Math.sin(theta) * 0.022;
      const breathScaleX = 1.0 - Math.sin(theta) * 0.012;

      for (let s = 0; s < numSlices; s++) {
        const sy = s * sliceH;
        let sliceDx = swayX;
        let sliceDy = stompDip;

        if (s >= 24) {
          const footPhase = theta + (s >= 30 ? 0.3 : 0);
          sliceDx += Math.sin(footPhase) * 2.4;
          sliceDy += Math.sin(footPhase * 2) * 1.2;
        } else if (s <= 10) {
          sliceDx += Math.sin(theta * 0.8) * 1.2;
          sliceDy += Math.cos(theta) * 1.0;
        }

        const destW = frameW * breathScaleX;
        const destX = cellX + sliceDx + (frameW - destW) / 2;
        const destY = cellY + sy * breathScaleY + sliceDy;

        const srcSliceH = 1024 / numSlices;
        ctx.drawImage(
          img,
          0, s * srcSliceH, 1024, srcSliceH,
          destX, destY, destW, sliceH * breathScaleY + 0.5
        );
      }

      // 3. 加色混合层
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const hornPulse = 0.5 + 0.5 * Math.sin(theta);
      const horns = [
        { x: cx - 46 + swayX, y: cy - 42 + stompDip, r: 16 },
        { x: cx - 10 + swayX, y: cy - 44 + stompDip, r: 14 }
      ];

      for (const h of horns) {
        const hGrad = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, h.r + hornPulse * 5);
        hGrad.addColorStop(0, 'rgba(255, 250, 200, 0.9)');
        hGrad.addColorStop(0.35, 'rgba(255, 120, 20, 0.7)');
        hGrad.addColorStop(0.7, 'rgba(210, 40, 10, 0.35)');
        hGrad.addColorStop(1, 'rgba(150, 10, 0, 0)');
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r + hornPulse * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      const eyeX = cx - 28 + swayX;
      const eyeY = cy - 6 + stompDip;
      const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 1, eyeX, eyeY, 6 + hornPulse * 3);
      eyeGrad.addColorStop(0, 'rgba(255, 255, 220, 0.95)');
      eyeGrad.addColorStop(0.4, 'rgba(255, 180, 30, 0.75)');
      eyeGrad.addColorStop(1, 'rgba(200, 50, 0, 0)');
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 6 + hornPulse * 3, 0, Math.PI * 2);
      ctx.fill();

      const tailX = cx + 56 + Math.cos(theta - 1.0) * 3.5;
      const tailY = cy - 26 + stompDip + Math.sin(theta - 1.0) * 3.0;
      const tailGrad = ctx.createRadialGradient(tailX, tailY, 2, tailX, tailY, 15 + Math.sin(theta * 2) * 4);
      tailGrad.addColorStop(0, 'rgba(255, 240, 180, 0.9)');
      tailGrad.addColorStop(0.4, 'rgba(255, 110, 10, 0.7)');
      tailGrad.addColorStop(0.8, 'rgba(180, 20, 0, 0.3)');
      tailGrad.addColorStop(1, 'rgba(100, 0, 0, 0)');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.arc(tailX, tailY, 15 + Math.sin(theta * 2) * 4, 0, Math.PI * 2);
      ctx.fill();

      for (const seed of emberSeeds) {
        const prog = ((f / totalFrames) + seed.phaseOffset) % 1.0;
        const px = cx + seed.originX + swayX + Math.sin(prog * Math.PI * 2 + seed.phaseOffset * 5) * seed.driftAmp;
        const py = cy + seed.originY + stompDip - prog * seed.riseSpeed;
        const alpha = Math.sin(prog * Math.PI);

        const pGrad = ctx.createRadialGradient(px, py, 0, px, py, seed.size * 2);
        if (seed.colorType === 0) {
          pGrad.addColorStop(0, 'rgba(255, 255, 200, ' + (alpha * 0.95) + ')');
          pGrad.addColorStop(0.5, 'rgba(255, 180, 40, ' + (alpha * 0.65) + ')');
          pGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');
        } else if (seed.colorType === 1) {
          pGrad.addColorStop(0, 'rgba(255, 180, 60, ' + (alpha * 0.9) + ')');
          pGrad.addColorStop(0.6, 'rgba(220, 60, 10, ' + (alpha * 0.55) + ')');
          pGrad.addColorStop(1, 'rgba(160, 20, 0, 0)');
        } else {
          pGrad.addColorStop(0, 'rgba(255, 130, 80, ' + (alpha * 0.85) + ')');
          pGrad.addColorStop(0.6, 'rgba(180, 30, 20, ' + (alpha * 0.45) + ')');
          pGrad.addColorStop(1, 'rgba(100, 10, 10, 0)');
        }
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, seed.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.restore();
    }

    window.__bruteSheetBase64 = cvs.toDataURL('image/png');
  }
</script>
</body>
</html>`;

  const tmpHtmlPath = path.join(__dirname, 'temp_spritesheet_gen.html');
  fs.writeFileSync(tmpHtmlPath, htmlContent, 'utf8');

  await win.loadFile(tmpHtmlPath);

  // 等待渲染生成
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    ready = await win.webContents.executeJavaScript('window.__sheetsReady || false');
    if (ready) break;
  }

  if (!ready) {
    console.error('Timed out waiting for sheets to be ready');
    process.exit(1);
  }

  const wispBase64Out = await win.webContents.executeJavaScript('window.__wispSheetBase64');
  const bruteBase64Out = await win.webContents.executeJavaScript('window.__bruteSheetBase64');

  try { fs.unlinkSync(tmpHtmlPath); } catch (e) {}

  if (!wispBase64Out || !bruteBase64Out) {
    console.error('Failed to get generated sheets base64');
    process.exit(1);
  }

  const cleanWisp = wispBase64Out.replace(/^data:image\/png;base64,/, '');
  const outWispPath = path.join(__dirname, '..', 'public', 'enemy_wisp_sheet.png');
  fs.writeFileSync(outWispPath, cleanWisp, 'base64');

  const cleanBrute = bruteBase64Out.replace(/^data:image\/png;base64,/, '');
  const outBrutePath = path.join(__dirname, '..', 'public', 'enemy_brute_sheet.png');
  fs.writeFileSync(outBrutePath, cleanBrute, 'base64');

  console.log('Successfully generated enemy_wisp_sheet.png! Size:', fs.statSync(outWispPath).size);
  console.log('Successfully generated enemy_brute_sheet.png! Size:', fs.statSync(outBrutePath).size);

  app.quit();
});
