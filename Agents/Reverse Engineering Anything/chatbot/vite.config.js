import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `vite build` produces the installable package in dist/. `vite` (dev) serves the demo page.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    lib: { entry: 'src/chat-widget.js', formats: ['es'], fileName: 'chat-widget', cssFileName: 'chat-widget' },
    // React comes from the host app so there is only ever one copy.
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{mjs,jsx}']
  }
});
