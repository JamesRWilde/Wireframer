import { test, expect } from '@playwright/test';

/**
 * Persistent watcher: attaches once and collects throughout the test
 */
function createPersistentConsoleWatcher(page) {
  const issues = [];

  const onConsole = (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      const text = msg.text();
      const loc = msg.location ? msg.location() : null;
      const where = loc ? ` (${loc.url.split('/').pop() || 'page'}:${loc.lineNumber || '?'}:${loc.columnNumber || '?'})` : '';
      const entry = `[${type.toUpperCase()}] ${text}${where}`;
      issues.push(entry);
      console.log(`CONSOLE CAUGHT: ${entry}`); // immediate visibility in test output
    }
  };

  const onPageError = (err) => {
    const entry = `[PAGEERROR] ${err.message}\n${err.stack || ''}`;
    issues.push(entry);
    console.log(`PAGEERROR CAUGHT: ${entry}`);
  };

  // Attach once and keep listening
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    issues,  // direct reference – we check subsets via length or content
    hasIssues() {
      return issues.length > 0;
    },
    // Optional: if you want to reset checks between sections (rarely needed)
    clearIssues() {
      issues.length = 0;
    }
  };
}

const SETTLE_MS = 500;

function assertClean(issues, label) {
  if (issues.length > 0) {
    console.log(`CONSOLE ISSUES [${label}]:`, issues);
  }
  expect(issues, label).toEqual([]);
}

// Full regression: one browser session, GPU then CPU.
test('full regression: GPU then CPU', async ({ page }) => {
  // ── Create persistent watcher FIRST ─────────────────────────────────
  const watcher = createPersistentConsoleWatcher(page);

  // ── Load ────────────────────────────────────────────────────────────
  await page.goto('/');
  await page.waitForTimeout(3000);
  assertClean(watcher.issues, 'initial load');

  // ── GPU: shapes ─────────────────────────────────────────────────────
  const select = page.locator('#obj-select');
  const values = await select.evaluate(sel =>
    Array.from(sel.options).map(o => o.value)
  );
  const sample = values.length > 6
    ? [...values.slice(0, 5), values[values.length - 1]]
    : values;

  for (const value of sample) {
    await select.selectOption(value);
    await page.waitForTimeout(SETTLE_MS);
    assertClean(watcher.issues, `GPU shape: ${value}`);
  }

  // ── GPU: theme ──────────────────────────────────────────────────────
  const themeSelect = page.locator('#theme-mode');
  for (const mode of ['light', 'dark']) {
    await themeSelect.selectOption(mode);
    await page.waitForTimeout(SETTLE_MS);
    assertClean(watcher.issues, `GPU theme: ${mode}`);
  }

  // ── GPU: swatches ───────────────────────────────────────────────────
  {
    const swatches = page.locator('#preset-swatches .preset-swatch');
    const count = await swatches.count();
    for (let i = 0; i < count; i++) {
      await swatches.nth(i).click();
      await page.waitForTimeout(SETTLE_MS);
    }
    assertClean(watcher.issues, 'GPU swatches');
  }

  // ── GPU: sliders ────────────────────────────────────────────────────
  {
    const sliders = [
      { id: '#lod-slider', name: 'lod' },
      { id: '#fill-opacity', name: 'fill-opacity' },
      { id: '#wire-opacity', name: 'wire-opacity' },
      { id: '#bg-density', name: 'bg-density' },
      { id: '#bg-velocity', name: 'bg-velocity' },
      { id: '#bg-opacity', name: 'bg-opacity' },
      { id: '#custom-red', name: 'custom-red' },
      { id: '#custom-green', name: 'custom-green' },
      { id: '#custom-blue', name: 'custom-blue' },
    ];

    for (const slider of sliders) {
      const el = page.locator(slider.id);
      const min = Number(await el.getAttribute('min')) || 0;
      const max = Number(await el.getAttribute('max')) || 100;

      for (const pct of [0, 25, 50, 75, 100]) {
        const val = Math.round(min + (max - min) * (pct / 100));
        await el.fill(String(val));
        await el.dispatchEvent('input');
        await page.waitForTimeout(SETTLE_MS);
      }

      assertClean(watcher.issues, `GPU slider: ${slider.name}`);
    }
  }

  // ── Toggle to CPU ───────────────────────────────────────────────────
  const statRenderer = page.locator('#stat-renderer');
  await statRenderer.click();
  await page.waitForTimeout(2000);
  const rendererText = await statRenderer.textContent();
  expect(rendererText.toLowerCase()).toContain('cpu');

  assertClean(watcher.issues, 'after switch to CPU');

  // ── CPU: shapes ─────────────────────────────────────────────────────
  for (const value of sample) {
    await select.selectOption(value);
    await page.waitForTimeout(SETTLE_MS);
    assertClean(watcher.issues, `CPU shape: ${value}`);
  }

  // ── CPU: theme ──────────────────────────────────────────────────────
  for (const mode of ['light', 'dark']) {
    await themeSelect.selectOption(mode);
    await page.waitForTimeout(SETTLE_MS);
    assertClean(watcher.issues, `CPU theme: ${mode}`);
  }

  // ── CPU: swatches ───────────────────────────────────────────────────
  {
    const swatches = page.locator('#preset-swatches .preset-swatch');
    const count = await swatches.count();
    for (let i = 0; i < count; i++) {
      await swatches.nth(i).click();
      await page.waitForTimeout(SETTLE_MS);
    }
    assertClean(watcher.issues, 'CPU swatches');
  }

  // ── CPU: sliders ────────────────────────────────────────────────────
  {
    const sliders = [
      { id: '#lod-slider', name: 'lod' },
      { id: '#fill-opacity', name: 'fill-opacity' },
      { id: '#wire-opacity', name: 'wire-opacity' },
      { id: '#bg-density', name: 'bg-density' },
      { id: '#bg-velocity', name: 'bg-velocity' },
      { id: '#bg-opacity', name: 'bg-opacity' },
      { id: '#custom-red', name: 'custom-red' },
      { id: '#custom-green', name: 'custom-green' },
      { id: '#custom-blue', name: 'custom-blue' },
    ];

    for (const slider of sliders) {
      const el = page.locator(slider.id);
      const min = Number(await el.getAttribute('min')) || 0;
      const max = Number(await el.getAttribute('max')) || 100;

      for (const pct of [0, 25, 50, 75, 100]) {
        const val = Math.round(min + (max - min) * (pct / 100));
        await el.fill(String(val));
        await el.dispatchEvent('input');
        await page.waitForTimeout(SETTLE_MS);
      }

      assertClean(watcher.issues, `CPU slider: ${slider.name}`);
    }
  }

  // Final safety net – though each section already checks
  assertClean(watcher.issues, 'final check – entire test');
});