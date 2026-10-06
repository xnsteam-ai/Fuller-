import { defineConfig } from '@playwright/test';
import { existsSync } from 'fs';

const exe = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
export default defineConfig({
  testDir: './tests',
  webServer: { command: 'npm run build && npm start', url: 'http://localhost:3100', reuseExistingServer: true, timeout: 240_000 },
  use: { baseURL: 'http://localhost:3100', launchOptions: exe ? { executablePath: exe } : {} },
});
