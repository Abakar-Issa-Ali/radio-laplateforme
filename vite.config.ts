import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicBase = env.VITE_PUBLIC_BASE || 'http://167.99.214.245'
  const recordingsBase = env.VITE_RECORDINGS_API_URL || 'http://167.99.214.245:3000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: publicBase,
          changeOrigin: true,
          secure: false,
        },
        '/listen': {
          target: publicBase,
          changeOrigin: true,
          secure: false,
        },
        '/recordings': {
          target: recordingsBase,
          changeOrigin: true,
          secure: false,
        },
        '/api-recordings': {
          target: recordingsBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})