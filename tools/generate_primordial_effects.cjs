/**
 * tools/generate_primordial_effects.cjs
 * 混沌太虚道祖 专属攻击特效与法阵高清贴图生成器
 * 1. effect_primordial_thunder_array.png (256x256) - 太虚灭世真卷 · 天道禁断九天玄刹雷劫法阵
 * 2. effect_primordial_thunder_strike.png (256x256) - 九天玄刹神雷 · 天劫霹雳爆裂
 * 3. effect_primordial_blade.png (128x64) - 太虚裂空星刃 (飞刃弹幕)
 * 4. effect_primordial_orb.png (64x64) - 混沌太极玄珠 (暗物质阴阳道珠)
 */

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: transparent; margin: 0;">
    <canvas id="cvs_array" width="256" height="256"></canvas>
    <canvas id="cvs_strike" width="256" height="256"></canvas>
    <canvas id="cvs_blade" width="128" height="64"></canvas>
    <canvas id="cvs_orb" width="64" height="64"></canvas>

  <script>
    window.addEventListener('load', () => {
      // 辅助函数：绘制平滑电浆光弧
      function drawLightning(ctx, x1, y1, x2, y2, segments = 5, roughness = 8, color = '#ffffff', width = 2) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        let curX = x1;
        let curY = y1;
        for (let i = 1; i < segments; i++) {
          const t = i / segments;
          const targetX = x1 + (x2 - x1) * t;
          const targetY = y1 + (y2 - y1) * t;
          const normalX = -(targetY - curY);
          const normalY = (targetX - curX);
          const len = Math.hypot(normalX, normalY) || 1;
          const offset = (Math.sin(i * 3.7 + t * 9) * roughness);
          curX = targetX + (normalX / len) * offset;
          curY = targetY + (normalY / len) * offset;
          ctx.lineTo(curX, curY);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      }

      // =========================================================================
      // 1. 太虚灭世真卷 · 天道禁断九天玄刹雷劫法阵 (256x256)
      // =========================================================================
      function renderArray() {
        const cvs = document.getElementById('cvs_array');
        const ctx = cvs.getContext('2d');
        const cx = 128, cy = 128;

        // 柔和暗紫虚空星云底蕴
        const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
        bgGrad.addColorStop(0, 'rgba(114, 9, 183, 0.28)');
        bgGrad.addColorStop(0.5, 'rgba(76, 201, 240, 0.16)');
        bgGrad.addColorStop(0.85, 'rgba(16, 185, 129, 0.12)');
        bgGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 124, 0, Math.PI * 2);
        ctx.fill();

        // 1. 最外层：金缮云雷乾坤回纹阵盘边界
        ctx.save();
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#ffd166';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, 120, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(76, 201, 240, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 115, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 八卦太虚卦象与卦爻 (乾 ☰, 坤 ☷, 震 ☳, 巽 ☴, 坎 ☵, 离 ☲, 艮 ☶, 兑 ☱)
        // 0:乾(111), 1:兑(011), 2:离(101), 3:震(001), 4:巽(110), 5:坎(010), 6:艮(100), 7:坤(000)
        const trigrams = [
          [1, 1, 1], // 乾
          [0, 1, 1], // 兑
          [1, 0, 1], // 离
          [0, 0, 1], // 震
          [1, 1, 0], // 巽
          [0, 1, 0], // 坎
          [1, 0, 0], // 艮
          [0, 0, 0]  // 坤
        ];

        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
          ctx.save();
          ctx.translate(cx + Math.cos(ang) * 105, cy + Math.sin(ang) * 105);
          ctx.rotate(ang + Math.PI / 2);

          const lines = trigrams[i];
          ctx.strokeStyle = '#ffd166';
          ctx.shadowColor = '#ffd166';
          ctx.shadowBlur = 6;
          ctx.lineWidth = 2.0;

          for (let l = 0; l < 3; l++) {
            const ly = -6 + l * 5.5;
            if (lines[l] === 1) {
              // 阳爻 (连线)
              ctx.beginPath();
              ctx.moveTo(-11, ly);
              ctx.lineTo(11, ly);
              ctx.stroke();
            } else {
              // 阴爻 (断线)
              ctx.beginPath();
              ctx.moveTo(-11, ly);
              ctx.lineTo(-3, ly);
              ctx.moveTo(3, ly);
              ctx.lineTo(11, ly);
              ctx.stroke();
            }
          }
          ctx.restore();
        }

        // 2. 中层：天道云篆禁断神纹环
        ctx.save();
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#4cc9f0';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, 88, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(cx, cy, 66, 0, Math.PI * 2);
        ctx.stroke();

        // 16 组天道禁断云篆符文印记
        for (let k = 0; k < 16; k++) {
          const kang = (k / 16) * Math.PI * 2;
          const kx = cx + Math.cos(kang) * 77;
          const ky = cy + Math.sin(kang) * 77;
          ctx.save();
          ctx.translate(kx, ky);
          ctx.rotate(kang + Math.PI / 2);
          ctx.strokeStyle = k % 2 === 0 ? '#10b981' : '#4cc9f0';
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 6;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-4, -4);
          ctx.lineTo(4, -4);
          ctx.lineTo(0, 4);
          ctx.lineTo(-2, 0);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();

        // 3. 核心：流转太极阴阳双鱼阵眼
        ctx.save();
        ctx.translate(cx, cy);
        const tr = 42;

        // 太极阴阳外廓光圈
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#4cc9f0';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, tr, 0, Math.PI * 2);
        ctx.stroke();

        // 阳鱼 (青华白芒)
        ctx.fillStyle = 'rgba(76, 201, 240, 0.85)';
        ctx.beginPath();
        ctx.arc(0, 0, tr, -Math.PI / 2, Math.PI / 2, false);
        ctx.arc(0, tr / 2, tr / 2, Math.PI / 2, -Math.PI / 2, true);
        ctx.arc(0, -tr / 2, tr / 2, Math.PI / 2, -Math.PI / 2, false);
        ctx.closePath();
        ctx.fill();

        // 阴鱼 (玄暗紫曜)
        ctx.fillStyle = 'rgba(114, 9, 183, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, tr, Math.PI / 2, -Math.PI / 2, false);
        ctx.arc(0, -tr / 2, tr / 2, -Math.PI / 2, Math.PI / 2, true);
        ctx.arc(0, tr / 2, tr / 2, -Math.PI / 2, Math.PI / 2, false);
        ctx.closePath();
        ctx.fill();

        // 鱼眼
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, -tr / 2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4cc9f0';
        ctx.shadowColor = '#4cc9f0';
        ctx.beginPath();
        ctx.arc(0, tr / 2, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. 四极引雷向心电浆弧
        for (let b = 0; b < 4; b++) {
          const bang = (b / 4) * Math.PI * 2 + Math.PI / 4;
          const x1 = cx + Math.cos(bang) * 115;
          const y1 = cy + Math.sin(bang) * 115;
          const x2 = cx + Math.cos(bang) * 45;
          const y2 = cy + Math.sin(bang) * 45;
          drawLightning(ctx, x1, y1, x2, y2, 4, 6, '#4cc9f0', 1.8);
        }
      }

      // =========================================================================
      // 2. 九天玄刹神雷 · 天劫霹雳爆裂 (256x256)
      // =========================================================================
      function renderStrike() {
        const cvs = document.getElementById('cvs_strike');
        const ctx = cvs.getContext('2d');
        const cx = 128, cy = 128;

        // 核心白炽雷核
        const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 55);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, 'rgba(76, 201, 240, 0.95)');
        coreGrad.addColorStop(0.7, 'rgba(114, 9, 183, 0.7)');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 55, 0, Math.PI * 2);
        ctx.fill();

        // 外围冲击波光环
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#4cc9f0';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(cx, cy, 78, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#7209b7';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 96, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 12 道强辐射放射状撕裂电浆神雷
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2 + (i % 2 === 0 ? 0.1 : -0.1);
          const len = 65 + (i % 3) * 22;
          const x2 = cx + Math.cos(ang) * len;
          const y2 = cy + Math.sin(ang) * len;
          drawLightning(ctx, cx, cy, x2, y2, 5, 10, i % 2 === 0 ? '#ffffff' : '#4cc9f0', 2.8);

          // 分支电弧
          if (i % 2 === 0) {
            const bx = cx + Math.cos(ang) * (len * 0.6);
            const by = cy + Math.sin(ang) * (len * 0.6);
            const bAng = ang + (i % 4 === 0 ? 0.4 : -0.4);
            const bx2 = bx + Math.cos(bAng) * 35;
            const by2 = by + Math.sin(bAng) * 35;
            drawLightning(ctx, bx, by, bx2, by2, 3, 5, '#10b981', 1.8);
          }
        }
      }

      // =========================================================================
      // 3. 太虚裂空星刃 (128x64) - 面向 +X (向右飞行)
      // =========================================================================
      function renderBlade() {
        const cvs = document.getElementById('cvs_blade');
        const ctx = cvs.getContext('2d');
        const w = 128, h = 64;
        const cy = 32;

        ctx.save();
        // 彗尾星云拖芒 (向左延伸淡出)
        const tailGrad = ctx.createLinearGradient(0, cy, 95, cy);
        tailGrad.addColorStop(0, 'transparent');
        tailGrad.addColorStop(0.3, 'rgba(114, 9, 183, 0.45)');
        tailGrad.addColorStop(0.7, 'rgba(76, 201, 240, 0.75)');
        tailGrad.addColorStop(1, '#ffffff');

        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(8, cy);
        ctx.quadraticCurveTo(55, cy - 14, 98, cy - 2);
        ctx.lineTo(122, cy); // 剑尖
        ctx.lineTo(98, cy + 2);
        ctx.quadraticCurveTo(55, cy + 14, 8, cy);
        ctx.closePath();
        ctx.fill();

        // 弧形星刃外轮廓 (白炽锋芒与碧玉剑脊)
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 2.8;
        ctx.shadowColor = '#4cc9f0';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(25, cy - 12);
        ctx.quadraticCurveTo(80, cy - 14, 122, cy);
        ctx.quadraticCurveTo(80, cy + 14, 25, cy + 12);
        ctx.quadraticCurveTo(50, cy, 25, cy - 12);
        ctx.stroke();

        // 核心白炽斩裂光线
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(35, cy);
        ctx.lineTo(120, cy);
        ctx.stroke();

        // 剑脊两极天道微光点
        ctx.fillStyle = '#ffd166';
        ctx.shadowColor = '#ffd166';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(85, cy, 2.5, 0, Math.PI * 2);
        ctx.arc(60, cy, 2.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // =========================================================================
      // 4. 混沌太极玄珠 (64x64)
      // =========================================================================
      function renderOrb() {
        const cvs = document.getElementById('cvs_orb');
        const ctx = cvs.getContext('2d');
        const cx = 32, cy = 32;

        ctx.save();
        // 外围引力吸积光晕
        const auraGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 30);
        auraGrad.addColorStop(0, 'rgba(76, 201, 240, 0.85)');
        auraGrad.addColorStop(0.4, 'rgba(114, 9, 183, 0.7)');
        auraGrad.addColorStop(0.8, 'rgba(247, 37, 133, 0.35)');
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();

        // 混沌暗物质玄珠本体
        const orbGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 20);
        orbGrad.addColorStop(0, '#e0aaff');
        orbGrad.addColorStop(0.3, '#7209b7');
        orbGrad.addColorStop(0.75, '#10002b');
        orbGrad.addColorStop(1, '#000000');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();

        // 玄珠表面阴阳太极旋臂
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#4cc9f0';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, 13, -0.6, Math.PI * 0.6);
        ctx.stroke();

        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#f72585';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, 13, Math.PI * 0.4, Math.PI * 1.6);
        ctx.stroke();

        // 核心奇点高光
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 5, 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      renderArray();
      renderStrike();
      renderBlade();
      renderOrb();

      window.__arrayBase64 = document.getElementById('cvs_array').toDataURL('image/png');
      window.__strikeBase64 = document.getElementById('cvs_strike').toDataURL('image/png');
      window.__bladeBase64 = document.getElementById('cvs_blade').toDataURL('image/png');
      window.__orbBase64 = document.getElementById('cvs_orb').toDataURL('image/png');
    });
  </script>
  </body>
  </html>`;

  const tempHtmlPath = path.join(__dirname, 'temp_gen_effects.html');
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  await win.loadFile(tempHtmlPath);
  await new Promise(r => setTimeout(r, 1200));

  const arrayB64 = await win.webContents.executeJavaScript('window.__arrayBase64');
  const strikeB64 = await win.webContents.executeJavaScript('window.__strikeBase64');
  const bladeB64 = await win.webContents.executeJavaScript('window.__bladeBase64');
  const orbB64 = await win.webContents.executeJavaScript('window.__orbBase64');

  const pubDir = path.join(__dirname, '..', 'public');

  if (arrayB64) {
    const p = path.join(pubDir, 'effect_primordial_thunder_array.png');
    fs.writeFileSync(p, arrayB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${p} (${fs.statSync(p).size} bytes)`);
  }

  if (strikeB64) {
    const p = path.join(pubDir, 'effect_primordial_thunder_strike.png');
    fs.writeFileSync(p, strikeB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${p} (${fs.statSync(p).size} bytes)`);
  }

  if (bladeB64) {
    const p = path.join(pubDir, 'effect_primordial_blade.png');
    fs.writeFileSync(p, bladeB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${p} (${fs.statSync(p).size} bytes)`);
  }

  if (orbB64) {
    const p = path.join(pubDir, 'effect_primordial_orb.png');
    fs.writeFileSync(p, orbB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${p} (${fs.statSync(p).size} bytes)`);
  }

  try { fs.unlinkSync(tempHtmlPath); } catch (e) {}

  console.log('All 4 primordial god effect assets generated successfully!');
  app.quit();
});
