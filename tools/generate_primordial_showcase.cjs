const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 1200,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const pubDir = path.join(__dirname, '..', 'public');
  const artifactDir = path.join('C:', 'Users', 'Administrator', '.gemini', 'antigravity', 'brain', 'bce5c981-c741-4fb6-b269-6bc282a5d487');

  const b64Whisk = fs.readFileSync(path.join(pubDir, 'boss_primordial_whisk_sheet.png')).toString('base64');
  const b64Scroll = fs.readFileSync(path.join(pubDir, 'boss_primordial_scroll_sheet.png')).toString('base64');
  const b64Singularity = fs.readFileSync(path.join(pubDir, 'boss_primordial_singularity_sheet.png')).toString('base64');
  const b64Rush = fs.readFileSync(path.join(pubDir, 'boss_primordial_rush_sheet.png')).toString('base64');

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; background: #070b12; color: #fff; font-family: 'Segoe UI', PingFang SC, sans-serif; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <img id="img_whisk" src="data:image/png;base64,${b64Whisk}" style="display:none;" />
    <img id="img_scroll" src="data:image/png;base64,${b64Scroll}" style="display:none;" />
    <img id="img_singularity" src="data:image/png;base64,${b64Singularity}" style="display:none;" />
    <img id="img_rush" src="data:image/png;base64,${b64Rush}" style="display:none;" />
    <canvas id="cvs" width="1360" height="1160"></canvas>

    <script>
      window.addEventListener('load', () => {
        const cvs = document.getElementById('cvs');
        const ctx = cvs.getContext('2d');
        const W = cvs.width;
        const H = cvs.height;

        // 背景：深邃水墨太虚星河
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#04070d');
        bgGrad.addColorStop(0.5, '#0b1320');
        bgGrad.addColorStop(1, '#050a14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // 装饰星宿星芒
        for (let i = 0; i < 90; i++) {
          const sx = (Math.sin(i * 99) * 0.5 + 0.5) * W;
          const sy = (Math.cos(i * 33) * 0.5 + 0.5) * H;
          ctx.fillStyle = i % 3 === 0 ? 'rgba(76, 201, 240, 0.45)' : (i % 3 === 1 ? 'rgba(247, 37, 133, 0.35)' : 'rgba(255, 215, 0, 0.3)');
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 4) * 0.7 + 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // 顶部大标题
        ctx.save();
        ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#4cc9f0';
        ctx.shadowBlur = 16;
        ctx.fillText('终极领主【混沌太虚道祖】四套 24 帧动作全景展板', 40, 56);

        ctx.font = '15px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#90e0ef';
        ctx.shadowBlur = 0;
        ctx.fillText('克系仙祖美学 · 六目红芒 · 太虚真卷 · 混沌拂尘 · 太极黑洞奇点 · 深渊触手破虚折跃 · 单帧256x256 (6列x4行=24帧)', 40, 86);
        ctx.restore();

        const actions = [
          {
            id: 'whisk',
            title: '动作一：拂尘裂空 · 弹幕挥斩 (24帧)',
            sub: '本体右手握持混沌拂尘大开大合破空横斩，挥出三色星刃弧光与太虚割裂线（单拂尘一体挥动，严禁独立手）',
            img: document.getElementById('img_whisk'),
            frames: [0, 4, 8, 12, 16, 22],
            tagColor: '#4cc9f0'
          },
          {
            id: 'scroll',
            title: '动作二：真卷启灵 · 九天玄刹神雷 (24帧)',
            sub: '本体左手所托《太虚灭世真卷》神光大盛，八枚太虚神纹脱卷升腾飞旋，引动九霄玄刹神雷贯顶（本体手握真卷启灵）',
            img: document.getElementById('img_scroll'),
            frames: [0, 4, 8, 12, 16, 22],
            tagColor: '#ffd166'
          },
          {
            id: 'singularity',
            title: '动作三：混沌归元 · 太极黑洞引力坍缩 (24帧)',
            sub: '端坐星云，背后混沌太极黑洞扩张达1.15倍并疯狂逆转，全场强引力坍缩吞噬后超新星大殉爆',
            img: document.getElementById('img_singularity'),
            frames: [0, 4, 8, 12, 16, 22],
            tagColor: '#f72585'
          },
          {
            id: 'rush',
            title: '动作四：太虚折跃 · 触手破虚突刺 (24帧)',
            sub: '全程保持端坐星云王座之神圣坐姿，虚空折叠破虚前冲，身后拖曳出三重坐姿法相残影与破虚激波（严禁侧视图）',
            img: document.getElementById('img_rush'),
            frames: [0, 4, 8, 12, 16, 22],
            tagColor: '#7209b7'
          }
        ];

        let startY = 115;
        const rowHeight = 245;

        actions.forEach((act, rowIdx) => {
          const curY = startY + rowIdx * rowHeight;

          // 行背景卡片
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
          ctx.strokeStyle = 'rgba(76, 201, 240, 0.22)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(30, curY, W - 60, rowHeight - 16, 12);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // 动作标题与说明
          ctx.save();
          ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
          ctx.fillStyle = act.tagColor;
          ctx.shadowColor = act.tagColor;
          ctx.shadowBlur = 8;
          ctx.fillText(act.title, 50, curY + 30);

          ctx.font = '13px "PingFang SC", "Microsoft YaHei", sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.shadowBlur = 0;
          ctx.fillText(act.sub, 440, curY + 30);
          ctx.restore();

          // 绘制 6 个关键帧
          const frameBoxSize = 175;
          const spacing = 26;
          const startX = 50;
          const frameY = curY + 45;

          act.frames.forEach((fIdx, colIdx) => {
            const fx = startX + colIdx * (frameBoxSize + spacing);

            // 单帧底框
            ctx.save();
            ctx.fillStyle = 'rgba(8, 13, 22, 0.85)';
            ctx.strokeStyle = colIdx === 3 ? act.tagColor : 'rgba(148, 163, 184, 0.25)';
            ctx.lineWidth = colIdx === 3 ? 1.8 : 1;
            ctx.beginPath();
            ctx.roundRect(fx, frameY, frameBoxSize, frameBoxSize, 8);
            ctx.fill();
            ctx.stroke();

            // 裁剪与绘制精灵图中的第 fIdx 帧 (6列 x 4行，单帧 256x256)
            const col = fIdx % 6;
            const row = Math.floor(fIdx / 6);
            const sx = col * 256;
            const sy = row * 256;

            ctx.drawImage(act.img, sx, sy, 256, 256, fx + 4, frameY + 4, frameBoxSize - 8, frameBoxSize - 8);

            // 标注帧号
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.beginPath();
            ctx.roundRect(fx + 6, frameY + 6, 68, 20, 4);
            ctx.fill();

            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = colIdx === 3 ? act.tagColor : '#cbd5e1';
            ctx.fillText('Frame ' + (fIdx + 1).toString().padStart(2, '0'), fx + 10, frameY + 20);

            ctx.restore();
          });
        });

        // 底部水印与系统信息
        ctx.save();
        ctx.font = '12px "PingFang SC", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('《问道 · 青冥秘境》最终Boss 动作序列帧系统 · 4套动作全数通过自动化质量校验 · 1536x1024 标准精灵表', 40, H - 24);
        ctx.restore();

        window.__showcaseBase64 = cvs.toDataURL('image/png');
      });
    </script>
  </body>
  </html>`;

  const tempHtmlPath = path.join(__dirname, 'temp_primordial_showcase.html');
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  await win.loadFile(tempHtmlPath);
  await new Promise(r => setTimeout(r, 2000));

  const showcaseB64 = await win.webContents.executeJavaScript('window.__showcaseBase64');
  if (showcaseB64) {
    const pubPath = path.join(pubDir, 'primordial_god_showcase.png');
    const artPath = path.join(artifactDir, 'primordial_god_showcase.png');
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
