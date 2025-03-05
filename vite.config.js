import { defineConfig } from 'vite'

export default defineConfig({
  base: '/map/',
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext'
  },
})
