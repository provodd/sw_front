import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Песочница: бэкенда нет — все данные отдаёт мок в src/api.js,
// поэтому dev-прокси на API здесь не нужен.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: true,
  },
})
