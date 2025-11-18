import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: [
      'src/pages/RegistroUsuarios.test.tsx',
      'src/pages/Login.test.tsx',
      'src/pages/Vehicles.test.tsx'
    ],
    exclude: ['**/node_modules/**', '**/dist/**']
  },
});

