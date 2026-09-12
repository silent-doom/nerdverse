import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react({ include: /\.(jsx|js|tsx|ts)$/ })],
  oxc: {
    jsx: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    include: ['tests/**/*.test.{js,jsx}', 'src/**/*.test.{js,jsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
