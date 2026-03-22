import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'

const devPort = Number(process.env.GENTREE_DEV_PORT || 5318)

function cloudflareWebAnalyticsPlugin(mode: string, envDir: string): Plugin {
  const env = loadEnv(mode, envDir, '')
  const webBuild = env.VITE_CF_WEB === '1' || env.VITE_CF_WEB === 'true'
  const token = env.VITE_CF_BEACON_TOKEN?.trim()

  return {
    name: 'cloudflare-web-analytics',
    transformIndexHtml(html) {
      if (!webBuild || !token) return html
      const payload = JSON.stringify({ token })
      const snippet = `<!-- Cloudflare Web Analytics --><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${payload}'></script><!-- End Cloudflare Web Analytics -->`
      return html.replace('</body>', `${snippet}\n    </body>`)
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), cloudflareWebAnalyticsPlugin(mode, process.cwd())],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: devPort,
    // Next free port if busy (dev server is started from scripts/run-dev.cjs and passes port to Electron).
    strictPort: false,
  },
}))
