/**
 * renderState.js - Centralized Render State Store
 *
 * Single source of truth for all render-relevant state.
 * Writers set values here; readers consume them with
 * automatic caching of derived computations.
 *
 * DESIGN:
 * - Source values: set by UI controls (theme, opacity, mode)
 * - Derived cache: recomputed only when source version changes
 * - Consumers call getter functions; cache is transparent
 *
 * REPLACES:
 * - globalThis.THEME / THEME_MODE
 * - globalThis.FILL_OPACITY / WIRE_OPACITY
 * - Per-frame relativeLuminance + rgbaString for edge color
 * - Per-frame theme RGB hex parsing (shadeDark, shadeBright)
 */

"use strict";

// ══════════════════════════════════════════════
// Source values (set by UI, read by renderers)
// ══════════════════════════════════════════════

export let theme = null;
export let themeMode = 'dark';
export let fillOpacity = 1;
export let wireOpacity = 1;

// ══════════════════════════════════════════════
// Version counters (bump when source changes)
// ══════════════════════════════════════════════

let _themeVer = 0;
let _opacityVer = 0;

// ══════════════════════════════════════════════
// Derived caches
// ══════════════════════════════════════════════

let _shadeDarkRgb = null;
let _shadeBrightRgb = null;
let _fillRgb = null;
let _edgeColor = null;
let _cacheVer = -1;

// ══════════════════════════════════════════════
// Setters (called by UI controls)
// ══════════════════════════════════════════════

/** Set the active theme palette object */
export function setTheme(t) {
  theme = t;
  _themeVer++;
  _cacheVer = -1; // force derived rebuild
}

/** Set theme mode ('dark' | 'light') */
export function setThemeMode(mode) {
  themeMode = mode === 'light' ? 'light' : 'dark';
}

/** Set fill opacity (0-1) */
export function setFillOpacity(v) {
  fillOpacity = v;
  _opacityVer++;
}

/** Set wire opacity (0-1) */
export function setWireOpacity(v) {
  wireOpacity = v;
  _opacityVer++;
}

// ══════════════════════════════════════════════
// Derived value getters (cached)
// ══════════════════════════════════════════════

function rebuildDerivedCache() {
  if (_cacheVer === _themeVer) return;
  _cacheVer = _themeVer;

  const t = theme;

  // shadeDark / shadeBright are RGB arrays from bldCustomTheme
  const dark = t?.shadeDark;
  _shadeDarkRgb = Array.isArray(dark) ? dark : [0, 0, 0];

  const bright = t?.shadeBright;
  _shadeBrightRgb = Array.isArray(bright) ? bright : [255, 255, 255];

  // Fill color
  const fill = t?.fill;
  _fillRgb = Array.isArray(fill) ? fill : [0, 200, 120];

  // Edge color: contrast with fill luminance
  const lum = relativeLuminanceRaw(_fillRgb);
  _edgeColor = lum > 0.5 ? '#000000' : '#ffffff';
}

/**
 * relativeLuminanceRaw - WCAG luminance from RGB array
 * Inlined here to avoid importing from ui/get/color/ for hot path.
 */
function relativeLuminanceRaw(rgb) {
  const r = linear(rgb[0]);
  const g = linear(rgb[1]);
  const b = linear(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function linear(v) {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

// ══════════════════════════════════════════════
// Public getters
// ══════════════════════════════════════════════

/** @returns {[number,number,number]} shadeDark as [r,g,b] */
export function getShadeDarkRgb() {
  rebuildDerivedCache();
  return _shadeDarkRgb;
}

/** @returns {[number,number,number]} shadeBright as [r,g,b] */
export function getShadeBrightRgb() {
  rebuildDerivedCache();
  return _shadeBrightRgb;
}

/** @returns {[number,number,number]} fill color as [r,g,b] */
export function getFillRgb() {
  rebuildDerivedCache();
  return _fillRgb;
}

/** @returns {string} edge color as '#000000' or '#ffffff' */
export function getEdgeColor() {
  rebuildDerivedCache();
  return _edgeColor;
}

/** @returns {number} fill opacity (0-1) */
export function getFillOpacity() { return fillOpacity; }

/** @returns {number} wire opacity (0-1) */
export function getWireOpacity() { return wireOpacity; }

// ══════════════════════════════════════════════
// Bridge: migrate existing globalThis reads
// ══════════════════════════════════════════════

/**
 * Sync renderState from current globalThis values.
 * Call once per frame (cheap if nothing changed — version checks are fast).
 * This is a migration bridge: once all writers call the setters above
 * directly, this function becomes unnecessary.
 */
export function syncFromGlobals() {
  if (globalThis.THEME !== theme) setTheme(globalThis.THEME);
  if (globalThis.THEME_MODE !== themeMode) setThemeMode(globalThis.THEME_MODE);
  if (globalThis.FILL_OPACITY !== fillOpacity) setFillOpacity(globalThis.FILL_OPACITY);
  if (globalThis.WIRE_OPACITY !== wireOpacity) setWireOpacity(globalThis.WIRE_OPACITY);
}
