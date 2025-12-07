import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Proxy para todas as rotas da API do backend
      '/listAllPods': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
      '/listAllDeployments': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
      '/listAllNs': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
      '/createResource': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
      '/deletePod': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
