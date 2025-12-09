import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use /coffee-2025/ base path for deployment at yifen.me/coffee-2025
  // Can be overridden with VITE_BASE_URL env var if needed
  base: process.env.VITE_BASE_URL || '/coffee-2025/',
})

