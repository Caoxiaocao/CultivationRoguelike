import { defineConfig } from 'vite'

// 端口集中在这里定义；tools/dev-electron.mjs 使用同一个环境变量与默认值，
// 避免两处各写一个数字而失配。
//
// 默认改为 5173（Vite 惯例）。原先的 3000 常年被 Clash Verge（进程名 verge-mihomo）
// 的外部控制端口占用，Windows 下冲突会报
//   Error: listen EACCES: permission denied 127.0.0.1:3000
// 看起来像"权限不足"，实际是端口已被别的程序绑定（Windows 对已占用地址返回 WSAEACCES）。
//
// 需要换端口时：PORT=4000 npm run dev
const PORT = Number(process.env.PORT) || 5173

export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: PORT,
    // Electron 要加载一个确定的地址，因此端口被占用时直接失败，
    // 而不是静默切换到别的端口导致两边对不上。
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: PORT,
    strictPort: true,
  },
})
