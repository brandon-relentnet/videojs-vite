import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    },
  },
});
