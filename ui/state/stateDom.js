/**
 * dom-state.js - Shared DOM element and color state
 *
 * PURPOSE:
 *   Centralizes references to commonly used DOM elements and theme state.
 *   This module exports live bindings that other modules can read/write
 *   to keep UI state in sync.
 *
 * ARCHITECTURE ROLE:
 *   Acts as the single source of truth for DOM elements (inputs, stats, etc.)
 *   and theme-related constants (custom colors, presets, light direction) used
 *   across the application.
 *
 * DATA FORMAT:
 *   - Exports DOM elements (inputs, display elements) as `HTMLElement` references.
 *   - Exports theme constants such as CUSTOM_RGB, PRESET_SWATCHES, and vectors.
 */

"use strict";

import {statsState} from '@ui/state/stateStats.js';

const THEME = null;
export const select = document.getElementById('obj-select');
export const themeModeEl = document.getElementById('theme-mode');
export const lodSlider = document.getElementById('lod-slider');
export const lodValue = document.getElementById('lod-value');
export const fillOpacity = document.getElementById('fill-opacity');
export const fillOpacityValue = document.getElementById('fill-opacity-value');
export const wireOpacity = document.getElementById('wire-opacity');
export const wireOpacityValue = document.getElementById('wire-opacity-value');
export const bgDensity = document.getElementById('bg-density');
export const bgDensityValue = document.getElementById('bg-density-value');
export const bgVelocity = document.getElementById('bg-velocity');
export const bgVelocityValue = document.getElementById('bg-velocity-value');
export const bgOpacity = document.getElementById('bg-opacity');
export const bgOpacityValue = document.getElementById('bg-opacity-value');
export const presetSwatchesEl = document.getElementById('preset-swatches');
export const customRed = document.getElementById('custom-red');
export const customGreen = document.getElementById('custom-green');
export const customBlue = document.getElementById('custom-blue');
export const customRedValue = document.getElementById('custom-red-value');
export const customGreenValue = document.getElementById('custom-green-value');
export const customBlueValue = document.getElementById('custom-blue-value');
export const customHex = document.getElementById('custom-hex');
export const customSwatch = document.getElementById('custom-swatch');


// Assign stat DOM elements directly to statsState object
statsState.statRenderer = document.getElementById('stat-renderer');
statsState.statFps = document.getElementById('stat-fps');
statsState.statFrameMs = document.getElementById('stat-frame-ms');
statsState.statPhysMs = document.getElementById('stat-phys-ms');
statsState.statBgMs = document.getElementById('stat-bg-ms');
statsState.statFgMs = document.getElementById('stat-fg-ms');
statsState.statV = document.getElementById('stat-v');
statsState.statE = document.getElementById('stat-e');


// Local stat DOM element references
const statRenderer = document.getElementById('stat-renderer');
const statFps = document.getElementById('stat-fps');
const statFrameMs = document.getElementById('stat-frame-ms');
const statPhysMs = document.getElementById('stat-phys-ms');
const statBgMs = document.getElementById('stat-bg-ms');
const statFgMs = document.getElementById('stat-fg-ms');
const statV = document.getElementById('stat-v');
const statE = document.getElementById('stat-e');



// Static seam overlap tuning for dense meshes (engine-owned mesh only).
export const DENSE_SEAM_EXPAND_PX = 0.56;

export const PRESET_SWATCHES = [
  { name: 'Ruby', rgb: [235, 64, 52] },
  { name: 'Orange', rgb: [255, 136, 0] },
  { name: 'Sun', rgb: [255, 214, 10] },
  { name: 'Lime', rgb: [120, 220, 20] },
  { name: 'Emerald', rgb: [10, 196, 122] },
  { name: 'Cyan', rgb: [0, 190, 255] },
  { name: 'Blue', rgb: [72, 126, 255] },
  { name: 'Indigo', rgb: [140, 92, 255] },
  { name: 'Violet', rgb: [220, 78, 255] },
  { name: 'Rose', rgb: [255, 86, 170] },
  { name: 'Teal', rgb: [0, 172, 154] },
  { name: 'Mid Gray', rgb: [128, 128, 128] },
  { name: 'Coral', rgb: [255, 108, 78] },
  { name: 'Mint', rgb: [94, 236, 170] },
];
export const SHUFFLE_SWATCH_NAME = 'Shuffle';
export const PRESET_SWATCH_BUTTONS = [];
// THEME is declared above
export const CUSTOM_RGB_KEY = 'wireframer.customRgb';
export const CUSTOM_RGB_DEFAULT = [95, 188, 230];
export const CUSTOM_RGB = CUSTOM_RGB_DEFAULT.slice();
export const THEME_MODE = 'dark';

// light direction vector in world space; the source should be high above
// and distinctly to one side of the viewer.  previous attempts were either
// too centred (downward) or only slightly offset, failing to light the
// outside surfaces of the knot.  this vector has a strong upward component
// along with a hefty right‑ward bias, putting the light off to the side but
// still well above the object like a ceiling fixture hung over and to the
// right of the viewer's position.
export const LIGHT_DIR = (() => {
  const x = 0.8;   // right of camera
  const y = 1.2;   // very high overhead
  const z = 0.3;   // slightly behind
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
})();

export const VIEW_DIR = [0, 0, -1];
