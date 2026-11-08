import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { include: ['engine/test/**/*.test.ts', 'bots/test/**/*.test.ts'] },
} as never);
