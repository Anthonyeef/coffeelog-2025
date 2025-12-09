import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use environment variable for base path, default to '/coffee-2025/' for production
  // When accessed directly on Vercel, VITE_BASE_URL should be '/'
  base: process.env.VITE_BASE_URL || '/coffee-2025/',
})

