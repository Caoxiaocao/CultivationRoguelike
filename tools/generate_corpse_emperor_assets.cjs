const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('headless');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background: transparent; margin: 0;">
  <canvas id="cvs_skull" width="720" height="360"></canvas>
  <canvas id="cvs_tri_skull" width="720" height="360"></canvas>
  <canvas id="cvs_arm" width="720" height="360"></canvas>
  <canvas id="cvs_knuckle" width="256" height="256"></canvas>
  <canvas id="cvs_ghost_fire" width="256" height="256"></canvas>
<script>
  window.onload = () => {
    setTimeout(startGen, 100);
  };

  function startGen() {
    generateSkullSheet();
    generateTriSkullSheet();
    generateArmSheet();
    generateKnuckle();
    generateGhostFire();
    window.__corpseAssetsReady = true;
  }

  // ==========================================================
  // 1. 一阶段巨型骷髅头序列帧 (720x360, 4x2, 每帧 180x180)
  // ==========================================================
  function generateSkullSheet() {
    const cvs = document.getElementById('cvs_skull');
    const ctx = cvs.getContext('2d');
    const cols = 4, rows = 2, total = 8;
    const fw = 180, fh = 180;
    ctx.clearRect(0, 0, 720, 360);

    for (let f = 0; f < total; f++) {
      const col = f % cols;
      const row = Math.floor(f / cols);
      const cx = col * fw + fw / 2;
      const cy = row * fh + fh / 2;
      const theta = (f / total) * Math.PI * 2;
      const floatY = Math.sin(theta) * 3.5;
      const jawDrop = Math.max(0, Math.sin(theta)) * 5;
      const pulse = 0.85 + Math.sin(theta * 2) * 0.15;

      ctx.save();
      ctx.translate(cx, cy + floatY);

      // 1.1 幽冥绿火底晕 (Necrotic Soul Fire Halo)
      const aura = ctx.createRadialGradient(0, -6, 12, 0, -6, 68);
      aura.addColorStop(0, 'rgba(6, 214, 160, 0.45)');
      aura.addColorStop(0.4, 'rgba(46, 196, 182, 0.22)');
      aura.addColorStop(0.75, 'rgba(15, 76, 92, 0.08)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -6, 68, 0, Math.PI * 2);
      ctx.fill();

      // 1.2 颅骨上穹顶 (Cranium Dome)
      const craniumGrad = ctx.createRadialGradient(0, -28, 8, 0, -18, 52);
      craniumGrad.addColorStop(0, '#ffffff');
      craniumGrad.addColorStop(0.4, '#e2eafc');
      craniumGrad.addColorStop(0.75, '#b0c4de');
      craniumGrad.addColorStop(1, '#4a5568');
      ctx.fillStyle = craniumGrad;
      ctx.beginPath();
      ctx.moveTo(-38, -12);
      ctx.bezierCurveTo(-46, -48, -26, -65, 0, -65);
      ctx.bezierCurveTo(26, -65, 46, -48, 38, -12);
      ctx.bezierCurveTo(34, 10, 24, 18, 18, 22);
      ctx.bezierCurveTo(12, 24, -12, 24, -18, 22);
      ctx.bezierCurveTo(-24, 18, -34, 10, -38, -12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 额骨骨缝裂痕 (Sutures & Cracks)
      ctx.strokeStyle = 'rgba(6, 214, 160, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -64);
      ctx.lineTo(2, -45);
      ctx.lineTo(-4, -36);
      ctx.lineTo(3, -24);
      ctx.stroke();

      // 1.3 颧骨与眼眶凹陷 (Zygomatic Arches & Deep Sockets)
      ctx.fillStyle = '#0f172a';
      // 左眼窝
      ctx.beginPath();
      ctx.ellipse(-16, -15, 12, 14, 0.15, 0, Math.PI * 2);
      ctx.fill();
      // 右眼窝
      ctx.beginPath();
      ctx.ellipse(16, -15, 12, 14, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // 鼻骨空腔 (Nasal Cavity)
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(-4, 9);
      ctx.lineTo(4, 9);
      ctx.closePath();
      ctx.fill();

      // 1.4 眼眶内涌动的双核幽冥鬼火 (Twin Blazing Soul Flames)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const side of [-1, 1]) {
        const ex = side * 16;
        const ey = -15;
        const eGrad = ctx.createRadialGradient(ex, ey, 1, ex, ey, 13 * pulse);
        eGrad.addColorStop(0, '#ffffff');
        eGrad.addColorStop(0.3, '#80ffdb');
        eGrad.addColorStop(0.7, '#06d6a0');
        eGrad.addColorStop(1, 'rgba(6, 214, 160, 0)');
        ctx.fillStyle = eGrad;
        ctx.beginPath();
        ctx.arc(ex, ey, 13 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 鬼火眼芒拖尾
        ctx.fillStyle = 'rgba(128, 255, 219, 0.8)';
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 2 * side, ey - 18 * pulse);
        ctx.lineTo(ex + 2 * side, ey);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 1.5 上颚骨与上排牙齿 (Maxilla & Upper Fangs)
      ctx.fillStyle = '#f8fafc';
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const tx = i * 5;
        ctx.beginPath();
        ctx.moveTo(tx - 2, 18);
        ctx.lineTo(tx + 2, 18);
        ctx.lineTo(tx, 27);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 1.6 动态下颚骨 (Mandible with Jaw Drop)
      ctx.save();
      ctx.translate(0, jawDrop);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-16, 26);
      ctx.lineTo(16, 26);
      ctx.lineTo(12, 38);
      ctx.lineTo(-12, 38);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 下排倒齿
      ctx.fillStyle = '#f8fafc';
      for (let i = -2; i <= 2; i++) {
        const tx = i * 5.5;
        ctx.beginPath();
        ctx.moveTo(tx - 2, 28);
        ctx.lineTo(tx + 2, 28);
        ctx.lineTo(tx, 21);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 1.7 幽冥白骨帝冠 (Imperial Bone Tiara)
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(-24, -58);
      ctx.lineTo(-14, -76);
      ctx.lineTo(-6, -65);
      ctx.lineTo(0, -82);
      ctx.lineTo(6, -65);
      ctx.lineTo(14, -76);
      ctx.lineTo(24, -58);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 帝冠幽火宝珠
      ctx.fillStyle = '#06d6a0';
      ctx.beginPath();
      ctx.arc(0, -68, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    window.__skullSheetBase64 = cvs.toDataURL('image/png');
  }

  // ==========================================================
  // 2. 二阶段三头骷髅融合头序列帧 (720x360, 4x2, 每帧 180x180)
  // ==========================================================
  function generateTriSkullSheet() {
    const cvs = document.getElementById('cvs_tri_skull');
    const ctx = cvs.getContext('2d');
    const cols = 4, rows = 2, total = 8;
    const fw = 180, fh = 180;
    ctx.clearRect(0, 0, 720, 360);

    for (let f = 0; f < total; f++) {
      const col = f % cols;
      const row = Math.floor(f / cols);
      const cx = col * fw + fw / 2;
      const cy = row * fh + fh / 2;
      const theta = (f / total) * Math.PI * 2;
      const floatY = Math.sin(theta) * 3.0;
      const jawPulse = Math.abs(Math.sin(theta * 1.5)) * 4;

      ctx.save();
      ctx.translate(cx, cy + floatY);

      // 2.1 广域狂怒幽火狂澜 (Berserk Emerald Soul Storm)
      const storm = ctx.createRadialGradient(0, 0, 15, 0, 0, 85);
      storm.addColorStop(0, 'rgba(6, 214, 160, 0.55)');
      storm.addColorStop(0.45, 'rgba(46, 196, 182, 0.28)');
      storm.addColorStop(0.8, 'rgba(11, 40, 44, 0.1)');
      storm.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = storm;
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.fill();

      // 2.2 左右两颗獠牙副骷髅 (Left & Right Flanking Heads)
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * 42, -2 + Math.sin(theta + side) * 2);
        ctx.rotate(side * 0.38 + Math.sin(theta * 2 + side) * 0.05);
        ctx.scale(0.72, 0.72);

        // 副头骨
        const sGrad = ctx.createRadialGradient(0, -10, 4, 0, 0, 38);
        sGrad.addColorStop(0, '#f8fafc');
        sGrad.addColorStop(0.6, '#94a3b8');
        sGrad.addColorStop(1, '#334155');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(0, -12, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 副头尖锐骨角
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(side * 12, -32);
        ctx.lineTo(side * 28, -52);
        ctx.lineTo(side * 4, -36);
        ctx.closePath();
        ctx.fill();

        // 副头眼窝
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.ellipse(-8, -12, 7, 9, 0.1, 0, Math.PI * 2);
        ctx.ellipse(8, -12, 7, 9, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // 副头凶戾鬼火
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const eSide of [-8, 8]) {
          const eg = ctx.createRadialGradient(eSide, -12, 1, eSide, -12, 10);
          eg.addColorStop(0, '#ffffff');
          eg.addColorStop(0.4, '#80ffdb');
          eg.addColorStop(1, 'rgba(6, 214, 160, 0)');
          ctx.fillStyle = eg;
          ctx.beginPath();
          ctx.arc(eSide, -12, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 狰狞尖锐獠牙 (Snarling Fangs)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.lineTo(-6, 22 + jawPulse);
        ctx.lineTo(0, 10);
        ctx.lineTo(6, 22 + jawPulse);
        ctx.lineTo(12, 10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 2.3 中央主主宰骷髅 (Master Dominant Skull)
      const mGrad = ctx.createRadialGradient(0, -18, 10, 0, -8, 54);
      mGrad.addColorStop(0, '#ffffff');
      mGrad.addColorStop(0.45, '#cbd5e1');
      mGrad.addColorStop(0.8, '#64748b');
      mGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.moveTo(-36, -8);
      ctx.bezierCurveTo(-44, -50, -26, -68, 0, -68);
      ctx.bezierCurveTo(26, -68, 44, -50, 36, -8);
      ctx.bezierCurveTo(32, 14, 22, 22, 16, 26);
      ctx.bezierCurveTo(10, 28, -10, 28, -16, 26);
      ctx.bezierCurveTo(-22, 22, -32, 14, -36, -8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 主头双眼窝与深渊鬼火
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(-16, -14, 12, 15, 0.15, 0, Math.PI * 2);
      ctx.ellipse(16, -14, 12, 15, -0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const side of [-1, 1]) {
        const ex = side * 16, ey = -14;
        const eg = ctx.createRadialGradient(ex, ey, 1, ex, ey, 16);
        eg.addColorStop(0, '#ffffff');
        eg.addColorStop(0.3, '#a7f3d0');
        eg.addColorStop(0.65, '#06d6a0');
        eg.addColorStop(1, 'rgba(6, 214, 160, 0)');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(ex, ey, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 主头咆哮利齿与下颚
      ctx.save();
      ctx.translate(0, jawPulse);
      ctx.fillStyle = '#f8fafc';
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const tx = i * 5.2;
        ctx.beginPath();
        ctx.moveTo(tx - 2, 20);
        ctx.lineTo(tx + 2, 20);
        ctx.lineTo(tx, 30);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 三首白骨黑曜石帝冠 (Obsidian-Bone Crown with Spikes)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-28, -60);
      ctx.lineTo(-20, -84);
      ctx.lineTo(-10, -70);
      ctx.lineTo(0, -90);
      ctx.lineTo(10, -70);
      ctx.lineTo(20, -84);
      ctx.lineTo(28, -60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#06d6a0';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.restore();
    }

    window.__triSkullSheetBase64 = cvs.toDataURL('image/png');
  }

  // ==========================================================
  // 3. 巨型白骨骷髅手臂/利爪序列帧 (720x360, 4x2, 每帧 180x180)
  // ==========================================================
  function generateArmSheet() {
    const cvs = document.getElementById('cvs_arm');
    const ctx = cvs.getContext('2d');
    const cols = 4, rows = 2, total = 8;
    const fw = 180, fh = 180;
    ctx.clearRect(0, 0, 720, 360);

    for (let f = 0; f < total; f++) {
      const col = f % cols;
      const row = Math.floor(f / cols);
      const cx = col * fw + fw / 2;
      const cy = row * fh + fh / 2;
      const theta = (f / total) * Math.PI * 2;
      const clench = Math.sin(theta) * 0.2;
      const bob = Math.cos(theta) * 3;

      ctx.save();
      ctx.translate(cx, cy + bob);

      // 3.1 骨爪幽冥冷焰气环 (Ghost Flame Wrist Ring)
      const wGlow = ctx.createRadialGradient(0, 10, 8, 0, 10, 54);
      wGlow.addColorStop(0, 'rgba(6, 214, 160, 0.42)');
      wGlow.addColorStop(0.5, 'rgba(46, 196, 182, 0.18)');
      wGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = wGlow;
      ctx.beginPath();
      ctx.arc(0, 10, 54, 0, Math.PI * 2);
      ctx.fill();

      // 3.2 手臂双骨尺骨与桡骨 (Radius & Ulna Bone Shafts)
      const boneGrad = ctx.createLinearGradient(-18, -60, 18, 0);
      boneGrad.addColorStop(0, '#f8fafc');
      boneGrad.addColorStop(0.5, '#cbd5e1');
      boneGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = boneGrad;

      // 肩骨球铰链 (Humeral Ball)
      ctx.beginPath();
      ctx.arc(0, -56, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 左臂骨 (Ulna)
      ctx.beginPath();
      ctx.moveTo(-12, -50);
      ctx.lineTo(-8, -8);
      ctx.lineTo(-3, -8);
      ctx.lineTo(-6, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 右臂骨 (Radius)
      ctx.beginPath();
      ctx.moveTo(6, -50);
      ctx.lineTo(3, -8);
      ctx.lineTo(8, -8);
      ctx.lineTo(12, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 骨腕关节盘 (Carpal Cluster)
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(0, -4, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3.3 五指巨大指节与锋利骨爪 (5 Giant Skeletal Claws)
      const fingers = [
        { baseAng: -0.65, len1: 22, len2: 24, w: 4.5 }, // 拇指
        { baseAng: -0.32, len1: 28, len2: 30, w: 5.0 }, // 食指
        { baseAng: 0.0,   len1: 32, len2: 34, w: 5.5 }, // 中指 (最长)
        { baseAng: 0.32,  len1: 28, len2: 30, w: 5.0 }, // 无名指
        { baseAng: 0.65,  len1: 22, len2: 24, w: 4.5 }  // 小指
      ];

      for (const fing of fingers) {
        ctx.save();
        ctx.translate(0, 0);
        ctx.rotate(fing.baseAng + clench * (fing.baseAng > 0 ? 1 : -1));

        // 第1节指骨
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-fing.w / 2, 0, fing.w, fing.len1, 2);
        ctx.fill();
        ctx.stroke();

        // 指关节球
        ctx.beginPath();
        ctx.arc(0, fing.len1, fing.w * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 第2节尖锐指尖利刃
        ctx.translate(0, fing.len1);
        ctx.rotate(clench * 0.8);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-fing.w / 2, 0);
        ctx.lineTo(fing.w / 2, 0);
        ctx.lineTo(0, fing.len2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 爪尖冷火微粒
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(6, 214, 160, 0.85)';
        ctx.beginPath();
        ctx.arc(0, fing.len2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      ctx.restore();
    }

    window.__armSheetBase64 = cvs.toDataURL('image/png');
  }

  // ==========================================================
  // 4. 骷髅指节弹幕贴图 (256x256, 中心 128,128, 朝右 +X 旋转尖刺)
  // ==========================================================
  function generateKnuckle() {
    const cvs = document.getElementById('cvs_knuckle');
    const ctx = cvs.getContext('2d');
    const cx = 128, cy = 128;
    ctx.clearRect(0, 0, 256, 256);

    ctx.save();

    // 4.1 幽绿尾焰光晕 (Ghost Trail Glow)
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 95);
    glow.addColorStop(0, 'rgba(6, 214, 160, 0.6)');
    glow.addColorStop(0.4, 'rgba(46, 196, 182, 0.3)');
    glow.addColorStop(0.8, 'rgba(15, 76, 92, 0.08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.fill();

    // 4.2 骷髅指节骨刃主体 (Bone Knuckle Body)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(cx + 85, cy);
    ctx.quadraticCurveTo(cx + 30, cy - 26, cx - 45, cy - 20);
    ctx.quadraticCurveTo(cx - 75, cy - 14, cx - 85, cy);
    ctx.quadraticCurveTo(cx - 75, cy + 14, cx - 45, cy + 20);
    ctx.quadraticCurveTo(cx + 30, cy + 26, cx + 85, cy);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4.3 骨节环带与苍白骨髓高光 (Knuckle Ring & Marrow Ridge)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy, 14, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + 80, cy);
    ctx.lineTo(cx - 75, cy);
    ctx.stroke();

    // 4.4 锋刃幽火星芒
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const starG = ctx.createRadialGradient(cx + 60, cy, 1, cx + 60, cy, 25);
    starG.addColorStop(0, '#ffffff');
    starG.addColorStop(0.4, '#80ffdb');
    starG.addColorStop(1, 'rgba(6, 214, 160, 0)');
    ctx.fillStyle = starG;
    ctx.beginPath();
    ctx.arc(cx + 60, cy, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    window.__knuckleBase64 = cvs.toDataURL('image/png');
  }

  // ==========================================================
  // 5. 追踪型幽冥鬼火弹幕贴图 (256x256, 中心 128,128, 灵焰飞旋)
  // ==========================================================
  function generateGhostFire() {
    const cvs = document.getElementById('cvs_ghost_fire');
    const ctx = cvs.getContext('2d');
    const cx = 128, cy = 128;
    ctx.clearRect(0, 0, 256, 256);

    ctx.save();

    // 5.1 幽冥冷焰外部散开光圈
    const fAura = ctx.createRadialGradient(cx, cy, 15, cx, cy, 110);
    fAura.addColorStop(0, 'rgba(6, 214, 160, 0.75)');
    fAura.addColorStop(0.35, 'rgba(46, 196, 182, 0.45)');
    fAura.addColorStop(0.7, 'rgba(15, 76, 92, 0.15)');
    fAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fAura;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.fill();

    // 5.2 飞旋火焰舌翼 (Swirling Soul Flame Tendrils)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);

      const fLen = 55 + (i % 3) * 22;
      const grad = ctx.createLinearGradient(0, 0, fLen, 0);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#80ffdb');
      grad.addColorStop(0.7, '#06d6a0');
      grad.addColorStop(1, 'rgba(6, 214, 160, 0)');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(10, -10);
      ctx.quadraticCurveTo(fLen * 0.5, -20, fLen, 0);
      ctx.quadraticCurveTo(fLen * 0.5, 10, 10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 5.3 鬼火核心隐现的怨灵微小骷髅印记 (Ghostly Skull Core)
    const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 28);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, '#a7f3d0');
    coreGrad.addColorStop(1, 'rgba(6, 214, 160, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();

    // 骷髅微印
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 4, 3.5, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();

    window.__ghostFireBase64 = cvs.toDataURL('image/png');
  }
</script>
</body>
</html>`;

  const tmpHtmlPath = path.join(__dirname, 'temp_corpse_assets_gen.html');
  fs.writeFileSync(tmpHtmlPath, htmlContent, 'utf8');

  await win.loadFile(tmpHtmlPath);

  // 等待渲染生成
  let ready = false;
  for (let i = 0; i < 35; i++) {
    await new Promise(r => setTimeout(r, 200));
    ready = await win.webContents.executeJavaScript('window.__corpseAssetsReady || false');
    if (ready) break;
  }

  if (!ready) {
    console.error('Timed out waiting for corpse assets to be ready');
    process.exit(1);
  }

  const skullB64 = await win.webContents.executeJavaScript('window.__skullSheetBase64');
  const triSkullB64 = await win.webContents.executeJavaScript('window.__triSkullSheetBase64');
  const armB64 = await win.webContents.executeJavaScript('window.__armSheetBase64');
  const knuckleB64 = await win.webContents.executeJavaScript('window.__knuckleBase64');
  const ghostFireB64 = await win.webContents.executeJavaScript('window.__ghostFireBase64');

  try { fs.unlinkSync(tmpHtmlPath); } catch (e) {}

  const pSkull = path.join(__dirname, '..', 'public', 'boss_corpse_skull_sheet.png');
  const pTriSkull = path.join(__dirname, '..', 'public', 'boss_corpse_tri_skull_sheet.png');
  const pArm = path.join(__dirname, '..', 'public', 'boss_corpse_arm_sheet.png');
  const pKnuckle = path.join(__dirname, '..', 'public', 'effect_corpse_knuckle.png');
  const pGhostFire = path.join(__dirname, '..', 'public', 'effect_corpse_ghost_fire.png');

  fs.writeFileSync(pSkull, skullB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(pTriSkull, triSkullB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(pArm, armB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(pKnuckle, knuckleB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(pGhostFire, ghostFireB64.replace(/^data:image\/png;base64,/, ''), 'base64');

  console.log('Successfully generated boss_corpse_skull_sheet.png! Size:', fs.statSync(pSkull).size);
  console.log('Successfully generated boss_corpse_tri_skull_sheet.png! Size:', fs.statSync(pTriSkull).size);
  console.log('Successfully generated boss_corpse_arm_sheet.png! Size:', fs.statSync(pArm).size);
  console.log('Successfully generated effect_corpse_knuckle.png! Size:', fs.statSync(pKnuckle).size);
  console.log('Successfully generated effect_corpse_ghost_fire.png! Size:', fs.statSync(pGhostFire).size);

  app.quit();
});
