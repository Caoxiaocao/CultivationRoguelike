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
  <body>
    <canvas id="cvs_fireball" width="256" height="256"></canvas>
    <canvas id="cvs_lava" width="512" height="512"></canvas>
  <script>
    // ========================================================
    // 1. 赤炼火弹 (Chilian Fire Orb / Red Dragon Fireball)
    // 尺寸: 256x256, 中心: (128, 128)
    // 风格: 仙侠炽烈龙煞真火弹丸，白炽金核、螺旋龙炎气流、赤红外焰流光
    // ========================================================
    function drawFireball() {
      const c = document.getElementById('cvs_fireball');
      const ctx = c.getContext('2d');
      const cx = 128, cy = 128;

      ctx.clearRect(0, 0, 256, 256);

      // 1. 外围龙煞火光柔和外晕 (Outer Soft Glow Aura)
      const outerGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120);
      outerGlow.addColorStop(0, 'rgba(255, 60, 20, 0.45)');
      outerGlow.addColorStop(0.4, 'rgba(220, 20, 40, 0.25)');
      outerGlow.addColorStop(0.7, 'rgba(160, 10, 30, 0.1)');
      outerGlow.addColorStop(1, 'rgba(80, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fill();

      // 2. 环绕龙火旋涡焰舌 (Swirling Dragon Flame Tendrils)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) {
        const baseAng = (i / 16) * Math.PI * 2;
        const len = 50 + (i % 3) * 22;
        const width = 12 + (i % 2) * 8;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(baseAng);

        const flameGrad = ctx.createLinearGradient(0, 0, len, 0);
        flameGrad.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
        flameGrad.addColorStop(0.4, 'rgba(255, 80, 20, 0.7)');
        flameGrad.addColorStop(0.8, 'rgba(200, 10, 30, 0.4)');
        flameGrad.addColorStop(1, 'rgba(120, 0, 10, 0)');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(15, -width * 0.3);
        ctx.quadraticCurveTo(len * 0.5, -width, len, 0);
        ctx.quadraticCurveTo(len * 0.5, width * 0.5, 15, width * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 3. 次级逆向旋转烈焰游丝 (Counter-rotating Inner Flame Wisps)
      for (let i = 0; i < 12; i++) {
        const ang = -(i / 12) * Math.PI * 2 + 0.3;
        const len = 35 + (i % 4) * 15;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang);

        const wispGrad = ctx.createLinearGradient(0, 0, len, 0);
        wispGrad.addColorStop(0, 'rgba(255, 240, 150, 0.95)');
        wispGrad.addColorStop(0.5, 'rgba(255, 120, 20, 0.8)');
        wispGrad.addColorStop(1, 'rgba(220, 30, 10, 0)');

        ctx.fillStyle = wispGrad;
        ctx.beginPath();
        ctx.moveTo(10, -5);
        ctx.quadraticCurveTo(len * 0.6, -10, len, 0);
        ctx.quadraticCurveTo(len * 0.4, 6, 10, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 4. 中层赤炼火丹球体 (Mid Dragon Pearl Sphere)
      const midGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 48);
      midGrad.addColorStop(0, 'rgba(255, 255, 220, 1)');
      midGrad.addColorStop(0.25, 'rgba(255, 200, 60, 0.98)');
      midGrad.addColorStop(0.55, 'rgba(255, 80, 20, 0.92)');
      midGrad.addColorStop(0.85, 'rgba(200, 15, 30, 0.65)');
      midGrad.addColorStop(1, 'rgba(120, 0, 10, 0)');
      ctx.fillStyle = midGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.fill();

      // 5. 核心白炽龙煞真印 (White-Hot Core with Dragon Eye Slit)
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, 'rgba(255, 250, 200, 0.98)');
      coreGrad.addColorStop(0.75, 'rgba(255, 180, 50, 0.9)');
      coreGrad.addColorStop(1, 'rgba(255, 70, 10, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();

      // 6. 核心竖瞳神光与十字芒 (Golden Dragon Eye Flare)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 28);
      ctx.lineTo(cx, cy + 28);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 220, 100, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx + 20, cy);
      ctx.stroke();

      // 7. 外散龙炎碎火星点 (Sparks & Embers)
      for (let s = 0; s < 28; s++) {
        const sAng = Math.random() * Math.PI * 2;
        const sDist = 30 + Math.random() * 80;
        const sR = 1.2 + Math.random() * 2.5;
        const sx = cx + Math.cos(sAng) * sDist;
        const sy = cy + Math.sin(sAng) * sDist;
        ctx.fillStyle = s % 2 === 0 ? 'rgba(255, 220, 100, 0.85)' : 'rgba(255, 90, 30, 0.8)';
        ctx.beginPath();
        ctx.arc(sx, sy, sR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      return c.toDataURL('image/png');
    }

    // ========================================================
    // 2. 地脉火煞 (Earth Vein Fire Fiend / Ground Magma Formation)
    // 尺寸: 512x512, 中心: (256, 256)
    // 风格: 仙侠太古赤龙焚天法阵、地裂熔岩脉络、八荒火煞神符、炽烈爆冲真印
    // ========================================================
    function drawLavaFormation() {
      const c = document.getElementById('cvs_lava');
      const ctx = c.getContext('2d');
      const cx = 256, cy = 256;

      ctx.clearRect(0, 0, 512, 512);

      // 1. 底层地脉焦痕暗影与煞气光晕 (Base Burnt Ground & Crimson Aura)
      const baseAura = ctx.createRadialGradient(cx, cy, 30, cx, cy, 245);
      baseAura.addColorStop(0, 'rgba(255, 80, 20, 0.55)');
      baseAura.addColorStop(0.35, 'rgba(180, 20, 20, 0.35)');
      baseAura.addColorStop(0.65, 'rgba(80, 10, 15, 0.2)');
      baseAura.addColorStop(0.9, 'rgba(30, 5, 5, 0.1)');
      baseAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = baseAura;
      ctx.beginPath();
      ctx.arc(cx, cy, 245, 0, Math.PI * 2);
      ctx.fill();

      // 2. 地裂熔岩纹理 (Procedural Volcanic Magma Cracks)
      ctx.save();
      // 预先设定几种主裂隙路径
      const crackBranches = [
        [ [0,0], [25, 30], [55, 50], [90, 85], [130, 110], [175, 140], [210, 155] ],
        [ [0,0], [-30, 20], [-65, 45], [-110, 70], [-150, 115], [-195, 145] ],
        [ [0,0], [15, -35], [40, -75], [60, -120], [95, -165], [135, -200] ],
        [ [0,0], [-25, -30], [-55, -60], [-85, -105], [-130, -145], [-170, -185] ],
        [ [0,0], [35, -5], [80, 10], [125, -15], [165, 5], [215, 10] ],
        [ [0,0], [-40, -10], [-90, -5], [-135, -20], [-180, -15], [-220, -35] ],
        [ [0,0], [10, 45], [0, 90], [25, 135], [15, 175], [40, 215] ],
        [ [0,0], [-10, -45], [-20, -90], [-10, -140], [-30, -185], [-20, -225] ]
      ];

      // 绘制深红底层焦黑岩缝 (Deep Dark Fissures)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(60, 5, 5, 0.85)';
      ctx.lineWidth = 14;
      for (const branch of crackBranches) {
        ctx.beginPath();
        for (let i = 0; i < branch.length; i++) {
          const pt = branch[i];
          if (i === 0) ctx.moveTo(cx + pt[0], cy + pt[1]);
          else ctx.lineTo(cx + pt[0], cy + pt[1]);
        }
        ctx.stroke();
      }

      // 绘制炽红熔岩层 (Red Molten Lava Layer)
      ctx.strokeStyle = 'rgba(230, 40, 20, 0.9)';
      ctx.lineWidth = 7;
      for (const branch of crackBranches) {
        ctx.beginPath();
        for (let i = 0; i < branch.length; i++) {
          const pt = branch[i];
          if (i === 0) ctx.moveTo(cx + pt[0], cy + pt[1]);
          else ctx.lineTo(cx + pt[0], cy + pt[1]);
        }
        ctx.stroke();
      }

      // 绘制金黄沸腾岩浆核心 (Boiling Yellow Magma Core)
      ctx.strokeStyle = 'rgba(255, 200, 50, 0.95)';
      ctx.lineWidth = 3;
      for (const branch of crackBranches) {
        ctx.beginPath();
        for (let i = 0; i < branch.length; i++) {
          const pt = branch[i];
          if (i === 0) ctx.moveTo(cx + pt[0], cy + pt[1]);
          else ctx.lineTo(cx + pt[0], cy + pt[1]);
        }
        ctx.stroke();
      }

      // 绘制白炽岩浆节点 (White-Hot Nodes)
      ctx.fillStyle = '#ffffff';
      for (const branch of crackBranches) {
        for (let i = 1; i < branch.length; i += 2) {
          const pt = branch[i];
          ctx.beginPath();
          ctx.arc(cx + pt[0], cy + pt[1], 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 3. 太古赤蛟八荒火煞符阵 (Ancient Dragon Formation Rings & Trigrams)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // (1) 外围主法阵金红光环 (Outer Flame Circle)
      ctx.strokeStyle = 'rgba(255, 80, 20, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 220, 0, Math.PI * 2);
      ctx.stroke();

      // (2) 环带内的八荒符文刻线 (Inner Ring with Dashed Runes)
      ctx.strokeStyle = 'rgba(255, 180, 40, 0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, 208, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(255, 100, 30, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 196, 0, Math.PI * 2);
      ctx.stroke();

      // (3) 八方煞印符柱与龙头獠牙 (8 Cardinal Dragon Fang Runes)
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang);

        // 放射煞刃
        ctx.fillStyle = 'rgba(255, 190, 50, 0.9)';
        ctx.beginPath();
        ctx.moveTo(196, -6);
        ctx.lineTo(235, 0);
        ctx.lineTo(196, 6);
        ctx.closePath();
        ctx.fill();

        // 符文节点圆点
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(196, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // 外层龙角符标
        ctx.strokeStyle = 'rgba(255, 220, 90, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(208, 0, 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // (4) 十六方回字龙鳞煞纹 (16 Dragon Scales around Ring)
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2 + Math.PI / 16;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang);

        ctx.strokeStyle = 'rgba(255, 140, 30, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(202, 0, 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // 4. 中圈太极离火阵眼 (Middle Hexagram / Taiji Fire Ring)
      ctx.strokeStyle = 'rgba(255, 160, 40, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 130, 0, Math.PI * 2);
      ctx.stroke();

      // 交叉正八角星煞纹 (Intersecting 8-Point Star)
      ctx.strokeStyle = 'rgba(255, 80, 20, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a1 = (i / 8) * Math.PI * 2;
        const a2 = ((i + 3) / 8) * Math.PI * 2;
        ctx.moveTo(cx + Math.cos(a1) * 130, cy + Math.sin(a1) * 130);
        ctx.lineTo(cx + Math.cos(a2) * 130, cy + Math.sin(a2) * 130);
      }
      ctx.stroke();

      // 5. 核心地火熔岩爆冲真印 (Central Boiling Magma Cauldron & Dragon Crest)
      const centerCauldron = ctx.createRadialGradient(cx, cy, 10, cx, cy, 80);
      centerCauldron.addColorStop(0, 'rgba(255, 255, 255, 1)');
      centerCauldron.addColorStop(0.2, 'rgba(255, 230, 80, 0.95)');
      centerCauldron.addColorStop(0.5, 'rgba(255, 90, 20, 0.9)');
      centerCauldron.addColorStop(0.8, 'rgba(180, 15, 25, 0.6)');
      centerCauldron.addColorStop(1, 'rgba(80, 0, 10, 0)');
      ctx.fillStyle = centerCauldron;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();

      // 核心赤炼蛟龙头印记 (Central Dragon Head Silhouette Emblem)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      // 简化高精龙首剪影
      ctx.moveTo(cx, cy - 35);
      ctx.lineTo(cx + 12, cy - 20);
      ctx.lineTo(cx + 25, cy - 25); // 右角
      ctx.lineTo(cx + 16, cy - 10);
      ctx.lineTo(cx + 28, cy + 5);  // 右腮
      ctx.lineTo(cx + 12, cy + 22); // 龙吻右侧
      ctx.lineTo(cx, cy + 30);      // 龙吻尖
      ctx.lineTo(cx - 12, cy + 22); // 龙吻左侧
      ctx.lineTo(cx - 28, cy + 5);  // 左腮
      ctx.lineTo(cx - 16, cy - 10);
      ctx.lineTo(cx - 25, cy - 25); // 左角
      ctx.lineTo(cx - 12, cy - 20);
      ctx.closePath();
      ctx.fill();

      // 龙目赤芒 (Red Dragon Eyes)
      ctx.fillStyle = '#ff1100';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 6, 3, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 6, 3, 0, Math.PI * 2);
      ctx.fill();

      // 6. 飞溅流火爆星 (Sparks & Flying Lava Droplets)
      for (let p = 0; p < 48; p++) {
        const pAng = Math.random() * Math.PI * 2;
        const pDist = 20 + Math.random() * 210;
        const pR = 1.5 + Math.random() * 3.5;
        const px = cx + Math.cos(pAng) * pDist;
        const py = cy + Math.sin(pAng) * pDist;
        ctx.fillStyle = p % 3 === 0 ? 'rgba(255, 255, 200, 0.9)' : (p % 3 === 1 ? 'rgba(255, 180, 50, 0.85)' : 'rgba(255, 60, 30, 0.8)');
        ctx.beginPath();
        ctx.arc(px, py, pR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      return c.toDataURL('image/png');
    }

    // 导出两张贴图的 Base64
    window.__textureData = {
      fireball: drawFireball(),
      lava: drawLavaFormation()
    };
  </script>
  </body>
  </html>`;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  const data = await win.webContents.executeJavaScript('window.__textureData');

  const publicDir = path.join(__dirname, '..', 'public');

  // 保存赤炼火弹贴图
  const fbBase64 = data.fireball.replace(/^data:image\/png;base64,/, '');
  const fbPath = path.join(publicDir, 'effect_dragon_fireball.png');
  fs.writeFileSync(fbPath, fbBase64, 'base64');
  console.log('Successfully generated effect_dragon_fireball.png, size:', fs.statSync(fbPath).size);

  // 保存地脉火煞贴图
  const lavaBase64 = data.lava.replace(/^data:image\/png;base64,/, '');
  const lavaPath = path.join(publicDir, 'effect_dragon_lava.png');
  fs.writeFileSync(lavaPath, lavaBase64, 'base64');
  console.log('Successfully generated effect_dragon_lava.png, size:', fs.statSync(lavaPath).size);

  app.quit();
});
