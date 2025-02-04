import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules/**/*',
      'dist_*/**/*',
      'src/**/*setup.ts',
      'src/**/*.d.ts',
      'src/pages/**/*',
      'src/background/**/*',
      'src/assets/**/*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist_*/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/setup.ts',
        '**/__mocks__/**',
        '**/mocks/**'
      ],
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 10000,
    isolate: true,
    sequence: {
      shuffle: false
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@locales': path.resolve(__dirname, './src/locales'),
      '@pages': path.resolve(__dirname, './src/pages')
    },
  },
});