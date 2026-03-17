/**
 * renderState.js - Centralized Render State Store
 *
 * Single source of truth for all render-relevant state.
 * Writers set values via setters; readers consume via getters
 * with automatic caching of derived computations.
 *
 * No globalThis. No backdoor reads. State or go home.
 *
 * SOURCE VALUES:
 *   theme, themeMode, fillOpacity, wireOpacity
 *
 * DERIVED CACHES (rebuilt only on change):
 *   shadeDark/shadeBright RGB, fill RGB, edge color,
 *   bg color, particle color
 */

"use strict";

// ══════════════════════════════════════════════
// Source values (private — setters/getters only)
// ══════════════════════════════════════════════

let _theme = null;
let _themeMode = 'dark';
let _fillOpacity = 1;
let _wireOpacity = 1;

// ══════════════════════════════════════════════
// Version counter (bump when theme changes)
// ══════════════════════════════════════════════

let _themeVer = 0;

// ══════════════════════════════════════════════
// Derived caches (rebuilt only on theme change)
// ══════════════════════════════════════════════

let _shadeDarkRgb = [0, 0, 0];
let _shadeBrightRgb = [255, 255, 255];
let _fillRgb = [0, 200, 120];
let _edgeColor = '#ffffff';
let _bgRgb = [0, 0, 0];
let _bgColor = 'rgba(0,0,0,1)';
let _particleColor = 'rgba(200,220,255,1)';
let _cacheVer = -1;

// ══════════════════════════════════════════════
// Setters (called by UI controls only)
// ══════════════════════════════════════════════

/** Set the active theme palette object */
export function setTheme(t) {
  _theme = t;
  _themeVer++;
  _cacheVer = -1; // force derived rebuild
}

/** Set theme mode ('dark' | 'light') */
export function setThemeMode(mode) {
  _themeMode = mode === 'light' ? 'light' : 'dark';
}

/** Set fill opacity (0-1) */
export function setFillOpacity(v) {
  _fillOpacity = v;
}

/** Set wire opacity (0-1) */
export function setWireOpacity(v) {
  _wireOpacity = v;
}

// ══════════════════════════════════════════════
// Derived value cache rebuild
// ══════════════════════════════════════════════

function rebuildDerivedCache() {
  if (_cacheVer === _themeVer) return;
  _cacheVer = _themeVer;

  const t = _theme;

  // Shade colors (RGB arrays from bldCustomTheme)
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

  // Background color
  const bg = t?.bg;
  _bgRgb = Array.isArray(bg) ? bg : [0, 0, 0];
  _bgColor = `rgba(${_bgRgb[0]},${_bgRgb[1]},${_bgRgb[2]},1)`;

  // Particle color (theme particle, fallback to default)
  const particle = t?.particle;
  if (Array.isArray(particle)) {
    _particleColor = `rgba(${particle[0]},${particle[1]},${particle[2]},1)`;
  } else {
    _particleColor = 'rgba(200,220,255,1)';
  }
}

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
// Public getters (read from state, not globalThis)
// ══════════════════════════════════════════════

/** @returns {number} fill opacity (0-1) */
export function getFillOpacity() { return _fillOpacity; }

/** @returns {number} wire opacity (0-1) */
export function getWireOpacity() { return _wireOpacity; }

/** @returns {string} theme mode ('dark' | 'light') */
export function getThemeMode() { return _themeMode; }

/** @returns {object|null} theme palette object */
export function getTheme() { return _theme; }

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

/** @returns {[number,number,number]} background color as [r,g,b] */
export function getBgRgb() {
  rebuildDerivedCache();
  return _bgRgb;
}

/** @returns {string} background color as 'rgba(r,g,b,1)' */
export function getBgColor() {
  rebuildDerivedCache();
  return _bgColor;
}

/** @returns {string} particle color as 'rgba(r,g,b,1)' */
export function getParticleColor() {
  rebuildDerivedCache();
  return _particleColor;
}
