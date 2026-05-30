import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [react(), glsl()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      thresholds: { lines: 70, functions: 60, branches: 70, statements: 70 },
      exclude: ['src/gl/**', 'src/test/**', '**/*.test.*', '**/*.config.*'],
    },
  },
})
