import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  globalSetup: './tests/global-setup.js',
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
