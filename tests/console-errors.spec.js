import { test, expect } from '@playwright/test';

/**
 * Helper: attach console/pageerror listeners and return an issues collector.
 */
function watchConsole(page) {
  const issues = [];
  const onConsole = msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') issues.push(`[${msg.type()}] ${msg.text()}`);
  };
  const onPageError = err => issues.push(`[pageerror] ${err.message}`);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  return {
    issues,
    detach() {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    }
  };
}

const SETTLE_MS = 500;

function assertClean(issues, label) {
  if (issues.length > 0) console.log(`CONSOLE ISSUES [${label}]:`, issues);
  expect(issues, label).toEqual([]);
}

// Full regression: one browser session, GPU then CPU.
test('full regression: GPU then CPU', async ({ page }) => {
  // ── Load ────────────────────────────────────────────────────────────
  const w0 = watchConsole(page);
  await page.goto('/');
  await page.waitForTimeout(3000);
  assertClean(w0.issues, 'initial load');
  w0.detach();

  // ── GPU: shapes ─────────────────────────────────────────────────────
  const select = page.locator('#obj-select');
  const values = await select.evaluate(sel =>
    Array.from(sel.options).map(o => o.value)
  );
  const sample = values.length > 6
    ? [...values.slice(0, 5), values[values.length - 1]]
    : values;

  for (const value of sample) {
    const w = watchConsole(page);
    await select.selectOption(value);
    await page.waitForTimeout(SETTLE_MS);
    assertClean(w.issues, `GPU shape: ${value}`);
    w.detach();
  }

  // ── GPU: theme ──────────────────────────────────────────────────────
  const themeSelect = page.locator('#theme-mode');
  for (const mode of ['light', 'dark']) {
    const w = watchConsole(page);
    await themeSelect.selectOption(mode);
    await page.waitForTimeout(SETTLE_MS);
    assertClean(w.issues, `GPU theme: ${mode}`);
    w.detach();
  }

  // ── GPU: swatches ───────────────────────────────────────────────────
  {
    const swatches = page.locator('#preset-swatches .preset-swatch');
    const count = await swatches.count();
    const w = watchConsole(page);
    for (let i = 0; i < count; i++) {
      await swatches.nth(i).click();
      await page.waitForTimeout(SETTLE_MS);
    }
    assertClean(w.issues, 'GPU swatches');
    w.detach();
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
      const w = watchConsole(page);

      for (const pct of [0, 25, 50, 75, 100]) {
        const val = Math.round(min + (max - min) * (pct / 100));
        await el.fill(String(val));
        await el.dispatchEvent('input');
        await page.waitForTimeout(SETTLE_MS);
      }

      assertClean(w.issues, `GPU slider: ${slider.name}`);
      w.detach();
    }
  }

  // ── Toggle to CPU ───────────────────────────────────────────────────
  const statRenderer = page.locator('#stat-renderer');
  await statRenderer.click();
  await page.waitForTimeout(2000);
  const rendererText = await statRenderer.textContent();
  expect(rendererText.toLowerCase()).toContain('cpu');

  // ── CPU: shapes ─────────────────────────────────────────────────────
  for (const value of sample) {
    const w = watchConsole(page);
    await select.selectOption(value);
    await page.waitForTimeout(SETTLE_MS);
    assertClean(w.issues, `CPU shape: ${value}`);
    w.detach();
  }

  // ── CPU: theme ──────────────────────────────────────────────────────
  for (const mode of ['light', 'dark']) {
    const w = watchConsole(page);
    await themeSelect.selectOption(mode);
    await page.waitForTimeout(SETTLE_MS);
    assertClean(w.issues, `CPU theme: ${mode}`);
    w.detach();
  }

  // ── CPU: swatches ───────────────────────────────────────────────────
  {
    const swatches = page.locator('#preset-swatches .preset-swatch');
    const count = await swatches.count();
    const w = watchConsole(page);
    for (let i = 0; i < count; i++) {
      await swatches.nth(i).click();
      await page.waitForTimeout(SETTLE_MS);
    }
    assertClean(w.issues, 'CPU swatches');
    w.detach();
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
      const w = watchConsole(page);

      for (const pct of [0, 25, 50, 75, 100]) {
        const val = Math.round(min + (max - min) * (pct / 100));
        await el.fill(String(val));
        await el.dispatchEvent('input');
        await page.waitForTimeout(SETTLE_MS);
      }

      assertClean(w.issues, `CPU slider: ${slider.name}`);
      w.detach();
    }
  }
});
