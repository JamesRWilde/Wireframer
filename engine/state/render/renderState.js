/**
 * renderState.js - Centralized Render Appearance State
 *
 * PURPOSE:
 *   Single source of truth for all render-appearance state: theme palette,
 *   theme mode, fill opacity, and wire opacity. Derived color caches
 *   (shade, fill, edge, bg, particle) are rebuilt automatically when the
 *   theme changes, avoiding redundant computation per frame.
 *
 * ARCHITECTURE ROLE:
 *   Writers (UI controls) call setters; readers (render pipeline) call
 *   getters. No global reads, no backdoor state access. The version
 *   counter ensures derived caches only rebuild when theme actually changes.
 *
 * DERIVED CACHE STRATEGY:
 *   _themeVer increments on setTheme(). rebuildDerivedCache() compares
 *   _themeVer to _cacheVer — if they differ, all derived colors are
 *   recomputed and _cacheVer is synced. Getters call rebuildDerivedCache()
 *   on every read, but the rebuild is a no-op when versions match.
 *
 * STATE PARTITIONING:
 *   This file handles appearance only. Other state domains are separate:
 *   - morphState: animation state (engine/state/mesh/morph.js)
 *   - model: current model geometry (engine/state/render/model.js)
 *   - rotationState: rotation matrix (engine/state/render/rotationMatrixRef.js)
 *   - physics: rotation physics and input state (engine/state/render/physicsState.js)
 */

"use strict";

// ══════════════════════════════════════════════
// Source values (private — setters/getters only)
// ══════════════════════════════════════════════

/** @type {Object|null} Active theme palette object (from bldCustomTheme) */
let _theme = null;

/** @type {string} Theme mode: 'dark' or 'light' */
let _themeMode = 'dark';

/** @type {number} Fill wireframe opacity (0-1, default 1) */
let _fillOpacity = 1;

/** @type {number} Wireframe line opacity (0-1, default 1) */
let _wireOpacity = 1;

// ══════════════════════════════════════════════
// Version counter (bump when theme changes)
// ══════════════════════════════════════════════

/** @type {number} Increments on each setTheme() call to invalidate derived cache */
let _themeVer = 0;

// ══════════════════════════════════════════════
// Derived caches (rebuilt only on theme change)
// ══════════════════════════════════════════════

/** @type {[number,number,number]} Dark shade color [r,g,b] */
let _shadeDarkRgb = [0, 0, 0];

/** @type {[number,number,number]} Bright shade color [r,g,b] */
let _shadeBrightRgb = [255, 255, 255];

/** @type {[number,number,number]} Fill color [r,g,b] from theme */
let _fillRgb = [0, 200, 120];

/** @type {string} Edge/wire color: '#000000' or '#ffffff' (contrasts with fill luminance) */
let _edgeColor = '#ffffff';

/** @type {[number,number,number]} Background color [r,g,b] from theme */
let _bgRgb = [0, 0, 0];

/** @type {string} Background as CSS string 'rgba(r,g,b,1)' */
let _bgColor = 'rgba(0,0,0,1)';

/** @type {string} Particle color as CSS string 'rgba(r,g,b,1)' */
let _particleColor = 'rgba(200,220,255,1)';

/** @type {number} Last theme version that derived caches were rebuilt for (-1 = never) */
let _cacheVer = -1;

// ══════════════════════════════════════════════
// Setters (called by UI controls only)
// ══════════════════════════════════════════════

/**
 * setTheme - Sets the active theme palette and invalidates derived caches.
 *
 * Increments the theme version counter, forcing all derived color getters
 * to rebuild their cached values on next read. Call this when the user
 * selects a new theme or generates a random preset.
 *
 * @param {Object|null} t - Theme palette object with properties: shadeDark,
 *   shadeBright, fill, bg, particle (all as [r,g,b] arrays), or null to clear
 * @returns {void}
 */
export function setTheme(t) {
  _theme = t;
  _themeVer++;
  _cacheVer = -1; // force derived rebuild
}

/**
 * setThemeMode - Sets the theme mode to 'dark' or 'light'.
 *
 * Other modes default to 'dark' for safety. The mode affects UI chrome
 * styling but not the rendered mesh colors (those come from the palette).
 *
 * @param {string} mode - Theme mode: 'light' or 'dark'
 * @returns {void}
 */
export function setThemeMode(mode) {
  _themeMode = mode === 'light' ? 'light' : 'dark';
}

/**
 * setFillOpacity - Sets the fill wireframe opacity.
 *
 * @param {number} v - Opacity value (0-1)
 * @returns {void}
 */
export function setFillOpacity(v) {
  _fillOpacity = v;
}

/**
 * setWireOpacity - Sets the wireframe line opacity.
 *
 * @param {number} v - Opacity value (0-1)
 * @returns {void}
 */
export function setWireOpacity(v) {
  _wireOpacity = v;
}

// ══════════════════════════════════════════════
// Derived value cache rebuild
// ══════════════════════════════════════════════

/**
 * rebuildDerivedCache - Rebuilds all derived color caches if theme has changed.
 *
 * Called by every public getter that returns a derived value. Compares
 * _cacheVer to _themeVer — rebuilds only if they differ, making repeated
 * calls within the same theme a no-op.
 *
 * Extracts colors from the theme palette with fallback defaults for
 * missing or invalid properties. Computes edge color from fill luminance
 * (black edge on light fill, white edge on dark fill).
 *
 * @returns {void}
 * @private
 */
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

/**
 * relativeLuminanceRaw - Computes relative luminance from an RGB colour.
 *
 * Uses the sRGB to linear conversion per W3C WCAG 2.0 formula.
 * Returns 0-1 where 0 = black, 1 = white.
 *
 * @param {[number,number,number]} rgb - Colour as [r,g,b] (0-255 each)
 * @returns {number} Relative luminance (0-1)
 * @private
 */
function relativeLuminanceRaw(rgb) {
  const r = linear(rgb[0]);
  const g = linear(rgb[1]);
  const b = linear(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * linear - Converts a single sRGB channel value to linear intensity.
 *
 * @param {number} v - sRGB channel value (0-255)
 * @returns {number} Linear intensity (0-1)
 * @private
 */
function linear(v) {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

// ══════════════════════════════════════════════
// Public getters (read from state, not legacy global object)
// ══════════════════════════════════════════════

/**
 * getFillOpacity - Returns the current fill wireframe opacity.
 *
 * @returns {number} Fill opacity (0-1)
 */
export function getFillOpacity() { return _fillOpacity; }

/**
 * getWireOpacity - Returns the current wireframe line opacity.
 *
 * @returns {number} Wire opacity (0-1)
 */
export function getWireOpacity() { return _wireOpacity; }

/**
 * getThemeMode - Returns the current theme mode.
 *
 * @returns {string} Theme mode: 'dark' or 'light'
 */
export function getThemeMode() { return _themeMode; }

/**
 * getTheme - Returns the active theme palette object.
 *
 * @returns {Object|null} Theme palette with properties: shadeDark, shadeBright,
 *   fill, bg, particle (all as [r,g,b] arrays), or null if no theme is set
 */
export function getTheme() { return _theme; }

/**
 * getShadeDarkRgb - Returns the dark shade color from the current theme.
 *
 * @returns {[number,number,number]} Dark shade as [r,g,b] (0-255)
 */
export function getShadeDarkRgb() {
  rebuildDerivedCache();
  return _shadeDarkRgb;
}

/**
 * getShadeBrightRgb - Returns the bright shade color from the current theme.
 *
 * @returns {[number,number,number]} Bright shade as [r,g,b] (0-255)
 */
export function getShadeBrightRgb() {
  rebuildDerivedCache();
  return _shadeBrightRgb;
}

/**
 * getFillRgb - Returns the fill color from the current theme.
 *
 * @returns {[number,number,number]} Fill color as [r,g,b] (0-255)
 */
export function getFillRgb() {
  rebuildDerivedCache();
  return _fillRgb;
}

/**
 * getEdgeColor - Returns the edge/wire color, auto-contrasted against fill.
 *
 * Returns black ('#000000') when fill is light (luminance > 0.5),
 * white ('#ffffff') when fill is dark. Ensures wires always contrast
 * with the fill colour.
 *
 * @returns {string} Edge color as hex string
 */
export function getEdgeColor() {
  rebuildDerivedCache();
  return _edgeColor;
}

/**
 * getBgRgb - Returns the background color as an RGB array.
 *
 * @returns {[number,number,number]} Background color as [r,g,b] (0-255)
 */
export function getBgRgb() {
  rebuildDerivedCache();
  return _bgRgb;
}

/**
 * getBgColor - Returns the background color as a CSS rgba string.
 *
 * @returns {string} Background color as 'rgba(r,g,b,1)'
 */
export function getBgColor() {
  rebuildDerivedCache();
  return _bgColor;
}

/**
 * getParticleColor - Returns the particle color as a CSS rgba string.
 *
 * @returns {string} Particle color as 'rgba(r,g,b,1)'
 */
export function getParticleColor() {
  rebuildDerivedCache();
  return _particleColor;
}
