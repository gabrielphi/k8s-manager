import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reactGrab } from 'react-grab/plugins/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reactGrab(),
  ],
  server: {
    port: 3000,
    host: true
  }
})
