const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const baseImgPath = path.join(__dirname, '..', 'public', 'boss_red_dragon.png');
  const baseImgData = fs.readFileSync(baseImgPath).toString('base64');

  const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: transparent; margin: 0;">
    <canvas id="cvs_sheet" width="720" height="360"></canvas>
    <img id="base_dragon" src="data:image/png;base64,${baseImgData}" style="display:none;" />
  <script>
    window.addEventListener('load', () => {
      const img = document.getElementById('base_dragon');
      const cvs = document.getElementById('cvs_sheet');
      const ctx = cvs.getContext('2d');

      const cols = 4;
      const rows = 2;
      const totalFrames = 8;
      const frameW = 180;
      const frameH = 180;

      ctx.clearRect(0, 0, 720, 360);

      // 预生成 18 颗环绕龙身的无缝闭环火星 (Seamless Looping Embers)
      const emberSeeds = [];
      for (let i = 0; i < 18; i++) {
        emberSeeds.push({
          orbitRx: 52 + (i % 4) * 16,
          orbitRy: 46 + ((i * 3) % 4) * 14,
          tilt: -0.28 + ((i % 5) - 2) * 0.12,
          phaseOffset: (i / 18) * Math.PI * 2,
          speedMult: (i % 2 === 0 ? 1 : -1) * (1 + (i % 3) * 0.25),
          size: 1.4 + (i % 3) * 1.1,
          colorType: i % 3 // 0: gold, 1: flame orange, 2: crimson
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

        // 1. 底层龙煞灵气光晕 (Aura Underlay)
        const auraPulse = Math.sin(theta) * 0.12;
        const auraGrad = ctx.createRadialGradient(cx - 5, cy, 18, cx - 5, cy, 76 + auraPulse * 15);
        auraGrad.addColorStop(0, 'rgba(255, 80, 20, 0.28)');
        auraGrad.addColorStop(0.45, 'rgba(210, 30, 20, 0.16)');
        auraGrad.addColorStop(0.75, 'rgba(160, 10, 30, 0.08)');
        auraGrad.addColorStop(1, 'rgba(100, 0, 10, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx - 5, cy, 76 + auraPulse * 15, 0, Math.PI * 2);
        ctx.fill();

        // 2. 龙躯骨骼波浪律动分片形变 (Serpentine Slicing Wave Deformation)
        // 将 180 高度拆分为 36 组微切片，按游龙行云流水波浪进行平滑正弦位移
        const numSlices = 36;
        const sliceH = frameH / numSlices;

        for (let s = 0; s < numSlices; s++) {
          const sy = s * sliceH;
          const sliceCenterNormY = (sy + sliceH / 2 - 90) / 90; // -1.0 到 1.0

          // 龙首 (顶部) 保持相对威严稳定，中段龙腹与下段龙尾摆动幅度加大
          const waveAmp = (s < 12) ? 1.5 + (s / 12) * 2.0 : 4.5 + Math.sin(s * 0.18) * 3.0;
          const waveFreq = 0.052;
          const wavePhase = theta - sy * waveFreq;

          const dx = Math.sin(wavePhase) * waveAmp;
          const dy = Math.cos(theta * 1.5 - sy * 0.03) * 1.8;

          // 胸腔呼吸缩放 (Chest & Lung Expansion)
          const breathScale = 1.0 + Math.sin(theta) * (s >= 10 && s <= 24 ? 0.035 : 0.012);

          const destW = frameW * breathScale;
          const destX = cellX + dx + (frameW - destW) / 2;
          const destY = cellY + sy + dy;

          ctx.drawImage(
            img,
            0, sy, frameW, sliceH,
            destX, destY, destW, sliceH + 0.4
          );
        }

        // 3. 动态炽热流鬃与龙脊真火 (Flowing Flame Mane with Additive Blending)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // 龙首烈焰飘动
        const headX = cellX + 54 + Math.sin(theta) * 1.5;
        const headY = cellY + 36 + Math.cos(theta) * 1.2;

        for (let m = 0; m < 5; m++) {
          const maneAng = -Math.PI * 0.35 + m * 0.22 + Math.sin(theta + m) * 0.14;
          const maneLen = 22 + Math.sin(theta * 2 + m * 1.2) * 7 + (m % 2) * 5;
          const grad = ctx.createLinearGradient(headX, headY, headX + Math.cos(maneAng) * maneLen, headY + Math.sin(maneAng) * maneLen);
          grad.addColorStop(0, 'rgba(255, 235, 140, 0.85)');
          grad.addColorStop(0.4, 'rgba(255, 140, 20, 0.65)');
          grad.addColorStop(0.8, 'rgba(220, 30, 20, 0.35)');
          grad.addColorStop(1, 'rgba(180, 0, 10, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(headX + (m - 2) * 3, headY);
          const cpX = headX + Math.cos(maneAng - 0.2) * (maneLen * 0.6);
          const cpY = headY + Math.sin(maneAng - 0.2) * (maneLen * 0.6);
          const endX = headX + Math.cos(maneAng) * maneLen;
          const endY = headY + Math.sin(maneAng) * maneLen;
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
          ctx.quadraticCurveTo(cpX - 4, cpY + 3, headX + (m - 1) * 3, headY + 3);
          ctx.closePath();
          ctx.fill();
        }

        // 4. 纯阳龙睛耀光与瞳眸闪光 (Golden Eye Divine Spark)
        const eyeX = cellX + 51 + Math.sin(theta) * 1.2;
        const eyeY = cellY + 54 + Math.cos(theta) * 0.8;
        const eyePulse = 0.5 + 0.5 * Math.sin(theta);

        const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 1, eyeX, eyeY, 8 + eyePulse * 4);
        eyeGrad.addColorStop(0, 'rgba(255, 255, 220, 0.95)');
        eyeGrad.addColorStop(0.3, 'rgba(255, 200, 40, 0.8)');
        eyeGrad.addColorStop(0.7, 'rgba(255, 80, 10, 0.35)');
        eyeGrad.addColorStop(1, 'rgba(255, 40, 0, 0)');
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 8 + eyePulse * 4, 0, Math.PI * 2);
        ctx.fill();

        // 峰值帧 (Frame 2, 3) 龙目爆闪金色十字星光 (Cross Star Sparkle)
        if (f === 2 || f === 3) {
          const starLen = (f === 2 ? 10 : 8);
          ctx.strokeStyle = 'rgba(255, 255, 230, 0.9)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(eyeX - starLen, eyeY);
          ctx.lineTo(eyeX + starLen, eyeY);
          ctx.moveTo(eyeX, eyeY - starLen);
          ctx.lineTo(eyeX, eyeY + starLen);
          ctx.stroke();
        }

        // 5. 飘拂龙须物理微波 (Fluid Dragon Whiskers)
        const snoutX = cellX + 44;
        const snoutY = cellY + 68;
        for (let w = 0; w < 2; w++) {
          const wDir = (w === 0 ? 1 : 0.6);
          const wPhase = theta + w * 1.5;
          const cp1x = snoutX - 12 + Math.sin(wPhase) * 6;
          const cp1y = snoutY + 14 * wDir + Math.cos(wPhase) * 5;
          const cp2x = snoutX - 22 + Math.cos(wPhase * 1.2) * 8;
          const cp2y = snoutY + 32 * wDir + Math.sin(wPhase * 1.2) * 7;
          const endX = snoutX - 28 + Math.sin(wPhase * 1.4) * 9;
          const endY = snoutY + 48 * wDir + Math.cos(wPhase * 1.4) * 8;

          ctx.strokeStyle = w === 0 ? 'rgba(255, 225, 120, 0.75)' : 'rgba(245, 180, 60, 0.55)';
          ctx.lineWidth = w === 0 ? 1.4 : 1.0;
          ctx.beginPath();
          ctx.moveTo(snoutX, snoutY + w * 3);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
          ctx.stroke();
        }

        // 6. 环绕龙身的游动火星微粒 (Dynamic Orbiting Flame Particles)
        for (const seed of emberSeeds) {
          const curAng = seed.phaseOffset + theta * seed.speedMult;
          const rx = seed.orbitRx;
          const ry = seed.orbitRy;
          const cosA = Math.cos(seed.tilt);
          const sinA = Math.sin(seed.tilt);
          const rawX = Math.cos(curAng) * rx;
          const rawY = Math.sin(curAng) * ry;

          const px = cx + (rawX * cosA - rawY * sinA);
          const py = cy + (rawX * sinA + rawY * cosA);

          const pGrad = ctx.createRadialGradient(px, py, 0, px, py, seed.size * 2.2);
          if (seed.colorType === 0) {
            pGrad.addColorStop(0, 'rgba(255, 255, 200, 0.95)');
            pGrad.addColorStop(0.4, 'rgba(255, 190, 40, 0.7)');
            pGrad.addColorStop(1, 'rgba(255, 100, 20, 0)');
          } else if (seed.colorType === 1) {
            pGrad.addColorStop(0, 'rgba(255, 200, 80, 0.9)');
            pGrad.addColorStop(0.5, 'rgba(240, 80, 20, 0.6)');
            pGrad.addColorStop(1, 'rgba(180, 20, 0, 0)');
          } else {
            pGrad.addColorStop(0, 'rgba(255, 150, 100, 0.85)');
            pGrad.addColorStop(0.6, 'rgba(200, 30, 40, 0.5)');
            pGrad.addColorStop(1, 'rgba(120, 10, 20, 0)');
          }
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(px, py, seed.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore(); // 结束加色混合
        ctx.restore(); // 结束单帧绘制
      }

      window.__dragonSheetBase64 = cvs.toDataURL('image/png');
    });
  </script>
  </body>
  </html>`;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  // 等待图片与脚本加载渲染完毕
  await new Promise(r => setTimeout(r, 600));

  const base64 = await win.webContents.executeJavaScript('window.__dragonSheetBase64');
  if (!base64 || !base64.startsWith('data:image/png;base64,')) {
    console.error('Failed to generate spritesheet data URL');
    process.exit(1);
  }

  const cleanData = base64.replace(/^data:image\/png;base64,/, '');
  const outPath = path.join(__dirname, '..', 'public', 'boss_red_dragon_sheet.png');
  fs.writeFileSync(outPath, cleanData, 'base64');

  const stat = fs.statSync(outPath);
  console.log(`Successfully generated boss_red_dragon_sheet.png (${stat.size} bytes, 720x360, 8 frames)!`);

  app.quit();
});
