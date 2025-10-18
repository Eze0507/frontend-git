// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; // <--- 1. Importar 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {              // <--- 2. Añadir la sección 'resolve'
    alias: {
      '@': path.resolve(__dirname, './src'), // <--- 3. Definir el alias '@'
    },
  },
})