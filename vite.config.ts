import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,           // Permite usar describe, it, expect sin importar
    environment: 'jsdom',    // Simula el navegador para React
    setupFiles: './src/test/setup.ts',  // Archivo de configuración inicial
    css: true,               // Procesa archivos CSS
  },
});


