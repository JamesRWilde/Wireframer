import { test, expect } from '@playwright/test';

test('no console errors on load', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('/');

  // Wait for page to settle — JS to finish importing and initializing
  await page.waitForTimeout(3000);

  if (errors.length > 0) console.log('CONSOLE ERRORS:', errors);
  expect(errors).toEqual([]);
});
