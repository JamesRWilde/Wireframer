import { test, expect } from '@playwright/test';

test('no console errors or warnings on load', async ({ page }) => {
    const issues = [];
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') issues.push(msg.text());
    });
    page.on('pageerror', err => issues.push(err.message));

    await page.goto('/');

    // Wait for page to settle — JS to finish importing and initializing
    await page.waitForTimeout(3000);

    if (issues.length > 0) console.log('CONSOLE ISSUES:', issues);
    expect(issues).toEqual([]);
});
