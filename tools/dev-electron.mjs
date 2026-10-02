/**
 * Electron 开发启动器 —— 让 `npm run electron:dev` 真正跑 Vite dev server
 *
 * 背景：原脚本是 `vite build && electron .`，即每次先构建再加载 dist 静态文件。
 * electron/main.cjs 里虽然读取 process.env.VITE_DEV_SERVER_URL，但**没有任何脚本设置它**，
 * 所以那段分支从未生效，改代码必须重新构建 —— 等于没有 HMR。
 *
 * 本脚本做的事：
 *   1. 启动 vite dev server（端口与 vite.config.js 同一来源）
 *   2. 轮询端口直到可连接
 *   3. 带上 VITE_DEV_SERVER_URL 启动 electron
 *   4. electron 退出后关掉 vite；Ctrl+C 时两者一起收摊
 *
 * 用法:
 *   npm run electron:dev
 *   PORT=4000 npm run electron:dev
 */
import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const PORT = Number(process.env.PORT) || 5173
const HOST = '127.0.0.1'
const URL = `http://${HOST}:${PORT}`

const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
// require('electron') 在 Node 进程里返回 electron 可执行文件的绝对路径
let electronBin
try {
  electronBin = require('electron')
} catch {
  console.error('[dev] 找不到 electron，请先执行 npm install')
  process.exit(1)
}

const children = []
let shuttingDown = false

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const c of children) {
    if (c && !c.killed) {
      try { c.kill() } catch { /* 已退出 */ }
    }
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

function waitForPort(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const sock = net.connect({ host: HOST, port })
      sock.once('connect', () => { sock.destroy(); resolve() })
      sock.once('error', () => {
        sock.destroy()
        if (Date.now() > deadline) reject(new Error(`等待 ${HOST}:${port} 超时`))
        else setTimeout(tryOnce, 200)
      })
    }
    tryOnce()
  })
}

console.log(`[dev] 启动 Vite dev server: ${URL}`)
const vite = spawn(process.execPath, [viteBin], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, PORT: String(PORT) },
})
children.push(vite)
vite.on('exit', (code) => {
  if (!shuttingDown) {
    console.error(`[dev] Vite 提前退出（code ${code}）。若提示 EACCES/EADDRINUSE，说明端口被占用，可用 PORT=4000 换一个。`)
    shutdown(code ?? 1)
  }
})

try {
  await waitForPort(PORT)
} catch (err) {
  console.error(`[dev] ${err.message}`)
  shutdown(1)
}

console.log(`[dev] dev server 就绪，启动 Electron（加载 ${URL}）`)
const electron = spawn(electronBin, ['.'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_SERVER_URL: URL },
})
children.push(electron)

electron.on('exit', (code) => {
  console.log(`[dev] Electron 已退出（code ${code}），关闭 dev server`)
  shutdown(code ?? 0)
})
