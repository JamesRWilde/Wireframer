import { test, expect } from '@playwright/test';

test('find 404 url', async ({ page }) => {
  const failed = [];
  page.on('response', response => {
    if (response.status() === 404) {
      failed.push(response.url());
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  await page.goto('/');
  await page.waitForTimeout(5000);
  console.log('404 URLs:', JSON.stringify(failed));
  expect(failed).toEqual([]);
});
