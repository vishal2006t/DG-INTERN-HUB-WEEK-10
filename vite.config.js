import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/DG-INTERN-HUB-WEEK-8/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})