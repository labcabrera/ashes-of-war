import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // @asciidoctor/core (Opal runtime) references the Node.js `global` variable;
    // this polyfill makes it available in the browser context.
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@asciidoctor/core'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
