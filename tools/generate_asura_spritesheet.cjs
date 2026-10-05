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

  const baseImgPath = path.join(__dirname, '..', 'public', 'boss_asura_demon.png');
  const baseImgData = fs.readFileSync(baseImgPath).toString('base64');

  const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: transparent; margin: 0;">
    <canvas id="cvs_sheet" width="720" height="360"></canvas>
    <img id="base_asura" src="data:image/png;base64,${baseImgData}" style="display:none;" />
  <script>
    window.addEventListener('load', () => {
      const img = document.getElementById('base_asura');
      const cvs = document.getElementById('cvs_sheet');
      const ctx = cvs.getContext('2d');

      const cols = 4;
      const rows = 2;
      const totalFrames = 8;
      const frameW = 180;
      const frameH = 180;

      ctx.clearRect(0, 0, 720, 360);

      // 预生成 14 颗无缝闭环噬魂幽火粒子 (Seamless Looping Soul Fire Wisps)
      const wispSeeds = [];
      for (let i = 0; i < 14; i++) {
        wispSeeds.push({
          orbitRx: 46 + (i % 3) * 16,
          orbitRy: 42 + ((i * 2) % 3) * 14,
          tilt: -0.22 + ((i % 5) - 2) * 0.12,
          phaseOffset: (i / 14) * Math.PI * 2,
          speedMult: (i % 2 === 0 ? 1 : -1) * (1 + (i % 3) * 0.15),
          size: 1.6 + (i % 3) * 1.0,
          isCyan: (i % 3 !== 0) // 2/3 为幽绿青魂, 1/3 为暗紫魔焰
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
        // 限制在单帧 180x180 裁剪区域内，彻底杜绝切片外溢到相邻格
        ctx.beginPath();
        ctx.rect(cellX, cellY, frameW, frameH);
        ctx.clip();

        // 1. 底层虚空魔焰光晕 (Void Demon Aura Underlay)
        const auraPulse = Math.sin(theta) * 0.12;
        const auraGrad = ctx.createRadialGradient(cx, cy - 4, 18, cx, cy - 4, 76 + auraPulse * 12);
        auraGrad.addColorStop(0, 'rgba(114, 9, 183, 0.32)');
        auraGrad.addColorStop(0.45, 'rgba(247, 37, 133, 0.18)');
        auraGrad.addColorStop(0.75, 'rgba(36, 0, 70, 0.08)');
        auraGrad.addColorStop(1, 'rgba(16, 0, 43, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 76 + auraPulse * 12, 0, Math.PI * 2);
        ctx.fill();

        // 2. 魔尊肉身骨骼波浪律动分片平滑形变 (Demonic Anatomical Slicing & Breathing)
        // 目标基准绘制区域设为 166x166，上下左右留足 7px 安全边距，彻底杜绝顶边与底边切断
        const baseW = 166;
        const baseH = 166;
        const numSlices = 40;
        const sliceH = baseH / numSlices;
        const srcSliceH = img.naturalHeight / numSlices;

        const offsetX = (frameW - baseW) / 2;
        const offsetY = (frameH - baseH) / 2 + 2;

        for (let s = 0; s < numSlices; s++) {
          const sy = s * sliceH;
          const srcY = s * srcSliceH;

          // 头部 (s: 0-13): 维持威严稳固，微幅仰俯
          // 胸腔核心 (s: 14-26): 呼吸起伏膨胀
          // 下盘腰腹 (s: 27-39): 稳健收束
          let breathW = 1.0;
          let dx = 0;
          let dy = 0;

          if (s < 14) {
            breathW = 1.0 + Math.sin(theta) * 0.015;
            dy = Math.sin(theta - 0.2) * 1.4;
            dx = Math.cos(theta) * 0.3;
          } else if (s <= 26) {
            breathW = 1.0 + Math.sin(theta) * 0.045;
            dy = Math.sin(theta) * 1.6;
            dx = Math.sin(theta + s * 0.08) * 0.5;
          } else {
            breathW = 1.0 + Math.sin(theta) * 0.02;
            dy = Math.sin(theta + 0.2) * 1.0;
          }

          const destW = baseW * breathW;
          const destX = cellX + offsetX + dx + (baseW - destW) / 2;
          const destY = cellY + offsetY + sy + dy;

          // 增加 1.0px 重叠覆盖量，杜绝子像素渲染出现的水平缝隙
          ctx.drawImage(
            img,
            0, srcY, img.naturalWidth, srcSliceH,
            destX, destY, destW, sliceH + 1.0
          );
        }

        // 3. 加色发光层：深渊魔眼、喉口噬魂焰与心口幽魂符文 (Additive Glow FX)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const headDy = Math.sin(theta - 0.2) * 1.4;
        const chestDy = Math.sin(theta) * 1.6;

        // 3.1 喉部与巨口幽绿噬魂烈焰 (Throat Maw Soul Fire)
        const mouthX = cx;
        const mouthY = cy - 22 + headDy;
        const mouthFlare = Math.max(0, Math.sin(theta)) * 0.5 + 0.5;
        const mouthGrad = ctx.createRadialGradient(mouthX, mouthY, 2, mouthX, mouthY, 15 * mouthFlare + 4);
        mouthGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        mouthGrad.addColorStop(0.3, 'rgba(6, 214, 160, 0.85)');
        mouthGrad.addColorStop(0.7, 'rgba(76, 201, 240, 0.4)');
        mouthGrad.addColorStop(1, 'rgba(6, 214, 160, 0)');
        ctx.fillStyle = mouthGrad;
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, 15 * mouthFlare + 4, 0, Math.PI * 2);
        ctx.fill();

        // 3.2 额间四只赤红魔眼闪烁耀芒 (Four Demonic Crimson Eyes)
        const eyeGlow = 0.5 + Math.sin(theta * 2) * 0.3;
        const eyeOffsets = [
          [-7, -44], [7, -44],   // 主目
          [-13, -49], [13, -49]  // 额角副目
        ];
        for (const [ox, oy] of eyeOffsets) {
          const ex = cx + ox;
          const ey = cy + oy + headDy;
          const eyeGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 4.5 * eyeGlow + 2);
          eyeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          eyeGrad.addColorStop(0.4, 'rgba(247, 37, 133, 0.8)');
          eyeGrad.addColorStop(1, 'rgba(255, 0, 80, 0)');
          ctx.fillStyle = eyeGrad;
          ctx.beginPath();
          ctx.arc(ex, ey, 4.5 * eyeGlow + 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3.3 心口与胸腔裂隙幽魂符文脉动 (Chest Core Soul Fissure)
        const coreX = cx;
        const coreY = cy + 10 + chestDy;
        const corePulse = 0.55 + Math.sin(theta + 0.4) * 0.45;
        const coreGrad = ctx.createRadialGradient(coreX, coreY, 2, coreX, coreY, 20 * corePulse + 5);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        coreGrad.addColorStop(0.35, 'rgba(6, 214, 160, 0.75)');
        coreGrad.addColorStop(0.7, 'rgba(114, 9, 183, 0.35)');
        coreGrad.addColorStop(1, 'rgba(6, 214, 160, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(coreX, coreY, 20 * corePulse + 5, 0, Math.PI * 2);
        ctx.fill();

        // 3.4 双肩巨甲面孔血煞魔瞳 (Shoulder Face Eyes)
        const shoulderOffsets = [
          [-38, -16], [38, -16]
        ];
        for (const [sox, soy] of shoulderOffsets) {
          const sx = cx + sox;
          const sy = cy + soy + chestDy;
          const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5 * eyeGlow + 2);
          sGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
          sGrad.addColorStop(0.5, 'rgba(247, 37, 133, 0.7)');
          sGrad.addColorStop(1, 'rgba(247, 37, 133, 0)');
          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, 5 * eyeGlow + 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. 环绕魔尊的无缝幽灵鬼火粒子 (Seamless Orbiting Soul Embers)
        for (const seed of wispSeeds) {
          const ang = seed.phaseOffset + theta * seed.speedMult;
          const rawX = Math.cos(ang) * seed.orbitRx;
          const rawY = Math.sin(ang) * seed.orbitRy;

          const cosA = Math.cos(seed.tilt);
          const sinA = Math.sin(seed.tilt);
          const px = cx + (rawX * cosA - rawY * sinA);
          const py = cy + (rawX * sinA + rawY * cosA);

          const pGrad = ctx.createRadialGradient(px, py, 0, px, py, seed.size * 2.2);
          if (seed.isCyan) {
            pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            pGrad.addColorStop(0.4, 'rgba(6, 214, 160, 0.8)');
            pGrad.addColorStop(0.8, 'rgba(76, 201, 240, 0.3)');
            pGrad.addColorStop(1, 'rgba(6, 214, 160, 0)');
          } else {
            pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            pGrad.addColorStop(0.5, 'rgba(247, 37, 133, 0.7)');
            pGrad.addColorStop(0.8, 'rgba(114, 9, 183, 0.25)');
            pGrad.addColorStop(1, 'rgba(114, 9, 183, 0)');
          }
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(px, py, seed.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore(); // 结束加色
        ctx.restore(); // 结束单帧裁剪
      }

      window.__asuraSheetBase64 = cvs.toDataURL('image/png');
    });
  </script>
  </body>
  </html>`;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  // 等待渲染完毕
  await new Promise(r => setTimeout(r, 600));

  const base64 = await win.webContents.executeJavaScript('window.__asuraSheetBase64');
  if (!base64 || !base64.startsWith('data:image/png;base64,')) {
    console.error('Failed to generate spritesheet data URL');
    process.exit(1);
  }

  const cleanData = base64.replace(/^data:image\/png;base64,/, '');
  const outPath = path.join(__dirname, '..', 'public', 'boss_asura_demon_sheet.png');
  fs.writeFileSync(outPath, cleanData, 'base64');

  const stat = fs.statSync(outPath);
  console.log(`Successfully generated boss_asura_demon_sheet.png (${stat.size} bytes, 720x360, 8 frames)!`);

  app.quit();
});
