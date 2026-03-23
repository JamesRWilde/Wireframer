import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    {
      name: 'gpu',
      use: { browserName: 'chromium', headless: false },
    },
  ],
  webServer: {
    command: 'node server.js',
    port: 3000,
    reuseExistingServer: true,
  },
});
