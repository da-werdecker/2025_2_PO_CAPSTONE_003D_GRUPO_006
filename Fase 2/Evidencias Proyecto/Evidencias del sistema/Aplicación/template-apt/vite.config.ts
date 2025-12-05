import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // Plugin para agregar headers de seguridad
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          // Content Security Policy (CSP)
          // Versión optimizada: reduce alertas sin afectar funcionalidad
          // Nota: 'unsafe-inline' y 'unsafe-eval' son necesarios para Vite HMR en desarrollo
          // Especificamos puertos exactos en lugar de wildcards para reducir alertas
          const port = server.config.server?.port || 5173;
          res.setHeader(
            'Content-Security-Policy',
            `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:${port} ws://localhost:${port}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:${port} ws://localhost:${port} https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;`
          );

          // X-Frame-Options: Previene clickjacking
          res.setHeader('X-Frame-Options', 'DENY');

          // X-Content-Type-Options: Previene MIME-sniffing
          res.setHeader('X-Content-Type-Options', 'nosniff');

          // X-XSS-Protection (opcional, pero recomendado)
          res.setHeader('X-XSS-Protection', '1; mode=block');

          next();
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    force: false, // No forzar reoptimización a menos que sea necesario
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // Configuración de Vitest para testing
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
  },
});
