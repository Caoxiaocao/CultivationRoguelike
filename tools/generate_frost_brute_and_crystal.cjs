const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const bruteImgPath = path.resolve(__dirname, '..', 'public', 'enemy_brute.png').replace(/\\/g, '/');

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background: transparent; margin: 0;">
  <canvas id="cvs_frost_sheet" width="720" height="360"></canvas>
  <canvas id="cvs_frost_brute" width="512" height="512"></canvas>
  <canvas id="cvs_frost_crystal" width="256" height="256"></canvas>
  <img id="img_brute" src="file:///${bruteImgPath}" style="display:none;" />
<script>
  let loaded = false;
  document.getElementById('img_brute').onload = () => {
    loaded = true;
    setTimeout(startGen, 100);
  };

  function startGen() {
    generateFrostBruteSheet();
    generateFrostBruteSingle();
    generateFrostCrystal();
    window.__frostReady = true;
  }

  // 1. 生成 8 帧玄霜凝晶巨兕序列帧 (720x360, 4x2, 180x180)
  function generateFrostBruteSheet() {
    const img = document.getElementById('img_brute');
    const cvs = document.getElementById('cvs_frost_sheet');
    const ctx = cvs.getContext('2d');

    const cols = 4;
    const rows = 2;
    const totalFrames = 8;
    const frameW = 180;
    const frameH = 180;

    ctx.clearRect(0, 0, 720, 360);

    // 冰晶微粒种子 (Ice Crystal Shard Seeds)
    const crystalSeeds = [];
    for (let i = 0; i < 16; i++) {
      crystalSeeds.push({
        originX: -36 + (i * 11) % 76,
        originY: -18 + ((i * 7) % 52),
        driftAmp: 3.5 + (i % 3) * 2.5,
        riseSpeed: 24 + (i % 4) * 8,
        phaseOffset: (i / 16),
        size: 1.6 + (i % 3) * 1.2,
        rotSpeed: 2 + (i % 3) * 1.5,
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

      // 1.1 地面深沉玄冰阴影与极寒霜雾光环 (Ground Frost Mist & Shadow)
      const stompDip = Math.abs(Math.sin(theta)) * 2.8;
      const swayX = Math.sin(theta) * 2.2;

      ctx.save();
      ctx.fillStyle = 'rgba(8, 20, 36, 0.46)';
      ctx.beginPath();
      ctx.ellipse(cx + swayX * 0.6, cy + 62, 48, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 极寒冰霜冷雾光晕
      const groundFrost = ctx.createRadialGradient(cx + swayX * 0.5, cy + 54, 4, cx + swayX * 0.5, cy + 54, 40);
      groundFrost.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
      groundFrost.addColorStop(0.5, 'rgba(14, 165, 233, 0.16)');
      groundFrost.addColorStop(0.8, 'rgba(2, 132, 199, 0.05)');
      groundFrost.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = groundFrost;
      ctx.beginPath();
      ctx.ellipse(cx + swayX * 0.5, cy + 54, 40, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 1.2 四足走步微切片律动形变 + 色相旋转至冰蓝/极光青色
      const numSlices = 36;
      const sliceH = frameH / numSlices;
      const breathScaleY = 1.0 + Math.sin(theta) * 0.022;
      const breathScaleX = 1.0 - Math.sin(theta) * 0.012;

      ctx.save();
      // 使用 CSS Filter 进行精确色彩反转与冰蓝调色
      // hue-rotate(185deg) 将赤红/火橙精准移入天蓝/冰青色谱
      ctx.filter = 'hue-rotate(185deg) saturate(1.4) brightness(1.08)';

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
      ctx.restore();

      // 1.3 极寒冰晶角、霜芒巨眼与倒生冰棱晶刺高光叠加
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const hornPulse = 0.5 + 0.5 * Math.sin(theta);
      const horns = [
        { x: cx - 46 + swayX, y: cy - 42 + stompDip, r: 18 },
        { x: cx - 10 + swayX, y: cy - 44 + stompDip, r: 15 }
      ];

      for (const h of horns) {
        const hGrad = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, h.r + hornPulse * 5);
        hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        hGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.85)');
        hGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.55)');
        hGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r + hornPulse * 5, 0, Math.PI * 2);
        ctx.fill();

        // 绘制锐利冰晶折射芒线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(h.x - 8, h.y + 4);
        ctx.lineTo(h.x, h.y - h.r - 2);
        ctx.lineTo(h.x + 6, h.y + 3);
        ctx.stroke();
      }

      // 极寒霜蓝龙睛 (Glacial Frost Eye)
      const eyeX = cx - 28 + swayX;
      const eyeY = cy - 6 + stompDip;
      const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 1, eyeX, eyeY, 7 + hornPulse * 3);
      eyeGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      eyeGrad.addColorStop(0.35, 'rgba(125, 211, 252, 0.9)');
      eyeGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.5)');
      eyeGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 7 + hornPulse * 3, 0, Math.PI * 2);
      ctx.fill();

      // 冰棱尾刺冷光 (Frost Crystal Tail)
      const tailX = cx + 56 + Math.cos(theta - 1.0) * 3.5;
      const tailY = cy - 26 + stompDip + Math.sin(theta - 1.0) * 3.0;
      const tailGrad = ctx.createRadialGradient(tailX, tailY, 2, tailX, tailY, 16 + Math.sin(theta * 2) * 4);
      tailGrad.addColorStop(0, 'rgba(240, 249, 255, 0.95)');
      tailGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.75)');
      tailGrad.addColorStop(0.8, 'rgba(14, 165, 233, 0.35)');
      tailGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.arc(tailX, tailY, 16 + Math.sin(theta * 2) * 4, 0, Math.PI * 2);
      ctx.fill();

      // 1.4 周身飘拂的菱形冰晶与极寒冰屑粒子 (Floating Ice Diamond Shards)
      for (const seed of crystalSeeds) {
        const prog = ((f / totalFrames) + seed.phaseOffset) % 1.0;
        const px = cx + seed.originX + swayX + Math.sin(prog * Math.PI * 2 + seed.phaseOffset * 5) * seed.driftAmp;
        const py = cy + seed.originY + stompDip - prog * seed.riseSpeed;
        const alpha = Math.sin(prog * Math.PI);
        const rot = theta * seed.rotSpeed + seed.phaseOffset * 4;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot);

        // 绘制微型菱形冰棱晶
        const dW = seed.size * 1.5;
        const dH = seed.size * 2.8;

        const pGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, dH);
        if (seed.colorType === 0) {
          pGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (alpha * 0.95) + ')');
          pGrad.addColorStop(0.5, 'rgba(125, 211, 252, ' + (alpha * 0.75) + ')');
          pGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        } else if (seed.colorType === 1) {
          pGrad.addColorStop(0, 'rgba(224, 242, 254, ' + (alpha * 0.9) + ')');
          pGrad.addColorStop(0.6, 'rgba(56, 189, 248, ' + (alpha * 0.65) + ')');
          pGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        } else {
          pGrad.addColorStop(0, 'rgba(186, 230, 253, ' + (alpha * 0.85) + ')');
          pGrad.addColorStop(0.6, 'rgba(3, 105, 161, ' + (alpha * 0.5) + ')');
          pGrad.addColorStop(1, 'rgba(12, 74, 110, 0)');
        }
        ctx.fillStyle = pGrad;

        ctx.beginPath();
        ctx.moveTo(0, -dH);
        ctx.lineTo(dW, 0);
        ctx.lineTo(0, dH);
        ctx.lineTo(-dW, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      ctx.restore(); // end lighter
      ctx.restore(); // end frame
    }

    window.__frostSheetBase64 = cvs.toDataURL('image/png');
  }

  // 2. 生成单张高精玄霜凝晶巨兕立绘 (512x512 fallback)
  function generateFrostBruteSingle() {
    const img = document.getElementById('img_brute');
    const cvs = document.getElementById('cvs_frost_brute');
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    ctx.save();
    ctx.filter = 'hue-rotate(185deg) saturate(1.4) brightness(1.08)';
    ctx.drawImage(img, 0, 0, 512, 512);
    ctx.restore();

    // 叠加晶蓝高光与霜芒
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hGrad = ctx.createRadialGradient(140, 110, 5, 140, 110, 50);
    hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    hGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)');
    hGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.arc(140, 110, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    window.__frostBruteBase64 = cvs.toDataURL('image/png');
  }

  // 3. 生成高精冰棱晶弹幕贴图 (256x256, 中心 128,128, 朝右 +X 锐利多棱穿刺晶体)
  function generateFrostCrystal() {
    const cvs = document.getElementById('cvs_frost_crystal');
    const ctx = cvs.getContext('2d');
    const cx = 128, cy = 128;
    ctx.clearRect(0, 0, 256, 256);

    ctx.save();

    // 3.1 外层极寒霜气光晕 (Outer Frost Glow)
    const glow = ctx.createRadialGradient(cx + 10, cy, 15, cx + 10, cy, 95);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
    glow.addColorStop(0.35, 'rgba(14, 165, 233, 0.32)');
    glow.addColorStop(0.7, 'rgba(2, 132, 199, 0.12)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx + 10, cy, 95, 0, Math.PI * 2);
    ctx.fill();

    // 3.2 伴飞小棱晶 (Flanking Satellite Crystals)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const satellites = [
      { x: cx - 45, y: cy - 35, scale: 0.42, rot: -0.2 },
      { x: cx - 45, y: cy + 35, scale: 0.42, rot: 0.2 },
      { x: cx - 75, y: cy, scale: 0.32, rot: 0 },
      { x: cx - 15, y: cy - 48, scale: 0.26, rot: 0.3 },
      { x: cx - 15, y: cy + 48, scale: 0.26, rot: -0.3 },
    ];
    for (const sat of satellites) {
      ctx.save();
      ctx.translate(sat.x, sat.y);
      ctx.rotate(sat.rot);
      ctx.scale(sat.scale, sat.scale);

      ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.beginPath();
      ctx.moveTo(35, 0);
      ctx.lineTo(0, -14);
      ctx.lineTo(-30, 0);
      ctx.lineTo(0, 14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 3.3 主冰棱晶体 (Master Hexagonal Ice Spear Crystal)
    // 顶点定义：前端锐尖 (cx + 96, cy), 尾端锥尖 (cx - 72, cy), 上主折角 (cx + 10, cy - 32), 下主折角 (cx + 10, cy + 32)
    // 脊线中心棱 (cx + 25, cy)
    const tipX = cx + 92, tipY = cy;
    const tailX = cx - 68, tailY = cy;
    const topX = cx + 8, topY = cy - 32;
    const botX = cx + 8, botY = cy + 32;
    const midX = cx + 22, midY = cy;

    // 面1: 上前方主受光晶面 (Top-Front High-Light Facet)
    const f1Grad = ctx.createLinearGradient(midX, midY, topX, topY);
    f1Grad.addColorStop(0, 'rgba(240, 249, 255, 0.98)');
    f1Grad.addColorStop(0.4, 'rgba(186, 230, 253, 0.92)');
    f1Grad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');
    ctx.fillStyle = f1Grad;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fill();

    // 面2: 下前方折射晶面 (Bottom-Front Refraction Facet)
    const f2Grad = ctx.createLinearGradient(midX, midY, botX, botY);
    f2Grad.addColorStop(0, 'rgba(186, 230, 253, 0.95)');
    f2Grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.88)');
    f2Grad.addColorStop(1, 'rgba(2, 132, 199, 0.82)');
    ctx.fillStyle = f2Grad;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(botX, botY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fill();

    // 面3: 上后方冷幽晶面 (Top-Rear Deep Ice Facet)
    const f3Grad = ctx.createLinearGradient(midX, midY, tailX, tailY);
    f3Grad.addColorStop(0, 'rgba(224, 242, 254, 0.9)');
    f3Grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.8)');
    f3Grad.addColorStop(1, 'rgba(3, 105, 161, 0.7)');
    ctx.fillStyle = f3Grad;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(tailX, tailY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fill();

    // 面4: 下后方深邃冰晶面 (Bottom-Rear Deep Shadow Facet)
    const f4Grad = ctx.createLinearGradient(midX, midY, botX, botY);
    f4Grad.addColorStop(0, 'rgba(125, 211, 252, 0.85)');
    f4Grad.addColorStop(0.5, 'rgba(2, 132, 199, 0.85)');
    f4Grad.addColorStop(1, 'rgba(12, 74, 110, 0.75)');
    ctx.fillStyle = f4Grad;
    ctx.beginPath();
    ctx.moveTo(botX, botY);
    ctx.lineTo(tailX, tailY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fill();

    // 3.4 晶格锐利冰棱骨架描边 (Crisp Crystalline Edges & Ridge Highlights)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    // 外轮廓
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(tailX, tailY);
    ctx.lineTo(botX, botY);
    ctx.closePath();
    ctx.stroke();

    // 内部脊骨光棱 (Central Spine Ridge)
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(midX, midY);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(topX, topY);
    ctx.moveTo(midX, midY);
    ctx.lineTo(botX, botY);
    ctx.stroke();

    // 3.5 晶棱交叉耀眼星芒 (Specular Star Flash at Crystal Core)
    const starX = midX + 15, starY = midY - 2;
    const starGrad = ctx.createRadialGradient(starX, starY, 1, starX, starY, 22);
    starGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    starGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.85)');
    starGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
    starGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = starGrad;
    ctx.beginPath();
    ctx.arc(starX, starY, 22, 0, Math.PI * 2);
    ctx.fill();

    // 四角极寒星芒十字
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(starX - 24, starY);
    ctx.lineTo(starX + 24, starY);
    ctx.moveTo(starX, starY - 24);
    ctx.lineTo(starX, starY + 24);
    ctx.stroke();

    ctx.restore(); // end lighter
    ctx.restore(); // end master

    window.__frostCrystalBase64 = cvs.toDataURL('image/png');
  }
</script>
</body>
</html>`;

  const tmpHtmlPath = path.join(__dirname, 'temp_frost_spritesheet_gen.html');
  fs.writeFileSync(tmpHtmlPath, htmlContent, 'utf8');

  await win.loadFile(tmpHtmlPath);

  // 等待渲染生成
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    ready = await win.webContents.executeJavaScript('window.__frostReady || false');
    if (ready) break;
  }

  if (!ready) {
    console.error('Timed out waiting for frost assets to be ready');
    process.exit(1);
  }

  const frostSheetBase64 = await win.webContents.executeJavaScript('window.__frostSheetBase64');
  const frostBruteBase64 = await win.webContents.executeJavaScript('window.__frostBruteBase64');
  const frostCrystalBase64 = await win.webContents.executeJavaScript('window.__frostCrystalBase64');

  try { fs.unlinkSync(tmpHtmlPath); } catch (e) {}

  if (!frostSheetBase64 || !frostCrystalBase64) {
    console.error('Failed to get generated frost assets base64');
    process.exit(1);
  }

  const outSheetPath = path.join(__dirname, '..', 'public', 'enemy_frost_brute_sheet.png');
  fs.writeFileSync(outSheetPath, frostSheetBase64.replace(/^data:image\/png;base64,/, ''), 'base64');

  const outBrutePath = path.join(__dirname, '..', 'public', 'enemy_frost_brute.png');
  fs.writeFileSync(outBrutePath, frostBruteBase64.replace(/^data:image\/png;base64,/, ''), 'base64');

  const outCrystalPath = path.join(__dirname, '..', 'public', 'effect_frost_crystal.png');
  fs.writeFileSync(outCrystalPath, frostCrystalBase64.replace(/^data:image\/png;base64,/, ''), 'base64');

  console.log('Successfully generated enemy_frost_brute_sheet.png! Size:', fs.statSync(outSheetPath).size);
  console.log('Successfully generated enemy_frost_brute.png! Size:', fs.statSync(outBrutePath).size);
  console.log('Successfully generated effect_frost_crystal.png! Size:', fs.statSync(outCrystalPath).size);

  app.quit();
});
