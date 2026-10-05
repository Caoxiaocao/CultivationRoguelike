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
      contextIsolation: false
    }
  });

  const frontImgPath = path.join(__dirname, '..', 'public', 'boss_celestial_peng', 'view_front_clean.png');
  const sideImgPath = path.join(__dirname, '..', 'public', 'boss_celestial_peng', 'view_side_clean.png');
  const featherImgPath = path.join(__dirname, '..', 'public', 'boss_celestial_peng', 'peng_feather_blade.png');

  const frontBase64 = fs.readFileSync(frontImgPath).toString('base64');
  const sideBase64 = fs.readFileSync(sideImgPath).toString('base64');
  const featherBase64 = fs.existsSync(featherImgPath) ? fs.readFileSync(featherImgPath).toString('base64') : '';

  const html = `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: transparent; margin: 0;">
    <canvas id="cvs_rush" width="1536" height="1024"></canvas>
    <canvas id="cvs_feather" width="1536" height="1024"></canvas>
    <canvas id="cvs_screech" width="1536" height="1024"></canvas>
    <img id="img_front" src="data:image/png;base64,${frontBase64}" />
    <img id="img_side" src="data:image/png;base64,${sideBase64}" />
    <img id="img_feather" src="data:image/png;base64,${featherBase64}" />
  <script>
    window.addEventListener('load', () => {
      const imgFront = document.getElementById('img_front');
      const imgSide = document.getElementById('img_side');
      const imgFeather = document.getElementById('img_feather');

      const cols = 6;
      const rows = 4;
      const totalFrames = 24;
      const frameW = 256;
      const frameH = 256;

      // =========================================================================
      // 辅助函数：绘制平滑贝塞尔闪电 / 金雷电弧
      // =========================================================================
      function drawLightning(ctx, x1, y1, x2, y2, segments = 4, roughness = 8, color = '#ffea00', width = 2) {
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
          const normalX = -(y2 - y1);
          const normalY = (x2 - x1);
          const len = Math.hypot(normalX, normalY) || 1;
          const offset = (Math.sin(i * 3.7 + t * 10) * roughness);
          curX = targetX + (normalX / len) * offset;
          curY = targetY + (normalY / len) * offset;
          ctx.lineTo(curX, curY);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      }

      // =========================================================================
      // 动作 1：冲刺飞扑 (Dive Rush / Sprint Swoop) - 24 帧
      // 基底：侧面图 imgSide (225x495, 雄鹰凌空左向俯冲)
      // =========================================================================
      function renderRushSheet() {
        const cvs = document.getElementById('cvs_rush');
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 1536, 1024);

        // 预生成金羽残影与流光粒子种子
        const speedParticleSeeds = [];
        for (let i = 0; i < 28; i++) {
          speedParticleSeeds.push({
            xRatio: 0.15 + (i * 0.031) % 0.8,
            yRatio: 0.2 + ((i * 3) % 17) * 0.035,
            len: 18 + (i % 5) * 12,
            speed: 1.2 + (i % 4) * 0.3,
            alpha: 0.35 + (i % 3) * 0.25,
            width: 1.2 + (i % 3) * 0.8
          });
        }

        for (let f = 0; f < totalFrames; f++) {
          const col = f % cols;
          const row = Math.floor(f / cols);
          const cellX = col * frameW;
          const cellY = row * frameH;
          const cx = cellX + frameW / 2;
          const cy = cellY + frameH / 2;

          ctx.save();
          ctx.beginPath();
          ctx.rect(cellX, cellY, frameW, frameH);
          ctx.clip();

          // 动作分段关键曲线 (Hermite / Smoothstep)
          // f: 0~4 (蓄力后仰), 5~13 (俯冲突进), 14~18 (利爪绝杀与展翼制动), 19~23 (拉升盘旋复位)
          let pitchAngle = 0;
          let forwardX = 0;
          let diveY = 0;
          let stretchX = 1.0;
          let stretchY = 1.0;
          let clawReach = 0;
          let speedIntensity = 0;
          let brakeIntensity = 0;

          if (f <= 4) {
            // 0~4: 蓄势引弓，身体后仰蓄力
            const p = f / 4;
            pitchAngle = -0.22 * Math.sin(p * Math.PI * 0.5);
            forwardX = 14 * p;
            diveY = -4 * p;
            stretchX = 0.94 + 0.06 * (1 - p);
            stretchY = 1.06 - 0.06 * (1 - p);
            speedIntensity = p * 0.15;
          } else if (f <= 13) {
            // 5~13: 破空俯冲，极速前扑
            const p = (f - 5) / 8; // 0 -> 1
            // 俯冲角度 48度 ~ 54度 (0.84 ~ 0.94 rad)
            pitchAngle = 0.85 + Math.sin(p * Math.PI) * 0.12;
            forwardX = 14 - p * 42; // 向前破空突进
            diveY = Math.sin(p * Math.PI) * 16;
            stretchX = 1.24 - Math.abs(p - 0.5) * 0.1; // 极速拉伸
            stretchY = 0.82 + Math.abs(p - 0.5) * 0.08;
            clawReach = Math.min(1.0, p * 1.5);
            speedIntensity = 0.85 + Math.sin(p * Math.PI) * 0.15;
          } else if (f <= 18) {
            // 14~18: 鹰爪撕裂与振翅制动 (Air-Braking Flare)
            const p = (f - 14) / 4; // 0 -> 1
            pitchAngle = 0.85 * (1 - p) + (-0.12) * p; // 身体由俯冲急剧拉起制动
            forwardX = -28 + p * 20;
            diveY = 12 * (1 - p);
            stretchX = 1.15 - p * 0.15;
            stretchY = 0.9 + p * 0.1;
            clawReach = 1.0 - p * 0.7;
            brakeIntensity = Math.sin(p * Math.PI);
            speedIntensity = (1 - p) * 0.5;
          } else {
            // 19~23: 展翮腾空平滑回位 (Loop seamlessly to f=0)
            const p = (f - 19) / 5; // 0 -> 1
            pitchAngle = -0.12 * (1 - p);
            forwardX = -8 * (1 - p);
            diveY = 0;
            stretchX = 1.0;
            stretchY = 1.0;
            clawReach = 0;
            speedIntensity = 0;
          }

          // -----------------------------------------------------------------
          // 1. 底层金乌破空风道与光晕 (Aura Underlay - 限制在单格安全边界内)
          // -----------------------------------------------------------------
          const auraRad = 74 + speedIntensity * 16;
          const auraCenterX = cx + forwardX * 0.6;
          const auraCenterY = cy + diveY * 0.6;
          const auraGrad = ctx.createRadialGradient(auraCenterX, auraCenterY, 12, auraCenterX, auraCenterY, auraRad);
          auraGrad.addColorStop(0, speedIntensity > 0.4 ? 'rgba(255, 240, 160, 0.45)' : 'rgba(255, 183, 3, 0.28)');
          auraGrad.addColorStop(0.5, speedIntensity > 0.4 ? 'rgba(255, 183, 3, 0.22)' : 'rgba(251, 133, 0, 0.12)');
          auraGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(auraCenterX, auraCenterY, auraRad, 0, Math.PI * 2);
          ctx.fill();

          // -----------------------------------------------------------------
          // 2. 极速冲刺多重金色残影 (Golden Speed Afterimages)
          // -----------------------------------------------------------------
          const baseScale = 0.42; // 精确缩放至 95x208，为俯冲与光障预留完美边距
          const drawW = imgSide.naturalWidth * baseScale;
          const drawH = imgSide.naturalHeight * baseScale;

          if (speedIntensity > 0.3) {
            const afterimageOffsets = [
              { dx: 24, dy: -10, alpha: 0.16 * speedIntensity },
              { dx: 12, dy: -5, alpha: 0.28 * speedIntensity }
            ];
            for (const ai of afterimageOffsets) {
              ctx.save();
              ctx.translate(cx + forwardX + ai.dx, cy + diveY + ai.dy);
              ctx.rotate(pitchAngle);
              ctx.scale(stretchX, stretchY);
              ctx.globalAlpha = ai.alpha;
              ctx.drawImage(imgSide, -drawW * 0.42, -drawH * 0.46, drawW, drawH);
              ctx.restore();
            }
          }

          // -----------------------------------------------------------------
          // 3. 鹰身主体渲染 (Main Raptor Body with Dynamic Bone Articulation)
          // -----------------------------------------------------------------
          ctx.save();
          ctx.translate(cx + forwardX, cy + diveY);
          ctx.rotate(pitchAngle);
          ctx.scale(stretchX, stretchY);

          // 绘制主体
          ctx.drawImage(imgSide, -drawW * 0.42, -drawH * 0.46, drawW, drawH);

          // 利爪前探强化 (Claw Slash Articulation)
          if (clawReach > 0.1) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(255, 234, 0, ' + (clawReach * 0.9) + ')';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            // 从鹰爪向外划出三道锐利金光破空爪痕
            const clawOriginX = -drawW * 0.26;
            const clawOriginY = drawH * 0.24;
            for (let c = -1; c <= 1; c++) {
              ctx.beginPath();
              ctx.moveTo(clawOriginX, clawOriginY + c * 5);
              ctx.quadraticCurveTo(clawOriginX - 14 * clawReach, clawOriginY + c * 8 + 3, clawOriginX - 26 * clawReach, clawOriginY + c * 10 + 6 * clawReach);
              ctx.stroke();
            }
            ctx.restore();
          }

          ctx.restore(); // 结束主体变换

          // -----------------------------------------------------------------
          // 4. 加色特效层：超音速锥形金光风障、破空流光粒子与神雷 (Additive VFX)
          // -----------------------------------------------------------------
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          // 4.1 头部前缘超音速破空金障锥 (Supersonic Shockwave Cone)
          if (speedIntensity > 0.35) {
            const beakTipX = cx + forwardX - 36 * Math.cos(pitchAngle);
            const beakTipY = cy + diveY - 36 * Math.sin(pitchAngle);

            const coneLen = 54 * speedIntensity;
            const coneAngle = 0.46;

            const coneGrad = ctx.createRadialGradient(beakTipX, beakTipY, 3, beakTipX, beakTipY, coneLen);
            coneGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            coneGrad.addColorStop(0.35, 'rgba(255, 214, 10, 0.85)');
            coneGrad.addColorStop(0.75, 'rgba(251, 133, 0, 0.3)');
            coneGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');

            ctx.save();
            ctx.translate(beakTipX, beakTipY);
            ctx.rotate(pitchAngle + Math.PI); // 指向后方展开锥面

            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(coneLen, -Math.tan(coneAngle) * coneLen);
            ctx.quadraticCurveTo(coneLen * 1.12, 0, coneLen, Math.tan(coneAngle) * coneLen);
            ctx.closePath();
            ctx.fill();

            // 破空同心双重冲击环 (Double Shock Ripples)
            for (const rMul of [0.45, 0.75]) {
              ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.7 * speedIntensity * (1 - rMul * 0.4)) + ')';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.arc(coneLen * rMul, 0, 14 * rMul + 4, -Math.PI * 0.42, Math.PI * 0.42);
              ctx.stroke();
            }

            ctx.restore();
          }

          // 4.2 制动气浪冲击波 (Braking Shockwave Flares, Frames 14~18)
          if (brakeIntensity > 0.15) {
            const brakeX = cx + forwardX;
            const brakeY = cy + diveY + 8;
            const ringR = 26 + brakeIntensity * 36;
            ctx.strokeStyle = 'rgba(255, 214, 10, ' + (brakeIntensity * 0.8) + ')';
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            ctx.arc(brakeX, brakeY, ringR, -Math.PI * 0.8, Math.PI * 0.8);
            ctx.stroke();

            // 环形外围副波
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + (brakeIntensity * 0.5) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(brakeX, brakeY, ringR + 10, -Math.PI * 0.6, Math.PI * 0.6);
            ctx.stroke();
          }

          // 4.3 破空流光拉丝金羽 (Streaking Gold Feather Trails)
          if (speedIntensity > 0.25) {
            for (const sp of speedParticleSeeds) {
              const px = cellX + sp.xRatio * frameW;
              const py = cellY + sp.yRatio * frameH;
              const trailLen = sp.len * (0.8 + speedIntensity * 1.2);

              ctx.strokeStyle = 'rgba(255, 230, 110, ' + (sp.alpha * speedIntensity) + ')';
              ctx.lineWidth = sp.width;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(px + trailLen, py - trailLen * 0.35);
              ctx.stroke();
            }
          }

          // 4.4 金翅雷芒电弧 (Forehead and Wing Arc Lightning)
          if (speedIntensity > 0.5) {
            const headX = cx + forwardX - 18;
            const headY = cy + diveY - 26;
            const wingX = cx + forwardX + 22;
            const wingY = cy + diveY - 42;
            drawLightning(ctx, headX, headY, wingX, wingY, 4, 7, '#ffea00', 1.8);
          }

          ctx.restore(); // 结束加色
          ctx.restore(); // 结束单帧裁剪
        }

        console.log('Action 1: Rush sheet rendered!');
      }

      // =========================================================================
      // 动作 2：扇动翅膀发射羽毛 (Wing Flap & Feather Barrage) - 24 帧
      // 基底：正面图 imgFront (450x497, 纯阳太乙金翼展翅)
      // =========================================================================
      function renderFeatherSheet() {
        const cvs = document.getElementById('cvs_feather');
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 1536, 1024);

        // 预生成 16 枚太乙破空金羽飞刃发射角度与轨迹
        const barrageFeathers = [];
        const numFeathers = 16;
        for (let i = 0; i < numFeathers; i++) {
          const t = i / (numFeathers - 1);
          // 扇面覆盖角：-145度 到 -35度 (从左翼下方到右翼下方向外辐射)
          const angle = Math.PI * 0.25 + t * Math.PI * 0.5; // 45度 到 135度，向下前方辐射
          barrageFeathers.push({
            angle: angle,
            originSide: i < 8 ? -1 : 1, // -1 左翼, +1 右翼
            speed: 160 + (i % 3) * 35,
            spreadDist: 18 + (i % 4) * 8,
            scale: 0.65 + (i % 3) * 0.15,
            spin: (i % 2 === 0 ? 1 : -1) * 0.15
          });
        }

        for (let f = 0; f < totalFrames; f++) {
          const col = f % cols;
          const row = Math.floor(f / cols);
          const cellX = col * frameW;
          const cellY = row * frameH;
          const cx = cellX + frameW / 2;
          const cy = cellY + frameH / 2;

          ctx.save();
          ctx.beginPath();
          ctx.rect(cellX, cellY, frameW, frameH);
          ctx.clip();

          // 动作分段与物理律动：
          // f: 0~6 (引气扬翼，双翼高举至极)，7~10 (怒振风雷，振翅下扑爆发)，11~17 (金羽齐射飞刃)，18~23 (扶摇回风复位)
          let wingBeatAngle = 0; // 弧度
          let bodyLiftY = 0;
          let haloSpin = (f / totalFrames) * Math.PI * 2;
          let haloScale = 1.0;
          let barrageProgress = 0; // 0: 未发射, 0->1: 极速激射中, 1: 射出画面
          let windBlast = 0;

          if (f <= 6) {
            // 0~6: 双翼极力高扬，吸纳天地罡气
            const p = f / 6;
            wingBeatAngle = -0.38 * Math.sin(p * Math.PI * 0.5); // 上扬 ~22度
            bodyLiftY = 3.5 * p; // 身体反作用力微下沉
            haloScale = 1.0 + p * 0.18;
          } else if (f <= 10) {
            // 7~10: 怒振扑打！翅膀由最高点急速暴力向下扑打至最低点
            const p = (f - 7) / 3; // 0 -> 1
            wingBeatAngle = -0.38 * (1 - p) + 0.42 * p; // 由上扬 -22度 剧降至 下扑 +24度
            bodyLiftY = 3.5 * (1 - p) - 7.5 * p; // 猛烈向上升腾
            windBlast = Math.sin(p * Math.PI);
            haloScale = 1.18 + windBlast * 0.15;
          } else if (f <= 17) {
            // 11~17: 太乙金羽激射！羽刃从双翅边缘破空爆射
            const p = (f - 11) / 6; // 0 -> 1
            barrageProgress = p;
            wingBeatAngle = 0.42 * (1 - p * 0.4) + Math.sin(p * Math.PI * 3) * 0.08; // 翼尖受后坐力震颤
            bodyLiftY = -7.5 * (1 - p * 0.6);
            haloScale = 1.25 - p * 0.15;
          } else {
            // 18~23: 顺风回振平滑复位 (Loop to 0)
            const p = (f - 18) / 5; // 0 -> 1
            wingBeatAngle = 0.25 * (1 - p);
            bodyLiftY = -3.0 * (1 - p);
            haloScale = 1.1 - p * 0.1;
          }

          // -----------------------------------------------------------------
          // 1. 背部太古祥云神环与金光光晕 (Divine Solar Cloud Halo)
          // -----------------------------------------------------------------
          const haloR = 48 * haloScale;
          const haloY = cy - 26 + bodyLiftY;

          ctx.save();
          ctx.translate(cx, haloY);
          ctx.rotate(haloSpin);

          // 神环光环同心晕染
          const haloGrad = ctx.createRadialGradient(0, 0, haloR * 0.55, 0, 0, haloR * 1.35);
          haloGrad.addColorStop(0, 'rgba(255, 235, 120, 0.45)');
          haloGrad.addColorStop(0.4, 'rgba(255, 183, 3, 0.35)');
          haloGrad.addColorStop(0.85, 'rgba(251, 133, 0, 0.12)');
          haloGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(0, 0, haloR * 1.3, 0, Math.PI * 2);
          ctx.fill();

          // 神环外圈祥云光尖与符文射线
          const rayCount = 10;
          for (let i = 0; i < rayCount; i++) {
            const rayAng = (i / rayCount) * Math.PI * 2;
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 183, 3, 0.75)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(Math.cos(rayAng) * (haloR * 0.8), Math.sin(rayAng) * (haloR * 0.8));
            ctx.lineTo(Math.cos(rayAng) * (haloR * 1.15), Math.sin(rayAng) * (haloR * 1.15));
            ctx.stroke();
          }
          ctx.restore();

          // -----------------------------------------------------------------
          // 2. 双翼高精度关节旋转与胸躯层叠渲染 (Articulated Dual Wings & Torso)
          // -----------------------------------------------------------------
          const targetW = 208; // 适配 256 宽画布
          const targetH = (imgFront.naturalHeight / imgFront.naturalWidth) * targetW; // ~230px

          // 2.1 躯干基底与完整尾羽绘制 (先绘制完整的身体与尾羽，尾羽永不撕裂)
          ctx.save();
          ctx.translate(cx, cy + bodyLiftY);

          // 绘制完整的尾羽与下身 (y > 270)
          // 尾羽伴随气流微微柔波摆动
          const tailSway = Math.sin((f / totalFrames) * Math.PI * 2) * 0.03;
          ctx.save();
          ctx.translate(0, 30);
          ctx.rotate(tailSway);
          ctx.drawImage(
            imgFront,
            0, imgFront.naturalHeight * 0.55, imgFront.naturalWidth, imgFront.naturalHeight * 0.45,
            -targetW / 2, -targetH / 2 + targetH * 0.55 - 30, targetW, targetH * 0.45
          );
          ctx.restore();

          // 左右双翼独立四元数骨骼转动 (仅截取上半翼部分，杜绝下摆尾羽混入旋转)：
          // 左肩关节 pivot: (-24, -20)
          // 右肩关节 pivot: (+24, -20)
          const shoulderY = -18;
          const shoulderDist = 26;
          const wingCutH = imgFront.naturalHeight * 0.62; // 仅截取上部 62% 的羽翼
          const wingDestH = targetH * 0.62;

          // 绘制左翼 (仅上半侧 wingCutH，排除尾羽)
          ctx.save();
          ctx.translate(-shoulderDist, shoulderY);
          ctx.rotate(wingBeatAngle);
          // 裁剪多边形：严密限制在左翼轮廓内
          ctx.beginPath();
          ctx.rect(-targetW / 2 + shoulderDist, -targetH / 2 - shoulderY, targetW * 0.46, wingDestH);
          ctx.clip();
          ctx.drawImage(
            imgFront,
            0, 0, imgFront.naturalWidth * 0.46, wingCutH,
            -targetW / 2 + shoulderDist, -targetH / 2 - shoulderY, targetW * 0.46, wingDestH
          );
          ctx.restore();

          // 绘制右翼 (仅上半侧 wingCutH，排除尾羽)
          ctx.save();
          ctx.translate(shoulderDist, shoulderY);
          ctx.rotate(-wingBeatAngle); // 镜像反向对称旋转
          ctx.beginPath();
          ctx.rect(-shoulderDist, -targetH / 2 - shoulderY, targetW * 0.46, wingDestH);
          ctx.clip();
          ctx.drawImage(
            imgFront,
            imgFront.naturalWidth * 0.54, 0, imgFront.naturalWidth * 0.46, wingCutH,
            -shoulderDist, -targetH / 2 - shoulderY, targetW * 0.46, wingDestH
          );
          ctx.restore();

          // 居中覆盖绘制主胸躯、太古胸甲与首冠 (彻底覆盖翼根，浑然一体)
          const chestCropX = imgFront.naturalWidth * 0.36;
          const chestCropW = imgFront.naturalWidth * 0.28;
          const chestDestW = targetW * 0.28;
          const chestCropH = imgFront.naturalHeight * 0.68;
          const chestDestH = targetH * 0.68;
          ctx.drawImage(
            imgFront,
            chestCropX, 0, chestCropW, chestCropH,
            -chestDestW / 2, -targetH / 2, chestDestW, chestDestH
          );

          ctx.restore(); // 结束躯干变换

          // -----------------------------------------------------------------
          // 3. 怒振风雷冲击波 (Downstroke Wind Shockwaves, Frames 7~10)
          // -----------------------------------------------------------------
          if (windBlast > 0.1) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(255, 235, 120, ' + (windBlast * 0.8) + ')';
            ctx.lineWidth = 3.5;
            // 左右双翼下方对称下扑风弧
            for (const side of [-1, 1]) {
              ctx.beginPath();
              const arcCenterX = cx + side * 58;
              const arcCenterY = cy + bodyLiftY + 32;
              ctx.arc(arcCenterX, arcCenterY, 36 * windBlast + 10, side === -1 ? Math.PI * 0.1 : Math.PI * 0.5, side === -1 ? Math.PI * 0.5 : Math.PI * 0.9);
              ctx.stroke();
            }
            ctx.restore();
          }

          // -----------------------------------------------------------------
          // 4. 太乙破空金羽万箭齐发飞刃发射特效 (Feather Barrage Projectiles)
          // -----------------------------------------------------------------
          if (barrageProgress > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            for (const fb of barrageFeathers) {
              const startDist = 38;
              const travelDist = startDist + barrageProgress * 85;
              const fx = cx + Math.cos(fb.angle) * travelDist;
              const fy = cy + bodyLiftY + Math.sin(fb.angle) * travelDist;

              // 飞刃透明度渐变 (出膛 -> 最亮 -> 尾声渐淡)
              const alpha = barrageProgress < 0.6 ? 1.0 : (1.0 - (barrageProgress - 0.6) / 0.4);

              ctx.save();
              ctx.translate(fx, fy);
              ctx.rotate(fb.angle + Math.PI * 0.5); // 顺飞刃前行方向
              ctx.globalAlpha = alpha;

              // 绘制太乙金羽飞刃 (梭形晶莹利刃)
              const featherL = 22 * fb.scale;
              const featherW = 5.5 * fb.scale;

              const fGrad = ctx.createLinearGradient(0, -featherL, 0, featherL);
              fGrad.addColorStop(0, '#ffffff');
              fGrad.addColorStop(0.35, '#ffea00');
              fGrad.addColorStop(0.8, '#ffb703');
              fGrad.addColorStop(1, 'rgba(251, 133, 0, 0.2)');

              ctx.fillStyle = fGrad;
              ctx.beginPath();
              ctx.moveTo(0, featherL); // 锐利羽尖
              ctx.quadraticCurveTo(featherW, 0, 0, -featherL);
              ctx.quadraticCurveTo(-featherW, 0, 0, featherL);
              ctx.closePath();
              ctx.fill();

              // 羽刃金光拖尾光芒 (Feather Trail Beam)
              ctx.strokeStyle = 'rgba(255, 235, 120, ' + (alpha * 0.75) + ')';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.moveTo(0, -featherL);
              ctx.lineTo(0, -featherL - 18 * fb.scale);
              ctx.stroke();

              ctx.restore();
            }

            // 翼尖星芒爆发 (Muzzle Flares at Wingtips)
            if (barrageProgress < 0.45) {
              const flareAlpha = 1.0 - barrageProgress / 0.45;
              for (const side of [-1, 1]) {
                const flareX = cx + side * 75;
                const flareY = cy + bodyLiftY + 10;
                const flGrad = ctx.createRadialGradient(flareX, flareY, 1, flareX, flareY, 22);
                flGrad.addColorStop(0, 'rgba(255, 255, 255, ' + flareAlpha + ')');
                flGrad.addColorStop(0.4, 'rgba(255, 214, 10, ' + (flareAlpha * 0.8) + ')');
                flGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');
                ctx.fillStyle = flGrad;
                ctx.beginPath();
                ctx.arc(flareX, flareY, 22, 0, Math.PI * 2);
                ctx.fill();
              }
            }

            ctx.restore();
          }

          ctx.restore(); // 结束单帧裁剪
        }

        console.log('Action 2: Feather barrage sheet rendered!');
      }

      // =========================================================================
      // 动作 3：矗立鸣叫 (Perched Screech / Celestial Call) - 24 帧
      // 基底：正面图 imgFront (冠首微仰、喉口爆射同心金光波纹声浪)
      // =========================================================================
      function renderScreechSheet() {
        const cvs = document.getElementById('cvs_screech');
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 1536, 1024);

        // 3 组交替扩散热浪同心金色声波 (Concentric Acoustic Shockwave Rings)
        const waveEmitters = [
          { startFrame: 6, maxR: 110, duration: 11 },
          { startFrame: 9, maxR: 100, duration: 10 },
          { startFrame: 12, maxR: 90, duration: 9 }
        ];

        for (let f = 0; f < totalFrames; f++) {
          const col = f % cols;
          const row = Math.floor(f / cols);
          const cellX = col * frameW;
          const cellY = row * frameH;
          const cx = cellX + frameW / 2;
          const cy = cellY + frameH / 2;

          ctx.save();
          ctx.beginPath();
          ctx.rect(cellX, cellY, frameW, frameH);
          ctx.clip();

          // 动作分段与物理律动：
          // f: 0~5 (敛羽沉身，深吸入气), 6~16 (仰天长鸣！喉爆金光同心音波震颤), 17~20 (音浪收敛), 21~23 (帝尊复位)
          let chestInhaleScale = 1.0;
          let headTiltY = 0;
          let screechIntensity = 0;
          let flutterTremor = 0;
          let haloScreechScale = 1.0;

          if (f <= 5) {
            // 0~5: 敛羽深吸，气凝金骨
            const p = f / 5;
            chestInhaleScale = 1.0 + p * 0.08;
            headTiltY = -2 * p;
          } else if (f <= 16) {
            // 6~16: 仰天长啸！九霄神音震荡八荒
            const p = (f - 6) / 10; // 0 -> 1
            screechIntensity = Math.sin(p * Math.PI);
            chestInhaleScale = 1.08 + Math.sin(p * Math.PI * 4) * 0.03; // 胸腔音律共振
            headTiltY = -6 * Math.sin(p * Math.PI); // 仰首长鸣
            flutterTremor = Math.sin(f * 2.8) * 1.5; // 全身翎羽声律颤鸣
            haloScreechScale = 1.0 + screechIntensity * 0.28;
          } else if (f <= 20) {
            // 17~20: 啸鸣平息，缓缓合喙
            const p = (f - 17) / 3;
            screechIntensity = (1 - p) * 0.3;
            chestInhaleScale = 1.08 - p * 0.06;
            headTiltY = -2 * (1 - p);
            haloScreechScale = 1.1 - p * 0.08;
          } else {
            // 21~23: 复位闭环
            const p = (f - 21) / 3;
            chestInhaleScale = 1.02 - p * 0.02;
            headTiltY = 0;
            haloScreechScale = 1.0;
          }

          // -----------------------------------------------------------------
          // 1. 背部太古神环 (伴随长鸣爆发耀目神光)
          // -----------------------------------------------------------------
          const haloR = 48 * haloScreechScale;
          const haloY = cy - 26 + headTiltY;

          ctx.save();
          ctx.translate(cx, haloY);
          ctx.rotate((f / totalFrames) * Math.PI);

          const haloGrad = ctx.createRadialGradient(0, 0, haloR * 0.5, 0, 0, haloR * 1.35);
          haloGrad.addColorStop(0, 'rgba(255, 245, 160, ' + (0.4 + screechIntensity * 0.35) + ')');
          haloGrad.addColorStop(0.45, 'rgba(255, 183, 3, ' + (0.35 + screechIntensity * 0.25) + ')');
          haloGrad.addColorStop(1, 'rgba(251, 133, 0, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(0, 0, haloR * 1.35, 0, Math.PI * 2);
          ctx.fill();

          // 神环光芒辐射射线
          const rayNum = 12;
          for (let i = 0; i < rayNum; i++) {
            const ra = (i / rayNum) * Math.PI * 2;
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 214, 10, 0.75)';
            ctx.lineWidth = 1.8 + screechIntensity * 1.2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ra) * haloR * 0.8, Math.sin(ra) * haloR * 0.8);
            ctx.lineTo(Math.cos(ra) * (haloR * 1.15 + screechIntensity * 14), Math.sin(ra) * (haloR * 1.15 + screechIntensity * 14));
            ctx.stroke();
          }
          ctx.restore();

          // -----------------------------------------------------------------
          // 2. 矗立金鹏金身绘制 (Perched Sovereign Stance)
          // -----------------------------------------------------------------
          const targetW = 208;
          const targetH = (imgFront.naturalHeight / imgFront.naturalWidth) * targetW;

          ctx.save();
          ctx.translate(cx + flutterTremor * 0.4, cy + headTiltY);
          ctx.scale(chestInhaleScale, 1.0); // 矗立深吸胸膛饱满

          ctx.drawImage(imgFront, -targetW / 2, -targetH / 2, targetW, targetH);
          ctx.restore();

          // -----------------------------------------------------------------
          // 3. 仰天长啸：喉口白金真阳耀斑与同心金波水墨音浪 (Additive Screech VFX)
          // -----------------------------------------------------------------
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          const mouthX = cx;
          const mouthY = cy - 44 + headTiltY;

          // 3.1 喉间与神喙白金真火核 (Core Beak Flare)
          if (screechIntensity > 0.05) {
            const flareR = 8 + screechIntensity * 18;
            const mouthGrad = ctx.createRadialGradient(mouthX, mouthY, 2, mouthX, mouthY, flareR);
            mouthGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            mouthGrad.addColorStop(0.35, 'rgba(255, 234, 0, 0.9)');
            mouthGrad.addColorStop(0.7, 'rgba(255, 183, 3, 0.5)');
            mouthGrad.addColorStop(1, 'rgba(251, 133, 0, 0)');
            ctx.fillStyle = mouthGrad;
            ctx.beginPath();
            ctx.arc(mouthX, mouthY, flareR, 0, Math.PI * 2);
            ctx.fill();

            // 双目与眉心朱砂神印极炽金芒
            const eyeOffsets = [[-8, -52], [8, -52]];
            for (const [ex, ey] of eyeOffsets) {
              const eyeGrad = ctx.createRadialGradient(mouthX + ex, mouthY + ey + 44, 1, mouthX + ex, mouthY + ey + 44, 8 * screechIntensity + 2);
              eyeGrad.addColorStop(0, '#ffffff');
              eyeGrad.addColorStop(0.5, '#ff3b30');
              eyeGrad.addColorStop(1, 'rgba(255, 59, 48, 0)');
              ctx.fillStyle = eyeGrad;
              ctx.beginPath();
              ctx.arc(mouthX + ex, mouthY + ey + 44, 8 * screechIntensity + 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // 3.2 扩散同心国风金水墨音浪 (Concentric Acoustic Shockwave Rings)
          for (const em of waveEmitters) {
            if (f >= em.startFrame && f < em.startFrame + em.duration) {
              const progress = (f - em.startFrame) / em.duration; // 0 -> 1
              const ringR = 12 + progress * em.maxR;
              const alpha = Math.sin((1 - progress) * Math.PI * 0.5) * 0.85;

              // 主音波圈
              ctx.strokeStyle = 'rgba(255, 235, 120, ' + alpha + ')';
              ctx.lineWidth = 3.0 * (1 - progress * 0.5);
              ctx.beginPath();
              ctx.arc(mouthX, mouthY, ringR, 0, Math.PI * 2);
              ctx.stroke();

              // 内伴随金芒晕圈
              ctx.strokeStyle = 'rgba(255, 255, 255, ' + (alpha * 0.6) + ')';
              ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.arc(mouthX, mouthY, ringR * 0.85, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          // 3.3 翎羽周身金雷电弧 (Celestial Lightning Arcs around Plumage)
          if (screechIntensity > 0.4) {
            const hornL = { x: cx - 18, y: cy - 62 + headTiltY };
            const hornR = { x: cx + 18, y: cy - 62 + headTiltY };
            const wingL = { x: cx - 65, y: cy - 10 + headTiltY };
            const wingR = { x: cx + 65, y: cy - 10 + headTiltY };

            drawLightning(ctx, mouthX, mouthY, hornL.x, hornL.y, 3, 5, '#ffffff', 1.8);
            drawLightning(ctx, mouthX, mouthY, hornR.x, hornR.y, 3, 5, '#ffffff', 1.8);
            drawLightning(ctx, hornL.x, hornL.y, wingL.x, wingL.y, 4, 8, '#ffea00', 1.5);
            drawLightning(ctx, hornR.x, hornR.y, wingR.x, wingR.y, 4, 8, '#ffea00', 1.5);
          }

          ctx.restore(); // 结束加色
          ctx.restore(); // 结束单帧裁剪
        }

        console.log('Action 3: Screech sheet rendered!');
      }

      // 执行渲染所有三套动作图集
      renderRushSheet();
      renderFeatherSheet();
      renderScreechSheet();

      window.__pengRushBase64 = document.getElementById('cvs_rush').toDataURL('image/png');
      window.__pengFeatherBase64 = document.getElementById('cvs_feather').toDataURL('image/png');
      window.__pengScreechBase64 = document.getElementById('cvs_screech').toDataURL('image/png');
    });
  </script>
  </body>
  </html>`;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  // 等待渲染完成
  await new Promise(r => setTimeout(r, 1200));

  const rushB64 = await win.webContents.executeJavaScript('window.__pengRushBase64');
  const featherB64 = await win.webContents.executeJavaScript('window.__pengFeatherBase64');
  const screechB64 = await win.webContents.executeJavaScript('window.__pengScreechBase64');

  const pubDir = path.join(__dirname, '..', 'public');

  if (rushB64) {
    const rushPath = path.join(pubDir, 'boss_peng_rush_sheet.png');
    fs.writeFileSync(rushPath, rushB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${rushPath} (${fs.statSync(rushPath).size} bytes)`);
  }

  if (featherB64) {
    const featherPath = path.join(pubDir, 'boss_peng_feather_sheet.png');
    fs.writeFileSync(featherPath, featherB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${featherPath} (${fs.statSync(featherPath).size} bytes)`);
  }

  if (screechB64) {
    const screechPath = path.join(pubDir, 'boss_peng_screech_sheet.png');
    fs.writeFileSync(screechPath, screechB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    console.log(`Exported: ${screechPath} (${fs.statSync(screechPath).size} bytes)`);
  }

  console.log('All 3 actions generated successfully!');
  app.quit();
});
