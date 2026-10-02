const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

// 原始 AI 出图目录：默认取仓库内归档 art-source/raw，可用环境变量 ART_SOURCE_DIR 覆盖。
// 原先硬编码 Antigravity 的绝对路径（C:/Users/Administrator/.gemini/...），换机器即失效。
const brainDir = (process.env.ART_SOURCE_DIR
  || path.join(__dirname, '..', 'art-source', 'raw')).replace(/\\/g, '/');

const inputFiles = {
  skull: path.join(brainDir, 'corpse_skull_art_1790848004880.jpg').replace(/\\/g, '/'),
  triSkull: path.join(brainDir, 'corpse_tri_skull_art_1790848064867.jpg').replace(/\\/g, '/'),
  arm: path.join(brainDir, 'corpse_arm_art_1790848083796.jpg').replace(/\\/g, '/'),
  knuckle: path.join(brainDir, 'corpse_knuckle_art_1790848102579.jpg').replace(/\\/g, '/'),
  ghostFire: path.join(brainDir, 'corpse_ghost_fire_art_1790848139526.jpg').replace(/\\/g, '/'),
};

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const tempHtmlPath = path.join(__dirname, 'temp_asset_gen.html');

  const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: transparent; margin: 0;">
    <canvas id="cvs_skull" width="720" height="360"></canvas>
    <canvas id="cvs_tri_skull" width="720" height="360"></canvas>
    <canvas id="cvs_arm" width="720" height="360"></canvas>
    <canvas id="cvs_knuckle" width="256" height="256"></canvas>
    <canvas id="cvs_ghost_fire" width="256" height="256"></canvas>

    <img id="img_skull" src="file:///${inputFiles.skull}" style="display:none;" />
    <img id="img_tri_skull" src="file:///${inputFiles.triSkull}" style="display:none;" />
    <img id="img_arm" src="file:///${inputFiles.arm}" style="display:none;" />
    <img id="img_knuckle" src="file:///${inputFiles.knuckle}" style="display:none;" />
    <img id="img_ghost_fire" src="file:///${inputFiles.ghostFire}" style="display:none;" />

  <script>
    // ------------------------------------------------------------------
    // 专业水墨国风透明通道提取器 (Professional Ink-Wash Alpha & Chroma Matting)
    // 彻底消除纯白及微灰纸纹底色，同时100%保留骨骼高光与青碧魂火
    // ------------------------------------------------------------------
    function extractTransparentCanvas(sourceImg, targetW, targetH, padding = 12) {
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
      const maxRadius = Math.min(halfW, halfH) * 0.94;

      for (let y = 0; y < srcH; y++) {
        for (let x = 0; x < srcW; x++) {
          const pi = (y * srcW + x) * 4;
          const r = data[pi], g = data[pi + 1], b = data[pi + 2];
          const minVal = Math.min(r, g, b);
          const maxVal = Math.max(r, g, b);
          const sat = maxVal - minVal;

          // 计算到图片中心距离
          const dx = x - halfW;
          const dy = y - halfH;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // 1. 绝对外围白边/边角彻底清除
          if (x < 16 || x > srcW - 16 || y < 16 || y > srcH - 16) {
            if (minVal > 180 && sat < 30) {
              data[pi + 3] = 0;
              continue;
            }
          }

          // 2. 颜色与饱和度感知透明度计算
          // 背景纸色通常 minVal 很高 (>= 215) 且饱和度极低 (sat < 22)
          // 骨骼有黄褐灰阶 (sat >= 20 或 minVal <= 210)
          // 魂火有青绿蓝阶 (sat >= 40)
          // 水墨黑线 minVal < 120
          let alpha = 1.0;

          if (minVal >= 238 && sat < 20) {
            // 纯白背景
            alpha = 0;
          } else if (minVal >= 200 && sat < 30) {
            // 接近纸纹的浅色边缘，柔和过渡
            const satBonus = sat / 30; // 颜色较鲜艳的适当保留
            const whiteRatio = (minVal - 200) / 38; // 0 ~ 1
            alpha = Math.max(0, (1 - whiteRatio) * 0.85 + satBonus * 0.4);
          } else {
            // 主体部分：按逆混合去白底提纯
            const whiteRatio = minVal / 255;
            if (whiteRatio > 0.85) {
              alpha = Math.max(0.2, 1 - (whiteRatio - 0.85) / 0.15 * 0.6);
            } else {
              alpha = 1.0;
            }
          }

          // 距离边缘衰减保护（防止边缘有零星杂点）
          if (dist > maxRadius) {
            const edgeFade = Math.max(0, 1 - (dist - maxRadius) / (Math.min(halfW, halfH) - maxRadius));
            alpha *= edgeFade;
          }

          if (alpha <= 0.02) {
            data[pi + 3] = 0;
          } else {
            data[pi + 3] = Math.round(alpha * 255);
            // 逆混合还原被白底稀释的色彩饱和度
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

      // 3. 计算非透明区域包围盒
      let minX = srcW, maxX = 0, minY = srcH, maxY = 0;
      for (let y = 0; y < srcH; y++) {
        for (let x = 0; x < srcW; x++) {
          const a = data[(y * srcW + x) * 4 + 3];
          if (a > 20) {
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

      // 4. 将主体居中绘制到指定输出尺寸的目标画布中
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

    function createSoulMotes(count, rx, ry) {
      const motes = [];
      for (let i = 0; i < count; i++) {
        motes.push({
          orbitRx: rx + (i % 4) * 8,
          orbitRy: ry + ((i * 3) % 4) * 6,
          tilt: -0.22 + ((i % 5) - 2) * 0.1,
          phaseOffset: (i / count) * Math.PI * 2,
          speedMult: (i % 2 === 0 ? 1 : -1) * (1 + (i % 3) * 0.2),
          size: 1.2 + (i % 3) * 0.9,
          colorType: i % 3
        });
      }
      return motes;
    }

    function renderSoulMotes(ctx, cx, cy, theta, motes) {
      for (const m of motes) {
        const curAng = m.phaseOffset + theta * m.speedMult;
        const rx = m.orbitRx;
        const ry = m.orbitRy;
        const cosA = Math.cos(m.tilt);
        const sinA = Math.sin(m.tilt);
        const rawX = Math.cos(curAng) * rx;
        const rawY = Math.sin(curAng) * ry;

        const px = cx + (rawX * cosA - rawY * sinA);
        const py = cy + (rawX * sinA + rawY * cosA);

        const pGrad = ctx.createRadialGradient(px, py, 0, px, py, m.size * 2.2);
        if (m.colorType === 0) {
          pGrad.addColorStop(0, 'rgba(210, 255, 240, 0.95)');
          pGrad.addColorStop(0.4, 'rgba(6, 214, 160, 0.75)');
          pGrad.addColorStop(1, 'rgba(10, 100, 70, 0)');
        } else if (m.colorType === 1) {
          pGrad.addColorStop(0, 'rgba(160, 255, 225, 0.9)');
          pGrad.addColorStop(0.5, 'rgba(30, 220, 180, 0.65)');
          pGrad.addColorStop(1, 'rgba(5, 80, 60, 0)');
        } else {
          pGrad.addColorStop(0, 'rgba(245, 255, 250, 0.95)');
          pGrad.addColorStop(0.5, 'rgba(130, 235, 205, 0.55)');
          pGrad.addColorStop(1, 'rgba(20, 50, 40, 0)');
        }
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, m.size * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let loadedCount = 0;
    function checkAllLoaded() {
      loadedCount++;
      if (loadedCount >= 5) {
        setTimeout(processAssets, 100);
      }
    }

    document.getElementById('img_skull').onload = checkAllLoaded;
    document.getElementById('img_tri_skull').onload = checkAllLoaded;
    document.getElementById('img_arm').onload = checkAllLoaded;
    document.getElementById('img_knuckle').onload = checkAllLoaded;
    document.getElementById('img_ghost_fire').onload = checkAllLoaded;

    function processAssets() {
      const imgSkull = document.getElementById('img_skull');
      const imgTriSkull = document.getElementById('img_tri_skull');
      const imgArm = document.getElementById('img_arm');
      const imgKnuckle = document.getElementById('img_knuckle');
      const imgGhostFire = document.getElementById('img_ghost_fire');

      // ----------------------------------------------------------------
      // 1. 生成 8 帧白骨神颅 (720x360, 单帧 180x180)
      // 整体刚体呼吸与悬浮起伏，杜绝切片割裂
      // ----------------------------------------------------------------
      const skullBase = extractTransparentCanvas(imgSkull, 180, 180, 14);
      const cvsSkull = document.getElementById('cvs_skull');
      const ctxSkull = cvsSkull.getContext('2d');
      ctxSkull.clearRect(0, 0, 720, 360);
      const skullMotes = createSoulMotes(14, 62, 54);

      for (let f = 0; f < 8; f++) {
        const col = f % 4;
        const row = Math.floor(f / 4);
        const cellX = col * 180;
        const cellY = row * 180;
        const cx = cellX + 90;
        const cy = cellY + 90;
        const theta = (f / 8) * Math.PI * 2;

        ctxSkull.save();

        // 1.1 幽冥死气光晕底衬
        const auraPulse = Math.sin(theta) * 0.12;
        const auraGrad = ctxSkull.createRadialGradient(cx, cy + 4, 18, cx, cy + 4, 76 + auraPulse * 14);
        auraGrad.addColorStop(0, 'rgba(6, 214, 160, 0.28)');
        auraGrad.addColorStop(0.45, 'rgba(20, 140, 110, 0.16)');
        auraGrad.addColorStop(0.75, 'rgba(10, 60, 50, 0.08)');
        auraGrad.addColorStop(1, 'rgba(5, 30, 20, 0)');
        ctxSkull.fillStyle = auraGrad;
        ctxSkull.beginPath();
        ctxSkull.arc(cx, cy + 4, 76 + auraPulse * 14, 0, Math.PI * 2);
        ctxSkull.fill();

        // 1.2 整体威严悬浮浮沉与微幅呼吸缩放 (Smooth Floating & Breathing)
        const floatY = Math.sin(theta) * 2.8;
        const tilt = Math.sin(theta) * 0.02;
        const breath = 1.0 + Math.sin(theta) * 0.022;

        ctxSkull.save();
        ctxSkull.translate(cx, cy + floatY);
        ctxSkull.rotate(tilt);
        ctxSkull.scale(breath, breath);
        ctxSkull.drawImage(skullBase, -90, -90, 180, 180);
        ctxSkull.restore();

        // 1.3 双目青碧魂火闪烁与十字星芒
        ctxSkull.save();
        ctxSkull.globalCompositeOperation = 'lighter';
        const eyePulse = 0.5 + 0.5 * Math.sin(theta);
        const eyeY = cy + floatY - 4;
        const leftEyeX = cx - 19;
        const rightEyeX = cx + 19;

        for (const ex of [leftEyeX, rightEyeX]) {
          const eyeGrad = ctxSkull.createRadialGradient(ex, eyeY, 1, ex, eyeY, 10 + eyePulse * 4);
          eyeGrad.addColorStop(0, 'rgba(240, 255, 250, 0.95)');
          eyeGrad.addColorStop(0.35, 'rgba(6, 214, 160, 0.85)');
          eyeGrad.addColorStop(0.75, 'rgba(10, 160, 120, 0.35)');
          eyeGrad.addColorStop(1, 'rgba(5, 80, 60, 0)');
          ctxSkull.fillStyle = eyeGrad;
          ctxSkull.beginPath();
          ctxSkull.arc(ex, eyeY, 10 + eyePulse * 4, 0, Math.PI * 2);
          ctxSkull.fill();

          if (f === 2 || f === 3) {
            const starLen = (f === 2 ? 8 : 6);
            ctxSkull.strokeStyle = 'rgba(230, 255, 245, 0.9)';
            ctxSkull.lineWidth = 1.3;
            ctxSkull.beginPath();
            ctxSkull.moveTo(ex - starLen, eyeY);
            ctxSkull.lineTo(ex + starLen, eyeY);
            ctxSkull.moveTo(ex, eyeY - starLen);
            ctxSkull.lineTo(ex + starLen, eyeY);
            ctxSkull.stroke();
          }
        }

        renderSoulMotes(ctxSkull, cx, cy, theta, skullMotes);
        ctxSkull.restore();

        ctxSkull.restore();
      }

      // ----------------------------------------------------------------
      // 2. 生成 8 帧三首融合白骨魔神 (720x360, 单帧 180x180)
      // ----------------------------------------------------------------
      const triSkullBase = extractTransparentCanvas(imgTriSkull, 180, 180, 12);
      const cvsTriSkull = document.getElementById('cvs_tri_skull');
      const ctxTriSkull = cvsTriSkull.getContext('2d');
      ctxTriSkull.clearRect(0, 0, 720, 360);
      const triMotes = createSoulMotes(18, 70, 58);

      for (let f = 0; f < 8; f++) {
        const col = f % 4;
        const row = Math.floor(f / 4);
        const cellX = col * 180;
        const cellY = row * 180;
        const cx = cellX + 90;
        const cy = cellY + 90;
        const theta = (f / 8) * Math.PI * 2;

        ctxTriSkull.save();

        const auraPulse = Math.sin(theta) * 0.15;
        const auraGrad = ctxTriSkull.createRadialGradient(cx, cy + 5, 22, cx, cy + 5, 84 + auraPulse * 16);
        auraGrad.addColorStop(0, 'rgba(6, 214, 160, 0.35)');
        auraGrad.addColorStop(0.4, 'rgba(15, 120, 100, 0.22)');
        auraGrad.addColorStop(0.7, 'rgba(10, 50, 45, 0.1)');
        auraGrad.addColorStop(1, 'rgba(5, 25, 20, 0)');
        ctxTriSkull.fillStyle = auraGrad;
        ctxTriSkull.beginPath();
        ctxTriSkull.arc(cx, cy + 5, 84 + auraPulse * 16, 0, Math.PI * 2);
        ctxTriSkull.fill();

        const floatY = Math.sin(theta) * 3.2;
        const tilt = Math.sin(theta) * 0.025;
        const breath = 1.0 + Math.sin(theta) * 0.025;

        ctxTriSkull.save();
        ctxTriSkull.translate(cx, cy + floatY);
        ctxTriSkull.rotate(tilt);
        ctxTriSkull.scale(breath, breath);
        ctxTriSkull.drawImage(triSkullBase, -90, -90, 180, 180);
        ctxTriSkull.restore();

        ctxTriSkull.save();
        ctxTriSkull.globalCompositeOperation = 'lighter';
        const eyePulse = 0.5 + 0.5 * Math.sin(theta);
        const eyeY = cy + floatY - 2;

        const eyes = [
          { x: cx - 52, y: eyeY - 2, r: 6 },
          { x: cx - 33, y: eyeY + 1, r: 6 },
          { x: cx - 14, y: eyeY, r: 8 },
          { x: cx + 14, y: eyeY, r: 8 },
          { x: cx + 33, y: eyeY + 1, r: 6 },
          { x: cx + 52, y: eyeY - 2, r: 6 }
        ];

        for (let eIdx = 0; eIdx < eyes.length; eIdx++) {
          const e = eyes[eIdx];
          const ex = e.x;
          const ey = e.y;
          const eyeGrad = ctxTriSkull.createRadialGradient(ex, ey, 1, ex, ey, e.r + eyePulse * 3);
          eyeGrad.addColorStop(0, 'rgba(240, 255, 250, 0.95)');
          eyeGrad.addColorStop(0.35, 'rgba(6, 214, 160, 0.85)');
          eyeGrad.addColorStop(0.75, 'rgba(10, 160, 120, 0.35)');
          eyeGrad.addColorStop(1, 'rgba(5, 80, 60, 0)');
          ctxTriSkull.fillStyle = eyeGrad;
          ctxTriSkull.beginPath();
          ctxTriSkull.arc(ex, ey, e.r + eyePulse * 3, 0, Math.PI * 2);
          ctxTriSkull.fill();
        }

        if (f === 2 || f === 3) {
          const starLen = 8;
          ctxTriSkull.strokeStyle = 'rgba(230, 255, 245, 0.9)';
          ctxTriSkull.lineWidth = 1.4;
          for (const ex of [cx - 14, cx + 14]) {
            ctxTriSkull.beginPath();
            ctxTriSkull.moveTo(ex - starLen, eyeY);
            ctxTriSkull.lineTo(ex + starLen, eyeY);
            ctxTriSkull.moveTo(ex, eyeY - starLen);
            ctxTriSkull.lineTo(ex + starLen, eyeY);
            ctxTriSkull.stroke();
          }
        }

        renderSoulMotes(ctxTriSkull, cx, cy, theta, triMotes);
        ctxTriSkull.restore();

        ctxTriSkull.restore();
      }

      // ----------------------------------------------------------------
      // 3. 生成 8 帧白骨神臂 (720x360, 单帧 180x180)
      // ----------------------------------------------------------------
      const armBase = extractTransparentCanvas(imgArm, 180, 180, 12);
      const cvsArm = document.getElementById('cvs_arm');
      const ctxArm = cvsArm.getContext('2d');
      ctxArm.clearRect(0, 0, 720, 360);
      const armMotes = createSoulMotes(12, 48, 65);

      for (let f = 0; f < 8; f++) {
        const col = f % 4;
        const row = Math.floor(f / 4);
        const cellX = col * 180;
        const cellY = row * 180;
        const cx = cellX + 90;
        const cy = cellY + 90;
        const theta = (f / 8) * Math.PI * 2;

        ctxArm.save();

        const auraPulse = Math.sin(theta) * 0.12;
        const auraGrad = ctxArm.createRadialGradient(cx, cy + 10, 14, cx, cy + 10, 68 + auraPulse * 12);
        auraGrad.addColorStop(0, 'rgba(6, 214, 160, 0.22)');
        auraGrad.addColorStop(0.5, 'rgba(15, 120, 90, 0.12)');
        auraGrad.addColorStop(1, 'rgba(5, 30, 20, 0)');
        ctxArm.fillStyle = auraGrad;
        ctxArm.beginPath();
        ctxArm.arc(cx, cy + 10, 68 + auraPulse * 12, 0, Math.PI * 2);
        ctxArm.fill();

        // 骨臂悬浮微幅摆动
        const armTilt = Math.sin(theta) * 0.04;
        const floatY = Math.sin(theta) * 2.5;

        ctxArm.save();
        ctxArm.translate(cx, cy + floatY);
        ctxArm.rotate(armTilt);
        ctxArm.drawImage(armBase, -90, -90, 180, 180);
        ctxArm.restore();

        // 指尖幽冥焰舌流光
        ctxArm.save();
        ctxArm.globalCompositeOperation = 'lighter';
        const tipY = cy + floatY + 58;
        const fingerX = [cx - 28, cx - 14, cx, cx + 14, cx + 28];
        for (let i = 0; i < fingerX.length; i++) {
          const fx = fingerX[i];
          const fGrad = ctxArm.createRadialGradient(fx, tipY, 1, fx, tipY, 5 + Math.sin(theta + i) * 2);
          fGrad.addColorStop(0, 'rgba(230, 255, 245, 0.85)');
          fGrad.addColorStop(0.5, 'rgba(6, 214, 160, 0.6)');
          fGrad.addColorStop(1, 'rgba(5, 60, 45, 0)');
          ctxArm.fillStyle = fGrad;
          ctxArm.beginPath();
          ctxArm.arc(fx, tipY, 5 + Math.sin(theta + i) * 2, 0, Math.PI * 2);
          ctxArm.fill();
        }

        renderSoulMotes(ctxArm, cx, cy, theta, armMotes);
        ctxArm.restore();

        ctxArm.restore();
      }

      // 4. 生成骷髅指节弹幕 (256x256)
      const knuckleBase = extractTransparentCanvas(imgKnuckle, 256, 256, 16);
      const cvsKnuckle = document.getElementById('cvs_knuckle');
      const ctxKnuckle = cvsKnuckle.getContext('2d');
      ctxKnuckle.clearRect(0, 0, 256, 256);
      ctxKnuckle.drawImage(knuckleBase, 0, 0);

      // 5. 生成幽冥鬼火弹幕 (256x256)
      const ghostFireBase = extractTransparentCanvas(imgGhostFire, 256, 256, 14);
      const cvsGhostFire = document.getElementById('cvs_ghost_fire');
      const ctxGhostFire = cvsGhostFire.getContext('2d');
      ctxGhostFire.clearRect(0, 0, 256, 256);
      ctxGhostFire.drawImage(ghostFireBase, 0, 0);

      window.__output = {
        skullSheet: cvsSkull.toDataURL('image/png'),
        triSkullSheet: cvsTriSkull.toDataURL('image/png'),
        armSheet: cvsArm.toDataURL('image/png'),
        knuckle: cvsKnuckle.toDataURL('image/png'),
        ghostFire: cvsGhostFire.toDataURL('image/png')
      };
      window.__ready = true;
    }
  </script>
  </body>
  </html>`;

  fs.writeFileSync(tempHtmlPath, html, 'utf8');
  await win.loadFile(tempHtmlPath);

  console.log('Processing refined realistic assets...');
  let ready = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 250));
    ready = await win.webContents.executeJavaScript('window.__ready');
    if (ready) break;
  }

  if (!ready) {
    console.error('Timed out waiting for assets');
    process.exit(1);
  }

  const output = await win.webContents.executeJavaScript('window.__output');
  const publicDir = path.join(__dirname, '..', 'public');

  const targets = [
    { key: 'skullSheet', name: 'boss_corpse_skull_sheet.png' },
    { key: 'triSkullSheet', name: 'boss_corpse_tri_skull_sheet.png' },
    { key: 'armSheet', name: 'boss_corpse_arm_sheet.png' },
    { key: 'knuckle', name: 'effect_corpse_knuckle.png' },
    { key: 'ghostFire', name: 'effect_corpse_ghost_fire.png' }
  ];

  for (const t of targets) {
    const b64 = output[t.key].replace(/^data:image\/png;base64,/, '');
    const outPath = path.join(publicDir, t.name);
    let written = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        fs.writeFileSync(outPath, b64, 'base64');
        written = true;
        break;
      } catch (err) {
        await new Promise(r => setTimeout(r, 250));
      }
    }
    if (!written) {
      console.error(`Failed to write ${t.name} after 10 attempts`);
      process.exit(1);
    }
    const stat = fs.statSync(outPath);
    console.log(`Successfully written ${t.name}: ${stat.size} bytes`);
  }

  try { fs.unlinkSync(tempHtmlPath); } catch (e) {}
  console.log('All refined realistic Corpse Emperor assets written!');
  app.quit();
});
