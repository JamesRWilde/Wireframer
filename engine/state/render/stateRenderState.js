/**
 * renderState.js - Core Rendering State
 *
 * PURPOSE:
 *   Centralized state for all rendering parameters including theme,
 *   opacity values, wireframe width, and derived color caches.
 *   Serves as the single source of truth for the rendering pipeline.
 *
 * ARCHITECTURE ROLE:
 *   Written by setTheme, setFillOpacity, setWireOpacity, and derived
 *   color computation functions. Read by all getter modules and the
 *   GPU/CPU rendering pipelines.
 */

'use strict';

/**
 * renderState - Core rendering configuration state.
 * @property {Object|null} theme - Active theme object.
 * @property {string} themeMode - Theme mode ("light" or "dark").
 * @property {number} fillOpacity - Fill layer opacity (0-1).
 * @property {number} wireOpacity - Wireframe opacity (0-1).
 * @property {number} wireWidth - Wireframe line width.
 * @property {number} themeVer - Theme version counter for cache invalidation.
 * @property {number} cacheVer - Derived cache version (-1 when invalid).
 * @property {Array<number>} shadeDarkRgb - Dark shade RGB color.
 * @property {Array<number>} shadeBrightRgb - Bright shade RGB color.
 * @property {Array<number>} fillRgb - Fill color RGB.
 * @property {string} edgeColor - Edge color as hex string.
 * @property {Array<number>} bgRgb - Background RGB color.
 * @property {string} bgColor - Background color as CSS string.
 * @property {string} particleColor - Particle color as CSS string.
 */
export const renderState = {
  theme: null,
  themeMode: 'dark',
  fillOpacity: 1,
  wireOpacity: 1,
  wireWidth: 0.2,
  themeVer: 0,
  cacheVer: -1,
  shadeDarkRgb: [0, 0, 0],
  shadeBrightRgb: [255, 255, 255],
  fillRgb: [0, 200, 120],
  edgeColor: '#ffffff',
  bgRgb: [0, 0, 0],
  bgColor: 'rgba(0,0,0,1)',
  particleColor: 'rgba(200,220,255,1)',
};

