import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004,
    host: true,
    open: false,
    strictPort: true,
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob:; object-src 'none';"
    }
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'util'],
    exclude: ['ethers'],
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {
          buffer: 'Buffer',
        },
      },
    },
    target: 'esnext',
    minify: false, // Disable minification to avoid eval issues
  },
  esbuild: {
    target: 'esnext',
    keepNames: true,
  }
})
