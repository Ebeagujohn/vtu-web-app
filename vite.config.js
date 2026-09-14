import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 🌟 Added Tailwind v4 Vite Plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})