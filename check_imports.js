import { test } from '@playwright/test';

test('find broken import', async ({ page }) => {
  const failed = [];
  page.on('response', response => {
    if (response.status() === 404) {
      failed.push(response.url());
    }
  });
  await page.goto('/');
  await page.waitForTimeout(3000);
  console.log('404 URLs:', JSON.stringify(failed, null, 2));
});
