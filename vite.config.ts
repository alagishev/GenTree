import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const devPort = Number(process.env.GENTREE_DEV_PORT || 5318)

export default defineConfig({
  plugins: [react()],
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
})
