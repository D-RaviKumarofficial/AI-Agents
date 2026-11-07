import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// FastAPI backend (see ../backend). Requests to /api/* are proxied to it and the
// "/api" prefix is removed, so the browser calls /api/v1/... and FastAPI sees /v1/...
const backend = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  build: { outDir: 'dist', target: 'es2022' }
});
