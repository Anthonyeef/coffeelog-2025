import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Default to root path for direct Vercel access
  // Can be overridden with VITE_BASE_URL env var if needed for proxy setup
  base: process.env.VITE_BASE_URL || '/',
})

