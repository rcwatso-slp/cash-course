import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' makes the build work at any GitHub Pages path (username.github.io/repo-name/)
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
