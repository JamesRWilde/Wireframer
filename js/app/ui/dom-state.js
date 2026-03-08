'use strict';

const select = document.getElementById('obj-select');
const themeMode = document.getElementById('theme-mode');
const lodSlider = document.getElementById('lod-slider');
const lodValue = document.getElementById('lod-value');
const fillOpacity = document.getElementById('fill-opacity');
const fillOpacityValue = document.getElementById('fill-opacity-value');
const wireOpacity = document.getElementById('wire-opacity');
const wireOpacityValue = document.getElementById('wire-opacity-value');
const bgDensity = document.getElementById('bg-density');
const bgDensityValue = document.getElementById('bg-density-value');
const bgVelocity = document.getElementById('bg-velocity');
const bgVelocityValue = document.getElementById('bg-velocity-value');
const bgOpacity = document.getElementById('bg-opacity');
const bgOpacityValue = document.getElementById('bg-opacity-value');
const presetSwatches = document.getElementById('preset-swatches');
const customRed = document.getElementById('custom-red');
const customGreen = document.getElementById('custom-green');
const customBlue = document.getElementById('custom-blue');
const customRedValue = document.getElementById('custom-red-value');
const customGreenValue = document.getElementById('custom-green-value');
const customBlueValue = document.getElementById('custom-blue-value');
const customHex = document.getElementById('custom-hex');
const customSwatch = document.getElementById('custom-swatch');

let FILL_OPACITY = 0;
let WIRE_OPACITY = 1;

// Static seam overlap tuning for dense meshes.
const DENSE_SEAM_EXPAND_PX = 0.56;

const CUSTOM_RGB_KEY = 'wireframer.customRgb';
const CUSTOM_RGB_DEFAULT = [95, 188, 230];
const PRESET_SWATCHES = [
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
const SHUFFLE_SWATCH_NAME = 'Shuffle';
const PRESET_SWATCH_BUTTONS = [];

let THEME = null;
let CUSTOM_RGB = CUSTOM_RGB_DEFAULT.slice();
let THEME_MODE = 'dark';

const LIGHT_DIR = (() => {
  const x = -0.38;
  const y = 0.74;
  const z = -0.56;
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
})();
const VIEW_DIR = [0, 0, -1];
