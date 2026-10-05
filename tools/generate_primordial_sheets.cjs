/**
 * tools/generate_primordial_sheets.cjs
 * 混沌太虚道祖 (Primordial Chaos Dao Ancestor) 四大 24 帧专属动作序列帧图集生成器
 * 1. 拂尘裂空 (boss_primordial_whisk_sheet.png) - 24帧 (6x4)
 *    - 纯正本体右手握持拂尘大开大合挥动裂空，严禁额外悬空手/多余拂尘
 * 2. 真卷启灵 (boss_primordial_scroll_sheet.png) - 24帧 (6x4)
 *    - 纯正本体左手所托《太虚灭世真卷》神光大盛、禁断符箓脱卷升腾，严禁额外悬空卷轴
 * 3. 混沌归元 (boss_primordial_singularity_sheet.png) - 24帧 (6x4)
 *    - 端坐星云，身后太极黑洞向心引力坍缩吞噬与超新星大殉爆
 * 4. 太虚折跃 (boss_primordial_rush_sheet.png) - 24帧 (6x4)
 *    - 严格保持端坐星云之神圣坐姿，虚空折叠破虚前冲、多重坐姿法相残影与破虚激波，严禁侧视图
 */

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const godDir = path.join(__dirname, '..', 'public', 'boss_primordial_god');
  const pathSeated = path.join(godDir, 'view_seated_clean.png').replace(/\\/g, '/');
  const pathBodyBase = path.join(godDir, 'body_seated_base.png').replace(/\\/g, '/');
  const pathArmWhisk = path.join(godDir, 'arm_whisk_clean.png').replace(/\\/g, '/');
  const pathVortex = path.join(godDir, 'prop_taiji_vortex.png').replace(/\\/g, '/');
  const pathOrb = path.join(godDir, 'prop_orb.png').replace(/\\/g, '/');

  const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: transparent; margin: 0;">
    <canvas id="cvs_whisk" width="1536" height="1024"></canvas>
    <canvas id="cvs_scroll" width="1536" height="1024"></canvas>
    <canvas id="cvs_singularity" width="1536" height="1024"></canvas>
    <canvas id="cvs_rush" width="1536" height="1024"></canvas>

    <img id="img_seated" src="${pathSeated}" />
    <img id="img_body_base" src="${pathBodyBase}" />
    <img id="img_arm_whisk" src="${pathArmWhisk}" />
    <img id="img_vortex" src="${pathVortex}" />
    <img id="img_orb" src="${pathOrb}" />

  <script>
    window.addEventListener('load', () => {
      const imgSeated = document.getElementById('img_seated');
      const imgBodyBase = document.getElementById('img_body_base');
      const imgArmWhisk = document.getElementById('img_arm_whisk');
      const imgVortex = document.getElementById('img_vortex');
      const imgOrb = document.getElementById('img_orb');

      const cols = 6;
      const rows = 4;
      const totalFrames = 24;
      const frameW = 256;
      const frameH = 256;

      // =========================================================================
      // 辅助函数：绘制平滑电浆光弧与星辰粒子
      // =========================================================================
      function drawCosmicLightning(ctx, x1, y1, x2, y2, segments = 5, roughness = 10, color = '#4cc9f0', width = 2) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
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
          const offset = (Math.sin(i * 4.3 + t * 12) * roughness);
          curX = targetX + (normalX / len) * offset;
          curY = targetY + (normalY / len) * offset;
          ctx.lineTo(curX, curY);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      }

      function drawRuneGlyph(ctx, x, y, size, charCode, color = '#10b981', alpha = 0.8) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = Math.max(0, Math.min(1.0, alpha));
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.5;
        // 抽象天道禁断神纹
        ctx.beginPath();
        const s = size * 0.5;
        ctx.moveTo(-s, -s * 0.5);
        ctx.lineTo(s * 0.8, -s * 0.5);
        ctx.lineTo(0, s * 0.8);
        ctx.lineTo(-s * 0.6, s * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.4, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
      }

      // 增强道祖面部六目红芒与神威（精准聚焦于双目眼眶）
      function drawSixEyes(ctx, headCenterX, eyeCenterY, intensity = 1.0) {
        if (intensity <= 0.05) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 5 * intensity;
        const grad = ctx.createRadialGradient(headCenterX, eyeCenterY, 0.5, headCenterX, eyeCenterY, 6 * intensity);
        grad.addColorStop(0, 'rgba(255, 60, 90, ' + (intensity * 0.85) + ')');
        grad.addColorStop(0.5, 'rgba(255, 0, 70, ' + (intensity * 0.4) + ')');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(headCenterX, eyeCenterY, 6 * intensity, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // =========================================================================
      // 动作 1：太虚拂尘 · 裂空星刃 (Whisk Sweep Barrage) - 24 帧
      // 修复要求：由本体手上的拂尘挥动，严禁独立手挥动拂尘（零穿帮，零多余手）
      // =========================================================================
      function renderWhiskSheet() {
        const cvs = document.getElementById('cvs_whisk');
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 1536, 1024);

        for (let f = 0; f < totalFrames; f++) {
          const col = f % cols;
          const row = Math.floor(f / cols);
          const ox = col * frameW + frameW / 2;
          const oy = row * frameH + frameH / 2;

          ctx.save();
          ctx.translate(ox, oy);

          // 限制当前帧严格位于 256x256 单元格内，严防越界串帧
          ctx.beginPath();
          ctx.rect(-128, -128, 256, 256);
          ctx.clip();

          // 节拍：0..6 蓄力后引，7..13 迅猛横扫，14..18 剑气外爆，19..23 圆融收势
          let whiskAngle = 0;
          let bodyLean = 0;
          let slashAlpha = 0;
          let slashProgress = 0;
          let eyeGlow = 0;

          if (f <= 6) {
            // 蓄力后扬 (0 -> -26°)
            const p = f / 6;
            whiskAngle = -p * 0.46;
            bodyLean = -p * 0.04;
            eyeGlow = p * 0.8;
          } else if (f <= 13) {
            // 迅猛横扫爆发挥击 (-26° -> +24°)
            const p = (f - 6) / 7;
            whiskAngle = -0.46 + p * 0.88;
            bodyLean = -0.04 + p * 0.08;
            slashAlpha = Math.sin(p * Math.PI) * 0.95;
            slashProgress = p;
            eyeGlow = 0.9;
          } else if (f <= 18) {
            // 剑气脱刃，星尘大盛 (+24° -> +11°)
            const p = (f - 13) / 5;
            whiskAngle = 0.42 - p * 0.22;
            bodyLean = 0.04 * (1 - p);
            slashAlpha = (1 - p) * 0.7;
            slashProgress = 1.0 + p * 0.4;
            eyeGlow = 0.6 * (1 - p);
          } else {
            // 回聚平复 (+11° -> 0°)
            const p = (f - 18) / 5;
            whiskAngle = 0.20 * (1 - p);
            bodyLean = 0;
            eyeGlow = 0;
          }

          const bodyFloat = Math.sin(f * (Math.PI * 2 / 24)) * 3;

          // 1. 绘制道祖主体躯干 (去除右手拂尘的完美底盘)
          const bodyW = 185;
          const S = bodyW / imgBodyBase.width;
          const bodyH = S * imgBodyBase.height;
          const bx = -bodyW / 2;
          const by = -bodyH / 2 - 5.5 + bodyFloat;

          ctx.save();
          ctx.rotate(bodyLean);
          ctx.drawImage(imgBodyBase, bx, by, bodyW, bodyH);

          // 3. 动态手持太虚拂尘：本体右龙爪与拂尘无缝联动挥动！
          // 袖口连接点在全图坐标为 (635, 375) [原275，因画布顶部扩展100px补正]
          // 局部图 arm_whisk_clean 内旋转中心为 (20, 214)
          const pivotLocalX = bx + 635 * S;
          const pivotLocalY = by + 375 * S;
          const armW = 262 * S;
          const armH = 285 * S;
          const anchorX = 20 * S;
          const anchorY = 214 * S;

          ctx.save();
          ctx.translate(pivotLocalX, pivotLocalY);
          ctx.rotate(whiskAngle);
          ctx.drawImage(imgArmWhisk, -anchorX, -anchorY, armW, armH);

          // 拂丝末端虚空绿焰流光
          if (f >= 6 && f <= 15) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            // 拂丝末端位置相对旋转中心
            const tipX = -anchorX + 225 * S;
            const tipY = -anchorY + 35 * S;
            ctx.moveTo(tipX, tipY);
            ctx.quadraticCurveTo(tipX + 15, tipY - 10 + Math.sin(f) * 6, tipX + 32, tipY + 10);
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore(); // 结束手臂绘制

          ctx.restore(); // 结束本体倾斜

          // 4. 裂空星刃斩击光波 (Slash Arc VFX)
          if (slashAlpha > 0.05) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = slashAlpha;
            ctx.strokeStyle = 'rgba(76, 201, 240, ' + slashAlpha + ')';
            ctx.lineWidth = 4.5;
            ctx.shadowColor = '#4cc9f0';
            ctx.shadowBlur = 16;
            ctx.beginPath();
            const arcRadius = 75 + slashProgress * 38;
            const startAng = -Math.PI * 0.6 + slashProgress * 0.2;
            const endAng = Math.PI * 0.4 + slashProgress * 0.2;
            ctx.arc(-15, 0, arcRadius, startAng, endAng);
            ctx.stroke();

            // 内层白炽锋芒
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + (slashAlpha * 0.9) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-15, 0, arcRadius - 2, startAng + 0.1, endAng - 0.1);
            ctx.stroke();

            // 迸射的星辰碎片
            for (let s = 0; s < 7; s++) {
              const spAng = startAng + (endAng - startAng) * (s / 6);
              const spDist = arcRadius + 12 + (s % 3) * 8;
              const spX = -15 + Math.cos(spAng) * spDist;
              const spY = Math.sin(spAng) * spDist;
              ctx.fillStyle = s % 2 === 0 ? '#4cc9f0' : '#10b981';
              ctx.beginPath();
              ctx.arc(spX, spY, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }

          ctx.restore();
        }
        console.log('Action 1: Whisk sheet rendered successfully!');
      }

      // =========================================================================
      // 动作 2：真卷启灵 · 九天玄刹神雷 (Scroll Invocation AoE) - 24 帧
      // 修复要求：由本体左手上的真卷启灵，严禁胸前额外悬空多余卷轴
      // =========================================================================
      function renderScrollSheet() {
        const cvs = document.getElementById('cvs_scroll');
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 1536, 1024);

        for (let f = 0; f < totalFrames; f++) {
          const col = f % cols;
          const row = Math.floor(f / cols);
          const ox = col * frameW + frameW / 2;
          const oy = row * frameH + frameH / 2;

          ctx.save();
          ctx.translate(ox, oy);

          // 限制当前帧严格位于 256x256 单元格内
          ctx.beginPath();
          ctx.rect(-128, -128, 256, 256);
          ctx.clip();

          const floatY = Math.sin(f * (Math.PI * 2 / 24)) * 4;

          // 节拍：0..6 卷面启明，7..14 符箓升腾旋转，15..19 天罚神雷贯顶，20..23 纳法归敛
          let scrollGlow = 0;
          let runeSpiralRadius = 0;
          let thunderAlpha = 0;
          let shockwaveRadius = 0;

          if (f <= 6) {
            const p = f / 6;
            scrollGlow = p * 0.85;
            runeSpiralRadius = p * 28;
          } else if (f <= 14) {
            const p = (f - 6) / 8;
            scrollGlow = 0.85 + Math.sin(p * Math.PI) * 0.15;
            runeSpiralRadius = 28 + p * 54; // 28 -> 82px
          } else if (f <= 19) {
            const p = (f - 14) / 5;
            scrollGlow = 1.0 - p * 0.3;
            runeSpiralRadius = 82 + p * 12;
            thunderAlpha = Math.sin(p * Math.PI);
            shockwaveRadius = 15 + p * 65;
          } else {
            const p = (f - 19) / 4;
            scrollGlow = 0.7 * (1 - p);
            runeSpiralRadius = 94 * (1 - p);
          }

          // 1. 道祖本体 (完整的坐姿法身，左手端持《太虚灭世真卷》)
          const bodyW = 185;
          const S = bodyW / imgSeated.width;
          const bodyH = S * imgSeated.height;
          const bx = -bodyW / 2;
          const by = -bodyH / 2 - 5.5 + floatY;

          ctx.save();
          ctx.drawImage(imgSeated, bx, by, bodyW, bodyH);
          ctx.restore();

          // 3. 启灵核心：本体左手上握持的《太虚灭世真卷》耀动九霄神光！
          // 真卷在 view_seated_clean 坐标为 (260, 330) [原230，因画布顶部扩展100px补正]
          const handScrollX = bx + 260 * S;
          const handScrollY = by + 330 * S;

          if (scrollGlow > 0.08) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            // 卷轴炽烈放射光晕
            const sGrad = ctx.createRadialGradient(handScrollX, handScrollY, 2, handScrollX, handScrollY, 28 * scrollGlow);
            sGrad.addColorStop(0, 'rgba(255, 255, 255, ' + scrollGlow + ')');
            sGrad.addColorStop(0.35, 'rgba(16, 185, 129, ' + (scrollGlow * 0.9) + ')');
            sGrad.addColorStop(0.7, 'rgba(76, 201, 240, ' + (scrollGlow * 0.5) + ')');
            sGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = sGrad;
            ctx.beginPath();
            ctx.arc(handScrollX, handScrollY, 28 * scrollGlow, 0, Math.PI * 2);
            ctx.fill();

            // 卷面向上喷薄的虚空灵焰
            for (let v = 0; v < 4; v++) {
              const vy = handScrollY - 8 - v * 6;
              const vx = handScrollX + (v % 2 === 0 ? -4 : 4);
              ctx.strokeStyle = 'rgba(16, 185, 129, ' + (scrollGlow * 0.6) + ')';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.moveTo(vx, vy);
              ctx.lineTo(vx + (Math.sin(f + v) * 5), vy - 8);
              ctx.stroke();
            }
            ctx.restore();
          }

          // 4. 从左手真卷中脱卷升腾、环绕身躯旋转的天道禁断神纹 (8枚神纹双螺旋升腾)
          if (runeSpiralRadius > 5) {
            ctx.save();
            for (let r = 0; r < 8; r++) {
              const t = r / 8;
              const ang = t * Math.PI * 2 + f * 0.32;
              // 从真卷起点向上并环绕展开
              const rx = handScrollX * (1 - t * 0.7) + Math.cos(ang) * runeSpiralRadius;
              const ry = (handScrollY - 12) - t * 36 + Math.sin(ang) * (runeSpiralRadius * 0.38);
              drawRuneGlyph(ctx, rx, ry, 14, r, '#10b981', Math.min(1.0, scrollGlow * 1.2));
            }
            ctx.restore();
          }

          // 5. 垂落虚空的九天玄刹神雷与真卷震波环 (Cataclysmic Lightning)
          if (thunderAlpha > 0.05) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = thunderAlpha;
            // 苍穹直贯三大神雷
            drawCosmicLightning(ctx, -55, -128, -75, 128, 6, 12, '#4cc9f0', 2.8);
            drawCosmicLightning(ctx, 55, -128, 75, 128, 6, 12, '#a855f7', 2.8);
            drawCosmicLightning(ctx, handScrollX, -128, handScrollX, 128, 7, 14, '#ffffff', 3.5);

            // 从手中真卷激荡而出的神雷震波环
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(handScrollX, handScrollY, shockwaveRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(handScrollX, handScrollY, Math.max(5, shockwaveRadius - 6), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          ctx.restore();
        }
        console.log('Action 2: Scroll sheet rendered successfully!');
      }

      // =========================================================================
      // 动作 3：混沌归元 · 太极黑洞引力坍缩 (Singularity Ultimate) - 24 帧
      // =========================================================================
      function renderSingularitySheet() {
        const cvs = document.getElementById('cvs_singularity');
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 1536, 1024);

        for (let f = 0; f < totalFrames; f++) {
          const col = f % cols;
          const row = Math.floor(f / cols);
          const ox = col * frameW + frameW / 2;
          const oy = row * frameH + frameH / 2;

          ctx.save();
          ctx.translate(ox, oy);

          // 限制当前帧严格位于 256x256 单元格内
          ctx.beginPath();
          ctx.rect(-128, -128, 256, 256);
          ctx.clip();

          const floatY = Math.sin(f * (Math.PI * 2 / 24)) * 3;

          // 节拍：0..5 黑洞初醒，6..14 引力吞噬极值，15..19 超新星大殉爆，20..23 坍缩复原
          let vortexScale = 0.85;
          let vortexRot = -f * 0.35;
          let shockwaveRadius = 0;
          let blastAlpha = 0;
          let suckRays = 0;

          if (f <= 5) {
            const p = f / 5;
            vortexScale = 0.78 + p * 0.22;
            suckRays = p * 0.6;
          } else if (f <= 14) {
            const p = (f - 5) / 9;
            vortexScale = 1.0 + p * 0.14;
            vortexRot = -f * (0.35 + p * 0.3);
            suckRays = 0.6 + p * 0.4;
          } else if (f <= 19) {
            const p = (f - 14) / 5;
            vortexScale = 1.14 - p * 0.28;
            shockwaveRadius = 20 + p * 95;
            blastAlpha = Math.sin(p * Math.PI);
          } else {
            const p = (f - 19) / 4;
            vortexScale = 0.86 - p * 0.08;
          }

          // 1. 巨大混沌太极黑洞
          ctx.save();
          ctx.translate(0, -15);
          ctx.rotate(vortexRot);
          const vW = imgVortex.width * vortexScale;
          const vH = imgVortex.height * vortexScale;
          ctx.shadowColor = '#7209b7';
          ctx.shadowBlur = 18;
          ctx.drawImage(imgVortex, -vW / 2, -vH / 2, vW, vH);
          ctx.restore();

          // 2. 向心引力光带
          if (suckRays > 0.1) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(168, 85, 247, ' + (suckRays * 0.7) + ')';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#c084fc';
            ctx.shadowBlur = 8;
            for (let i = 0; i < 8; i++) {
              const ang = (i / 8) * Math.PI * 2 + f * 0.25;
              const rOut = 105 - (f * 3) % 25;
              const rIn = 30;
              const x1 = Math.cos(ang + 0.3) * rOut;
              const y1 = Math.sin(ang + 0.3) * rOut - 15;
              const x2 = Math.cos(ang) * rIn;
              const y2 = Math.sin(ang) * rIn - 15;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.quadraticCurveTo((x1 + x2) * 0.5 + Math.sin(i) * 10, (y1 + y2) * 0.5, x2, y2);
              ctx.stroke();
            }
            ctx.restore();
          }

          // 3. 道祖神明法躯
          const bodyW = 185;
          const S = bodyW / imgSeated.width;
          const bodyH = S * imgSeated.height;
          const bx = -bodyW / 2;
          const by = -bodyH / 2 - 5.5 + floatY;

          ctx.save();
          ctx.drawImage(imgSeated, bx, by, bodyW, bodyH);
          ctx.restore();

          // 4. 超新星大殉爆冲击波
          if (blastAlpha > 0.05) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = blastAlpha;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3.5;
            ctx.shadowColor = '#4cc9f0';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, -15, shockwaveRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#f72585';
            ctx.lineWidth = 5.5;
            ctx.beginPath();
            ctx.arc(0, -15, Math.max(10, shockwaveRadius - 10), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          ctx.restore();
        }
        console.log('Action 3: Singularity sheet rendered successfully!');
      }

      // =========================================================================
      // 动作 4：太虚折跃 · 触手破虚突刺 (Void Tentacle Rush) - 24 帧
      // 修复要求：依旧使用端坐星云的坐姿，严禁使用侧视图，彻底消除突兀感！
      // =========================================================================
      function renderRushSheet() {
        const cvs = document.getElementById('cvs_rush');
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 1536, 1024);

        for (let f = 0; f < totalFrames; f++) {
          const col = f % cols;
          const row = Math.floor(f / cols);
          const ox = col * frameW + frameW / 2;
          const oy = row * frameH + frameH / 2;

          ctx.save();
          ctx.translate(ox, oy);

          // 限制当前帧严格位于 256x256 单元格内
          ctx.beginPath();
          ctx.rect(-128, -128, 256, 256);
          ctx.clip();

          // 节拍：0..4 蓄力后缩，5..13 极速折跃前冲，14..18 虚空穿透爆发，19..23 平稳还虚
          let tilt = 0;
          let scaleX = 1.0;
          let scaleY = 1.0;
          let shiftX = 0;
          let speedTrail = 0;
          let shockwaveAlpha = 0;
          let shockwaveRadius = 0;

          if (f <= 4) {
            // 凝神蓄势：向后收敛
            const p = f / 4;
            tilt = 0.05 * p;
            scaleX = 0.94 + p * 0.02;
            scaleY = 1.05 - p * 0.02;
            shiftX = -18 * p;
          } else if (f <= 13) {
            // 极速折跃：高速前冲横移 (-18 -> +45)
            const p = (f - 4) / 9;
            tilt = 0.12; // 威仪坐姿向前微倾，极具压迫感
            scaleX = 1.15; // 空间折叠拉伸
            scaleY = 0.90;
            shiftX = -18 + p * 63;
            speedTrail = Math.sin(p * Math.PI);
          } else if (f <= 18) {
            // 虚空穿透减速与冲击波爆发 (+45 -> +20)
            const p = (f - 13) / 5;
            tilt = 0.12 * (1 - p);
            scaleX = 0.96;
            scaleY = 1.04;
            shiftX = 45 - p * 25;
            shockwaveAlpha = Math.sin(p * Math.PI);
            shockwaveRadius = 20 + p * 75;
          } else {
            // 平稳还虚归位 (+20 -> 0)
            const p = (f - 18) / 5;
            tilt = 0;
            scaleX = 1.0;
            scaleY = 1.0;
            shiftX = 20 * (1 - p);
          }

          const bodyW = 185;
          const S = bodyW / imgSeated.width;
          const bodyH = S * imgSeated.height;

          // 1. 速度流光与空间割裂光线 (Speed Streaks & Space Distortion)
          if (speedTrail > 0.06) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = speedTrail * 0.85;
            for (let i = 0; i < 10; i++) {
              const y = -65 + i * 15;
              const len = 50 + (i % 3) * 28;
              const grad = ctx.createLinearGradient(shiftX - len - 20, y, shiftX, y);
              grad.addColorStop(0, 'transparent');
              grad.addColorStop(0.5, i % 2 === 0 ? '#4cc9f0' : '#7209b7');
              grad.addColorStop(1, '#ffffff');
              ctx.strokeStyle = grad;
              ctx.lineWidth = 1.8 + (i % 2);
              ctx.beginPath();
              ctx.moveTo(shiftX - len - 20, y);
              ctx.lineTo(shiftX - 10, y);
              ctx.stroke();
            }
            ctx.restore();
          }

          // 2. 核心突破：三重视差坐姿法相残影 (Seated Motion Ghosts)
          // 严禁侧身站立，纯正以坐姿破空横移
          if (speedTrail > 0.08) {
            const ghosts = [
              { dx: -35, alpha: 0.22 * speedTrail, tint: '#7209b7' },
              { dx: -22, alpha: 0.38 * speedTrail, tint: '#4cc9f0' },
              { dx: -10, alpha: 0.55 * speedTrail, tint: null }
            ];

            ghosts.forEach(g => {
              ctx.save();
              ctx.translate(shiftX + g.dx, 0);
              ctx.rotate(tilt * 0.8);
              ctx.scale(scaleX * 0.96, scaleY * 0.98);
              ctx.globalAlpha = g.alpha;
              if (g.tint) {
                ctx.globalCompositeOperation = 'lighter';
                ctx.shadowColor = g.tint;
                ctx.shadowBlur = 12;
              }
              ctx.drawImage(imgSeated, -bodyW / 2, -bodyH / 2 - 5.5, bodyW, bodyH);
              ctx.restore();
            });
          }

          // 3. 坐姿主身本体 (端坐于星云王座之上疾冲)
          ctx.save();
          ctx.translate(shiftX, 0);
          ctx.rotate(tilt);
          ctx.scale(scaleX, scaleY);

          ctx.drawImage(imgSeated, -bodyW / 2, -bodyH / 2 - 5.5, bodyW, bodyH);

          // 破虚激波锥 (Supersonic Void Shockwave Cone)
          if (speedTrail > 0.15) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(76, 201, 240, ' + speedTrail + ')';
            ctx.lineWidth = 3.5;
            ctx.shadowColor = '#4cc9f0';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(35, 5, 50, -Math.PI * 0.35, Math.PI * 0.35);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, ' + (speedTrail * 0.8) + ')';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(38, 5, 48, -Math.PI * 0.28, Math.PI * 0.28);
            ctx.stroke();
            ctx.restore();
          }

          ctx.restore();

          // 4. 虚空穿透冲击波圆环 (Void Penetration Shockwave Burst)
          if (shockwaveAlpha > 0.05) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = shockwaveAlpha;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#4cc9f0';
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(shiftX, 0, shockwaveRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#7209b7';
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.arc(shiftX, 0, Math.max(8, shockwaveRadius - 8), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          ctx.restore();
        }
        console.log('Action 4: Rush sheet rendered successfully (Pure Seated)!');
      }

      // 执行渲染所有 4 套动作图集
      renderWhiskSheet();
      renderScrollSheet();
      renderSingularitySheet();
      renderRushSheet();

      window.__whiskBase64 = document.getElementById('cvs_whisk').toDataURL('image/png');
      window.__scrollBase64 = document.getElementById('cvs_scroll').toDataURL('image/png');
      window.__singularityBase64 = document.getElementById('cvs_singularity').toDataURL('image/png');
      window.__rushBase64 = document.getElementById('cvs_rush').toDataURL('image/png');
    });
  </script>
  </body>
  </html>`;

  const tempHtml = path.join(__dirname, 'temp_gen_primordial.html');
  fs.writeFileSync(tempHtml, html, 'utf8');
  await win.loadFile(tempHtml);

  // 等待渲染完成
  await new Promise(r => setTimeout(r, 2200));

  const whiskB64 = await win.webContents.executeJavaScript('window.__whiskBase64');
  const scrollB64 = await win.webContents.executeJavaScript('window.__scrollBase64');
  const singularityB64 = await win.webContents.executeJavaScript('window.__singularityBase64');
  const rushB64 = await win.webContents.executeJavaScript('window.__rushBase64');

  const pubDir = path.join(__dirname, '..', 'public');

  if (whiskB64) {
    const p = path.join(pubDir, 'boss_primordial_whisk_sheet.png');
    fs.writeFileSync(p, whiskB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${p} (${fs.statSync(p).size} bytes)`);
  }

  if (scrollB64) {
    const p = path.join(pubDir, 'boss_primordial_scroll_sheet.png');
    fs.writeFileSync(p, scrollB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${p} (${fs.statSync(p).size} bytes)`);
  }

  if (singularityB64) {
    const p = path.join(pubDir, 'boss_primordial_singularity_sheet.png');
    fs.writeFileSync(p, singularityB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${p} (${fs.statSync(p).size} bytes)`);
  }

  if (rushB64) {
    const p = path.join(pubDir, 'boss_primordial_rush_sheet.png');
    fs.writeFileSync(p, rushB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${p} (${fs.statSync(p).size} bytes)`);
  }

  try { fs.unlinkSync(tempHtml); } catch (e) {}

  console.log('All 4 primordial god action sheets generated successfully!');
  app.quit();
});
