'use strict'

const http = require('node:http')
const path = require('node:path')
const { execSync, spawn } = require('node:child_process')

const root = path.join(__dirname, '..')
const bin = path.join(root, 'node_modules', '.bin')
const pathEnv = `${bin}${path.delimiter}${process.env.PATH || ''}`

execSync('npm run build:electron', {
  cwd: root,
  env: { ...process.env, PATH: pathEnv },
  stdio: 'inherit',
  shell: true,
})

function waitForDevServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Dev server did not respond in time: ${url}`))
        return
      }
      http
        .get(url, { timeout: 2000 }, (res) => {
          res.resume()
          resolve()
        })
        .on('error', () => setTimeout(attempt, 100))
    }
    attempt()
  })
}

async function main() {
  const { createServer } = await import('vite')
  const server = await createServer({
    root,
    configFile: path.join(root, 'vite.config.ts'),
  })
  await server.listen()

  const devUrl = server.resolvedUrls?.local?.[0] ?? server.resolvedUrls?.network?.[0]
  if (!devUrl) throw new Error('Vite did not expose resolvedUrls after listen()')

  await waitForDevServer(devUrl)

  const env = {
    ...process.env,
    PATH: pathEnv,
    NODE_ENV: 'development',
    GENTREE_DEV_URL: devUrl,
  }

  const electron = spawn('electron', ['.'], {
    cwd: root,
    env,
    stdio: 'inherit',
    shell: true,
  })

  const shutdown = async () => {
    electron.kill()
    await server.close().catch(() => {})
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown())
  process.on('SIGTERM', () => void shutdown())

  electron.on('exit', () => {
    void server.close().finally(() => process.exit(0))
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
