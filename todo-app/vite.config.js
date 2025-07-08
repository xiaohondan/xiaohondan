import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true,
    allowedHosts: [
      '1dtravjxrm-5173.cnb.run',
      'localhost'
    ]
  }
})