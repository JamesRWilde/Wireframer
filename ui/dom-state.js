'use strict';

import { setStatRenderer, setStatFps, setStatFrameMs, setStatPhysMs, setStatBgMs, setStatFgMs, setStatV, setStatE } from './statsState.js';

let THEME = null;
export const select = document.getElementById('obj-select');
export const themeMode = document.getElementById('theme-mode');
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
export const presetSwatches = document.getElementById('preset-swatches');
export const customRed = document.getElementById('custom-red');
export const customGreen = document.getElementById('custom-green');
export const customBlue = document.getElementById('custom-blue');
export const customRedValue = document.getElementById('custom-red-value');
export const customGreenValue = document.getElementById('custom-green-value');
export const customBlueValue = document.getElementById('custom-blue-value');
export const customHex = document.getElementById('custom-hex');
export const customSwatch = document.getElementById('custom-swatch');

// register telemetry stat elements
setStatRenderer(document.getElementById('stat-renderer'));
setStatFps(document.getElementById('stat-fps'));
setStatFrameMs(document.getElementById('stat-frame-ms'));
setStatPhysMs(document.getElementById('stat-phys-ms'));
setStatBgMs(document.getElementById('stat-bg-ms'));
setStatFgMs(document.getElementById('stat-fg-ms'));
setStatV(document.getElementById('stat-v'));
setStatE(document.getElementById('stat-e'));


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
const DENSE_SEAM_EXPAND_PX = 0.56;

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
export let CUSTOM_RGB = CUSTOM_RGB_DEFAULT.slice();
export let THEME_MODE = 'dark';

// light direction vector in world space; this is a distant directional
// light so only the direction matters.  to guarantee the light ends up well
// outside the mesh (no matter how it rotates) we simply make it straight
// down from above.  any normal pointing upward will be lit, everything else
// will fall toward the dark — the knot should now light on its exterior
// surfaces only.
export let LIGHT_DIR = [0, 1, 0];

export let VIEW_DIR = [0, 0, -1];
