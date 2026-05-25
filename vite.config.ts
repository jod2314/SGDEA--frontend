import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  test: {
    // Entorno que simula el DOM del navegador
    environment: 'jsdom',
    // Archivo que extiende los matchers de Vitest con los de @testing-library
    setupFiles: ['./src/test/setup.ts'],
    // Permite usar describe/it/expect sin importar explícitamente
    globals: true,
    // Excluir el plugin react-refresh en entorno de test (causa conflictos con jsdom)
    server: {
      deps: {
        inline: mode === 'test' ? ['@vitejs/plugin-react'] : [],
      },
    },
  },
}))

