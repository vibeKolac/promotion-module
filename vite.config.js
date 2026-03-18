// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    css: false,
    setupFiles: ['./tests/vitest.setup.js'],
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
  },
})
