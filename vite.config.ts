import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://167.99.214.245',
        changeOrigin: true,
        secure: false,
      },
      '/listen': {
        target: 'http://167.99.214.245',
        changeOrigin: true,
        secure: false,
      },
      '/recordings': {
        target: 'http://167.99.214.245:3000',
        changeOrigin: true,
        secure: false,
      },
      '/api-recordings': {
        target: 'http://167.99.214.245:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})