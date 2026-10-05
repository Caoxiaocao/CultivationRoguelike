const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 1000,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const pubDir = path.join(__dirname, '..', 'public');
  const artifactDir = path.join('C:', 'Users', 'Administrator', '.gemini', 'antigravity', 'brain', 'bce5c981-c741-4fb6-b269-6bc282a5d487');

  const b64ThunderArray = fs.readFileSync(path.join(pubDir, 'effect_primordial_thunder_array.png')).toString('base64');
  const b64ThunderStrike = fs.readFileSync(path.join(pubDir, 'effect_primordial_thunder_strike.png')).toString('base64');
  const b64Blade = fs.readFileSync(path.join(pubDir, 'effect_primordial_blade.png')).toString('base64');
  const b64Orb = fs.readFileSync(path.join(pubDir, 'effect_primordial_orb.png')).toString('base64');

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; background: #060911; color: #fff; font-family: 'Segoe UI', PingFang SC, sans-serif; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <img id="img_thunder_array" src="data:image/png;base64,${b64ThunderArray}" style="display:none;" />
    <img id="img_thunder_strike" src="data:image/png;base64,${b64ThunderStrike}" style="display:none;" />
    <img id="img_blade" src="data:image/png;base64,${b64Blade}" style="display:none;" />
    <img id="img_orb" src="data:image/png;base64,${b64Orb}" style="display:none;" />
    <canvas id="cvs" width="1360" height="960"></canvas>

    <script>
      window.addEventListener('load', () => {
        const cvs = document.getElementById('cvs');
        const ctx = cvs.getContext('2d');
        const W = cvs.width;
        const H = cvs.height;

        const imgArray = document.getElementById('img_thunder_array');
        const imgStrike = document.getElementById('img_thunder_strike');
        const imgBlade = document.getElementById('img_blade');
        const imgOrb = document.getElementById('img_orb');

        // 背景：深邃水墨太虚星图
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#04070d');
        bgGrad.addColorStop(0.5, '#0a101d');
        bgGrad.addColorStop(1, '#050913');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // 细微星界星图底纹
        for (let i = 0; i < 70; i++) {
          const sx = (Math.sin(i * 123) * 0.5 + 0.5) * W;
          const sy = (Math.cos(i * 47) * 0.5 + 0.5) * H;
          ctx.fillStyle = i % 2 === 0 ? 'rgba(76, 201, 240, 0.25)' : 'rgba(255, 215, 0, 0.2)';
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3) + 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // 顶栏大标题
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 28px "Segoe UI", PingFang SC';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
        ctx.shadowBlur = 12;
        ctx.fillText('混沌太虚道祖 · 专属攻击弹幕与神雷法阵全新重构对战展示', W / 2, 45);

        ctx.font = '14px "Segoe UI", PingFang SC';
        ctx.fillStyle = '#94a3b8';
        ctx.shadowBlur = 0;
        ctx.fillText('彻底废除旧版占位符实心青饼与几何方块，实装太虚八卦雷盘、九天雷核爆裂、太虚裂空星刃与混沌太极玄珠', W / 2, 75);

        // 分割线
        ctx.strokeStyle = 'rgba(76, 201, 240, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 95);
        ctx.lineTo(W - 40, 95);
        ctx.stroke();

        // 4 个特效单体卡片 (上排 4 列)
        const cards = [
          {
            title: '① 太虚乾坤八卦雷盘',
            sub: '真卷启灵 · 预警法阵 (256×256)',
            desc: '金色八卦爻位 + 16外圈天道云篆 + 中心旋转太极雷眼，告别实心色块遮挡！',
            draw: (cx, cy) => {
              ctx.save();
              ctx.globalCompositeOperation = 'lighter';
              ctx.drawImage(imgArray, cx - 95, cy - 95, 190, 190);
              ctx.restore();
            }
          },
          {
            title: '② 九天玄刹天劫雷爆',
            sub: '神雷轰顶 · 爆裂雷核 (256×256)',
            desc: '中心超高温白炽雷核 + 12道辐射状破空电浆裂隙，贯穿天地的紫金天劫雷柱！',
            draw: (cx, cy) => {
              ctx.save();
              ctx.globalCompositeOperation = 'lighter';
              ctx.drawImage(imgStrike, cx - 95, cy - 95, 190, 190);
              ctx.restore();
            }
          },
          {
            title: '③ 太虚裂空星刃飞刃',
            sub: '拂尘裂空 · 攻击飞刃 (128×64)',
            desc: '剔透碧玉青晶刃体 + 白炽锋芒 + 幽紫虚空彗星拖芒 + 护体诛仙飞剑升级！',
            draw: (cx, cy) => {
              ctx.save();
              ctx.globalCompositeOperation = 'lighter';
              // 绘制多枚不同朝向的飞刃
              ctx.save();
              ctx.translate(cx, cy - 25);
              ctx.drawImage(imgBlade, -70, -35, 140, 70);
              ctx.restore();

              ctx.save();
              ctx.translate(cx, cy + 35);
              ctx.rotate(Math.PI / 4);
              ctx.drawImage(imgBlade, -50, -25, 100, 50);
              ctx.restore();
              ctx.restore();
            }
          },
          {
            title: '④ 混沌太极玄珠',
            sub: '阴阳道珠 · 吸积引力珠 (64×64)',
            desc: '深邃暗物质核心 + 螺旋太极吸积旋臂 + 天道金轮环绕 + 幽紫引力微粒！',
            draw: (cx, cy) => {
              ctx.save();
              ctx.save();
              ctx.translate(cx, cy - 20);
              ctx.drawImage(imgOrb, -45, -45, 90, 90);
              ctx.restore();

              ctx.save();
              ctx.translate(cx, cy + 40);
              ctx.drawImage(imgOrb, -30, -30, 60, 60);
              ctx.restore();
              ctx.restore();
            }
          }
        ];

        const cardW = 300;
        const cardH = 340;
        const cardY = 115;
        const gap = (W - 80 - cardW * 4) / 3;

        cards.forEach((c, idx) => {
          const cardX = 40 + idx * (cardW + gap);

          // 卡片背景底框
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.strokeStyle = 'rgba(76, 201, 240, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, 10);
          ctx.fill();
          ctx.stroke();

          // 卡片内发光圆底
          const cGrad = ctx.createRadialGradient(cardX + cardW / 2, cardY + 120, 10, cardX + cardW / 2, cardY + 120, 110);
          cGrad.addColorStop(0, 'rgba(76, 201, 240, 0.12)');
          cGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = cGrad;
          ctx.fillRect(cardX + 5, cardY + 5, cardW - 10, 220);

          // 特效绘制
          c.draw(cardX + cardW / 2, cardY + 115);

          // 文本说明
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 16px "Segoe UI", PingFang SC';
          ctx.fillText(c.title, cardX + cardW / 2, cardY + 248);

          ctx.fillStyle = '#38bdf8';
          ctx.font = '12px "Segoe UI", PingFang SC';
          ctx.fillText(c.sub, cardX + cardW / 2, cardY + 270);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px "Segoe UI", PingFang SC';
          ctx.fillText(c.desc.slice(0, 24), cardX + cardW / 2, cardY + 295);
          ctx.fillText(c.desc.slice(24), cardX + cardW / 2, cardY + 315);
          ctx.restore();
        });

        // 下半部分：实机战斗全景模拟 (对比旧版痛点与新版视觉)
        const sceneY = 485;
        const sceneH = 435;
        const halfW = (W - 100) / 2;

        // 左半边：旧版问题重现 (大实心圆饼遮挡、方块弹幕、通用红冲刺)
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(40, sceneY, halfW, sceneH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px "Segoe UI", PingFang SC';
        ctx.textAlign = 'left';
        ctx.fillText('❌ 优化前旧版（用户实机截图痛点）', 55, sceneY + 30);
        ctx.font = '12px "Segoe UI", PingFang SC';
        ctx.fillStyle = '#f87171';
        ctx.fillText('• 粗糙开发期实心大青圆 (fillStyle: rgba) 严重遮挡地图', 55, sceneY + 54);
        ctx.fillText('• 冲刺预警为通用红框，弹幕为单薄实心矩形与黄色多边形', 55, sceneY + 72);

        // 绘制旧版粗糙青圆
        const oldAoECx = 40 + halfW * 0.35;
        const oldAoECy = sceneY + 240;
        ctx.save();
        ctx.fillStyle = 'rgba(76, 201, 240, 0.38)';
        ctx.beginPath();
        ctx.arc(oldAoECx, oldAoECy, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([10, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(oldAoECx, oldAoECy, 44, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 绘制旧版矩形弹幕
        const oldProjX = 40 + halfW * 0.75;
        const oldProjY = sceneY + 200;
        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(oldProjX - 16, oldProjY - 2, 32, 4);
        ctx.fillStyle = '#4cc9f0';
        ctx.beginPath();
        ctx.moveTo(oldProjX + 20, oldProjY);
        ctx.lineTo(oldProjX - 12, oldProjY - 4);
        ctx.lineTo(oldProjX - 8, oldProjY);
        ctx.lineTo(oldProjX - 12, oldProjY + 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 绘制旧版冲刺红框
        ctx.save();
        ctx.fillStyle = 'rgba(230, 57, 70, 0.18)';
        ctx.fillRect(40 + 50, sceneY + 340, 260, 40);
        ctx.strokeStyle = '#e63946';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(40 + 50, sceneY + 340, 260, 40);
        ctx.setLineDash([]);
        ctx.fillStyle = '#e63946';
        ctx.font = '11px sans-serif';
        ctx.fillText('通用怪物红色冲刺带', 40 + 60, sceneY + 365);
        ctx.restore();

        ctx.restore();

        // 右半边：优化后新版实装展示
        const rightX = 40 + halfW + 20;
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(rightX, sceneY, halfW, sceneH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px "Segoe UI", PingFang SC';
        ctx.textAlign = 'left';
        ctx.fillText('✔ 优化后当前版本（高清贴图与专属太虚仙侠克系法阵）', rightX + 15, sceneY + 30);
        ctx.font = '12px "Segoe UI", PingFang SC';
        ctx.fillStyle = '#34d399';
        ctx.fillText('• 太虚乾坤雷纹阵盘空心旋转，透亮不挡岛屿，外围天道金纹环绕', rightX + 15, sceneY + 54);
        ctx.fillText('• 太虚裂空星刃与混沌太极玄珠高速齐射，伴随虚空微晶与星辉拖尾', rightX + 15, sceneY + 72);

        // 绘制新版太虚八卦雷盘
        const newAoECx = rightX + halfW * 0.35;
        const newAoECy = sceneY + 230;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(imgArray, newAoECx - 90, newAoECy - 90, 180, 180);
        // 危险边界太乙金蓝法环
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.arc(newAoECx, newAoECy, 80, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // 向内聚拢线
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(newAoECx, newAoECy, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 绘制新版星刃与玄珠弹幕
        const newProjX = rightX + halfW * 0.75;
        const newProjY = sceneY + 180;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(imgBlade, newProjX - 35, newProjY - 17, 70, 35);
        ctx.drawImage(imgBlade, newProjX - 15, newProjY + 30, 60, 30);
        ctx.restore();

        ctx.save();
        ctx.drawImage(imgOrb, newProjX - 70, newProjY + 15, 36, 36);
        ctx.restore();

        // 绘制太虚折跃空间撕裂裂痕
        ctx.save();
        const riftY = sceneY + 340;
        const riftW = 280;
        const riftH = 46;
        const riftGrad = ctx.createLinearGradient(rightX + 30, riftY, rightX + 30, riftY + riftH);
        riftGrad.addColorStop(0, 'rgba(114, 9, 183, 0)');
        riftGrad.addColorStop(0.2, 'rgba(114, 9, 183, 0.25)');
        riftGrad.addColorStop(0.5, 'rgba(76, 201, 240, 0.35)');
        riftGrad.addColorStop(0.8, 'rgba(114, 9, 183, 0.25)');
        riftGrad.addColorStop(1, 'rgba(114, 9, 183, 0)');
        ctx.fillStyle = riftGrad;
        ctx.fillRect(rightX + 30, riftY, riftW, riftH);

        // 中心空间撕裂线
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(rightX + 30, riftY + riftH / 2);
        ctx.lineTo(rightX + 30 + riftW * 0.8, riftY + riftH / 2);
        ctx.stroke();

        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([12, 8]);
        ctx.strokeRect(rightX + 30, riftY, riftW, riftH);
        ctx.setLineDash([]);
        ctx.fillStyle = '#4cc9f0';
        ctx.font = '11px sans-serif';
        ctx.fillText('太虚折跃 · 空间撕裂虚空通道', rightX + 40, riftY + 28);
        ctx.restore();

        ctx.restore();

        window.__showcaseBase64 = cvs.toDataURL('image/png');
      });
    </script>
  </body>
  </html>`;

  const tempHtmlPath = path.join(__dirname, 'temp_effects_showcase.html');
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  await win.loadFile(tempHtmlPath);
  await new Promise(r => setTimeout(r, 1500));

  const showcaseB64 = await win.webContents.executeJavaScript('window.__showcaseBase64');
  if (showcaseB64) {
    const pubPath = path.join(pubDir, 'primordial_god_effects_showcase.png');
    const artPath = path.join(artifactDir, 'primordial_god_effects_showcase.png');
    const buf = Buffer.from(showcaseB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(pubPath, buf);
    fs.writeFileSync(artPath, buf);
    console.log(`Generated showcase: ${pubPath} (${buf.length} bytes)`);
    console.log(`Saved artifact: ${artPath}`);
  }

  try {
    fs.unlinkSync(tempHtmlPath);
  } catch (e) {}

  app.quit();
});
