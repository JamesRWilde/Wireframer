'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   Canvas
───────────────────────────────────────────────────────────────────────── */
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const fillLayerCanvas = document.createElement('canvas');
const fillLayerCtx = fillLayerCanvas.getContext('2d');
let W = 0, H = 0;
const BG_PARTICLES = [];

function initBackgroundParticles() {
  if (!W || !H) return;

  const count = Math.max(210, Math.round((W * H) / 9500));
  BG_PARTICLES.length = 0;

  for (let i = 0; i < count; i++) {
    BG_PARTICLES.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.9 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.5,
      alphaBase: 0.12 + Math.random() * 0.16,
    });
  }
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  fillLayerCanvas.width = W;
  fillLayerCanvas.height = H;
  initBackgroundParticles();
}
resize();
window.addEventListener('resize', resize);

/* ─────────────────────────────────────────────────────────────────────────
   Perspective projection
   Camera sits at z = -3 (d = p[2] + 3), so negative-z is nearest.
   MODEL_CY centres the object vertically on screen.
───────────────────────────────────────────────────────────────────────── */
let MODEL_CY = 0;
let Z_HALF   = 1.0; // depth-shading range; set per-object in loadObject()
let ZOOM = 1.0;
const ZOOM_MIN = 0.45;
const ZOOM_MAX = 2.75;

function project(p) {
  const fov = Math.min(W, H) * 0.90 * ZOOM;
  const d   = p[2] + 3.0;
  return [
    W * 0.5 + p[0] * fov / d,
    H * 0.5 - (p[1] - MODEL_CY) * fov / d,
  ];
}

/* ─────────────────────────────────────────────────────────────────────────
   Active model
───────────────────────────────────────────────────────────────────────── */
let MODEL = { V: [], E: [] };
const MORPH_DURATION_MS = 2000;
const MORPH_POINT_CAP = 700;
let MORPH = null;

function updateHud(name, vertexCount, edgeCount) {
  document.getElementById('obj-label').textContent = name;
  document.getElementById('stat-v').textContent = vertexCount;
  document.getElementById('stat-e').textContent = edgeCount;
}

function computeFrameParams(vertices) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of vertices) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const cy = (minY + maxY) / 2;
  let maxD = 0;
  for (const [x, y, z] of vertices) {
    const d = Math.sqrt(x * x + (y - cy) * (y - cy) + z * z);
    if (d > maxD) maxD = d;
  }

  return { cy, zHalf: maxD * 1.05 };
}

function setActiveModel(model, name, vertexCount, edgeCount) {
  MODEL = model;
  const params = computeFrameParams(MODEL.V);
  MODEL_CY = params.cy;
  Z_HALF = params.zHalf;
  updateHud(name, vertexCount, edgeCount);
}

function loadObject(obj) {
  MORPH = null;
  const model = obj.build();
  setActiveModel(model, obj.name, model.V.length, model.E.length);
}

function sortVerticesForMorph(vertices) {
  return vertices
    .map((v) => [v[0], v[1], v[2]])
    .sort((a, b) => {
      if (Math.abs(a[1] - b[1]) > 0.03) return a[1] - b[1];
      const aa = Math.atan2(a[2], a[0]);
      const ab = Math.atan2(b[2], b[0]);
      if (aa !== ab) return aa - ab;
      const ra = a[0] * a[0] + a[2] * a[2];
      const rb = b[0] * b[0] + b[2] * b[2];
      return ra - rb;
    });
}

function sampleVerticesForMorph(vertices, sampleCount) {
  const sorted = sortVerticesForMorph(vertices);
  const n = sorted.length;
  const out = [];

  if (!n) return out;
  for (let i = 0; i < sampleCount; i++) {
    out.push(sorted[Math.floor((i / sampleCount) * n)]);
  }
  return out;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getMorphNowVertices(nowMs) {
  if (!MORPH || !MORPH.active) return [];
  const tRaw = Math.max(0, Math.min(1, (nowMs - MORPH.startMs) / MORPH.durationMs));
  const t = easeInOutCubic(tRaw);
  const V = new Array(MORPH.sampleCount);
  for (let i = 0; i < MORPH.sampleCount; i++) {
    const a = MORPH.fromPts[i];
    const b = MORPH.toPts[i];
    V[i] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  return V;
}

function startMorphToObject(obj, nowMs = performance.now()) {
  const toModel = obj.build();
  const fromModel = MORPH && MORPH.active ? { V: getMorphNowVertices(nowMs), E: [] } : MODEL;

  const baseCount = Math.max(fromModel.V.length, toModel.V.length, 180);
  const sampleCount = Math.min(MORPH_POINT_CAP, baseCount);

  MORPH = {
    active: true,
    startMs: nowMs,
    durationMs: MORPH_DURATION_MS,
    fromModel,
    toModel,
    fromPts: sampleVerticesForMorph(fromModel.V, sampleCount),
    toPts: sampleVerticesForMorph(toModel.V, sampleCount),
    sampleCount,
    targetName: obj.name,
    targetV: toModel.V.length,
    targetE: toModel.E.length,
  };

  updateHud(`${obj.name} (morphing)`, toModel.V.length, toModel.E.length);
}

/* ─────────────────────────────────────────────────────────────────────────
   Rotation state
───────────────────────────────────────────────────────────────────────── */
let R          = mmul(mry(0.4), mrx(0.18)); // initial orientation
let frameCount = 0;

const AUTO_WX = 0.003;   // pitch
const AUTO_WY = 0.007;   // yaw  (main spin)
const AUTO_WZ = 0.0015;  // roll
let wx = AUTO_WX, wy = AUTO_WY, wz = AUTO_WZ;

/* ─────────────────────────────────────────────────────────────────────────
   Input — mouse & touch
───────────────────────────────────────────────────────────────────────── */
let dragging = false, lx = 0, ly = 0;

function onDown(cx, cy) {
  dragging = true;
  lx = cx; ly = cy;
  wx = 0; wy = 0;
}
function onMove(cx, cy) {
  if (!dragging) return;
  const dx = cx - lx, dy = cy - ly;
  wy = dx * 0.007;
  wx = dy * 0.007;
  lx = cx; ly = cy;
}
function onUp() { dragging = false; }

canvas.addEventListener('mousedown',  e => onDown(e.clientX, e.clientY));
window.addEventListener('mouseup',    onUp);
window.addEventListener('mousemove',  e => onMove(e.clientX, e.clientY));

canvas.addEventListener('touchstart', e => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
canvas.addEventListener('touchend',   onUp);
canvas.addEventListener('touchmove',  e => {
  e.preventDefault();
  onMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

canvas.addEventListener('wheel', (e) => {
  // Let Ctrl+wheel keep browser/page zoom behavior.
  if (e.ctrlKey) return;
  e.preventDefault();
  const factor = Math.exp(-e.deltaY * 0.0012);
  ZOOM = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, ZOOM * factor));
}, { passive: false });

/* ─────────────────────────────────────────────────────────────────────────
   Object selector
───────────────────────────────────────────────────────────────────────── */
const select = document.getElementById('obj-select');
const fillOpacity = document.getElementById('fill-opacity');
const fillOpacityValue = document.getElementById('fill-opacity-value');
const wireOpacity = document.getElementById('wire-opacity');
const wireOpacityValue = document.getElementById('wire-opacity-value');
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

const PALETTES = {
  cyan: {
    bg: [5, 8, 16],
    particle: [105, 205, 255],
    wireA: [20, 150, 210],
    wireB: [50, 185, 235],
    wireNear: [65, 140, 190],
    wireFar: [120, 230, 255],
    shadeDark: [18, 72, 102],
    shadeBright: [66, 192, 240],
    morph: [108, 214, 255],
    uiVars: {
      '--bg-solid': 'rgb(5, 8, 16)',
      '--ui-title': 'rgba(130, 220, 255, 0.85)',
      '--ui-subtitle': 'rgba(80, 160, 200, 0.45)',
      '--ui-control-border': 'rgba(80, 160, 200, 0.35)',
      '--ui-control-fg': 'rgba(110, 210, 255, 0.80)',
      '--ui-control-hover-border': 'rgba(100, 200, 255, 0.60)',
      '--ui-control-hover-fg': 'rgba(150, 235, 255, 0.95)',
      '--ui-control-bg': 'rgba(5, 10, 20, 0.88)',
      '--ui-control-option-bg': 'rgb(7, 12, 24)',
      '--ui-label': 'rgba(105, 198, 236, 0.78)',
      '--ui-value': 'rgba(145, 224, 255, 0.82)',
      '--ui-switch-bg': 'rgba(36, 78, 106, 0.85)',
      '--ui-switch-border': 'rgba(86, 170, 206, 0.45)',
      '--ui-switch-on-bg': 'rgba(52, 146, 188, 0.86)',
      '--ui-switch-on-border': 'rgba(118, 214, 247, 0.72)',
      '--ui-switch-knob': 'rgba(178, 236, 255, 0.90)',
      '--ui-switch-glow': 'rgba(109, 204, 245, 0.55)',
      '--ui-stats': 'rgba(70, 150, 190, 0.35)',
      '--ui-object-label': 'rgba(110, 210, 255, 0.55)',
      '--ui-hint': 'rgba(70, 140, 180, 0.30)',
      '--ui-accent': 'rgb(95, 188, 230)',
    },
  },
  emerald: {
    bg: [5, 14, 10],
    particle: [106, 255, 190],
    wireA: [16, 170, 118],
    wireB: [48, 214, 158],
    wireNear: [44, 138, 100],
    wireFar: [138, 252, 196],
    shadeDark: [14, 92, 64],
    shadeBright: [78, 225, 172],
    morph: [126, 255, 204],
    uiVars: {
      '--bg-solid': 'rgb(5, 14, 10)',
      '--ui-title': 'rgba(142, 255, 216, 0.86)',
      '--ui-subtitle': 'rgba(86, 194, 150, 0.48)',
      '--ui-control-border': 'rgba(88, 186, 146, 0.38)',
      '--ui-control-fg': 'rgba(142, 244, 204, 0.86)',
      '--ui-control-hover-border': 'rgba(122, 232, 185, 0.66)',
      '--ui-control-hover-fg': 'rgba(196, 255, 232, 0.96)',
      '--ui-control-bg': 'rgba(6, 18, 14, 0.9)',
      '--ui-control-option-bg': 'rgb(8, 22, 17)',
      '--ui-label': 'rgba(126, 230, 192, 0.8)',
      '--ui-value': 'rgba(186, 255, 230, 0.85)',
      '--ui-switch-bg': 'rgba(26, 98, 74, 0.86)',
      '--ui-switch-border': 'rgba(92, 194, 150, 0.5)',
      '--ui-switch-on-bg': 'rgba(44, 166, 122, 0.9)',
      '--ui-switch-on-border': 'rgba(134, 244, 204, 0.76)',
      '--ui-switch-knob': 'rgba(202, 255, 236, 0.94)',
      '--ui-switch-glow': 'rgba(134, 244, 204, 0.56)',
      '--ui-stats': 'rgba(86, 184, 148, 0.36)',
      '--ui-object-label': 'rgba(142, 244, 204, 0.62)',
      '--ui-hint': 'rgba(78, 164, 130, 0.34)',
      '--ui-accent': 'rgb(64, 188, 140)',
    },
  },
  amber: {
    bg: [18, 11, 4],
    particle: [255, 198, 108],
    wireA: [214, 132, 34],
    wireB: [244, 176, 76],
    wireNear: [170, 112, 44],
    wireFar: [255, 216, 136],
    shadeDark: [112, 74, 24],
    shadeBright: [248, 188, 88],
    morph: [255, 212, 120],
    uiVars: {
      '--bg-solid': 'rgb(18, 11, 4)',
      '--ui-title': 'rgba(255, 214, 148, 0.88)',
      '--ui-subtitle': 'rgba(210, 150, 80, 0.5)',
      '--ui-control-border': 'rgba(198, 142, 72, 0.42)',
      '--ui-control-fg': 'rgba(255, 208, 136, 0.86)',
      '--ui-control-hover-border': 'rgba(246, 188, 110, 0.68)',
      '--ui-control-hover-fg': 'rgba(255, 234, 178, 0.98)',
      '--ui-control-bg': 'rgba(24, 16, 8, 0.9)',
      '--ui-control-option-bg': 'rgb(28, 18, 8)',
      '--ui-label': 'rgba(236, 182, 112, 0.82)',
      '--ui-value': 'rgba(255, 226, 170, 0.88)',
      '--ui-switch-bg': 'rgba(118, 82, 32, 0.86)',
      '--ui-switch-border': 'rgba(214, 160, 88, 0.56)',
      '--ui-switch-on-bg': 'rgba(184, 128, 44, 0.9)',
      '--ui-switch-on-border': 'rgba(255, 216, 136, 0.76)',
      '--ui-switch-knob': 'rgba(255, 238, 194, 0.95)',
      '--ui-switch-glow': 'rgba(255, 204, 128, 0.58)',
      '--ui-stats': 'rgba(194, 142, 76, 0.4)',
      '--ui-object-label': 'rgba(255, 206, 132, 0.64)',
      '--ui-hint': 'rgba(176, 130, 70, 0.35)',
      '--ui-accent': 'rgb(222, 154, 64)',
    },
  },
  magenta: {
    bg: [15, 6, 18],
    particle: [232, 148, 255],
    wireA: [164, 82, 224],
    wireB: [212, 122, 248],
    wireNear: [122, 74, 178],
    wireFar: [244, 188, 255],
    shadeDark: [84, 42, 132],
    shadeBright: [220, 142, 255],
    morph: [238, 170, 255],
    uiVars: {
      '--bg-solid': 'rgb(15, 6, 18)',
      '--ui-title': 'rgba(236, 178, 255, 0.88)',
      '--ui-subtitle': 'rgba(170, 110, 208, 0.5)',
      '--ui-control-border': 'rgba(166, 104, 206, 0.42)',
      '--ui-control-fg': 'rgba(222, 160, 248, 0.86)',
      '--ui-control-hover-border': 'rgba(208, 148, 238, 0.68)',
      '--ui-control-hover-fg': 'rgba(242, 206, 255, 0.98)',
      '--ui-control-bg': 'rgba(20, 10, 26, 0.9)',
      '--ui-control-option-bg': 'rgb(24, 12, 30)',
      '--ui-label': 'rgba(206, 148, 234, 0.82)',
      '--ui-value': 'rgba(236, 196, 255, 0.88)',
      '--ui-switch-bg': 'rgba(92, 52, 132, 0.86)',
      '--ui-switch-border': 'rgba(178, 120, 218, 0.56)',
      '--ui-switch-on-bg': 'rgba(134, 76, 186, 0.9)',
      '--ui-switch-on-border': 'rgba(224, 168, 248, 0.76)',
      '--ui-switch-knob': 'rgba(246, 220, 255, 0.95)',
      '--ui-switch-glow': 'rgba(208, 150, 242, 0.58)',
      '--ui-stats': 'rgba(160, 106, 198, 0.4)',
      '--ui-object-label': 'rgba(218, 154, 246, 0.64)',
      '--ui-hint': 'rgba(150, 100, 184, 0.35)',
      '--ui-accent': 'rgb(176, 108, 216)',
    },
  },
};

let THEME = PALETTES.cyan;
let CUSTOM_RGB = readCustomRgb();

const LIGHT_DIR = (() => {
  const x = -0.38, y = 0.74, z = -0.56;
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
})();
const VIEW_DIR = [0, 0, -1];

function syncRenderToggles() {
  FILL_OPACITY = Number(fillOpacity.value) / 100;
  fillOpacityValue.textContent = `${Math.round(FILL_OPACITY * 100)}%`;
  WIRE_OPACITY = Number(wireOpacity.value) / 100;
  wireOpacityValue.textContent = `${Math.round(WIRE_OPACITY * 100)}%`;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}

function mixRgb(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function toRgbCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function toRgbaCss(rgb, alpha) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
}

function toHex(rgb) {
  const hex = rgb.map((v) => clampByte(v).toString(16).padStart(2, '0')).join('');
  return `#${hex.toUpperCase()}`;
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    default: r = v; g = p; b = q; break;
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
  ];
}

function randomPresetRgb() {
  for (let i = 0; i < 18; i++) {
    const hue = Math.random();
    const saturation = 0.68 + Math.random() * 0.28;
    const value = 0.74 + Math.random() * 0.23;
    const rgb = hsvToRgb(hue, saturation, value);

    const max = Math.max(rgb[0], rgb[1], rgb[2]);
    const min = Math.min(rgb[0], rgb[1], rgb[2]);
    const spread = max - min;
    const lum = relativeLuminance(rgb);

    // Keep random picks vivid and clearly visible on black.
    if (spread >= 90 && max >= 150 && lum >= 0.17) return rgb;
  }

  return hsvToRgb(Math.random(), 0.82, 0.86);
}

function rgbEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function linearChannel(v) {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb) {
  const r = linearChannel(rgb[0]);
  const g = linearChannel(rgb[1]);
  const b = linearChannel(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

function enforceContrast(fg, bg, minRatio) {
  const current = contrastRatio(fg, bg);
  if (current >= minRatio) return fg;

  let best = fg;
  let bestRatio = current;

  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    const towardWhite = mixRgb(fg, [255, 255, 255], t);
    const cw = contrastRatio(towardWhite, bg);
    if (cw > bestRatio) {
      bestRatio = cw;
      best = towardWhite;
    }
    if (cw >= minRatio) return towardWhite;

    const towardBlack = mixRgb(fg, [0, 0, 0], t);
    const cb = contrastRatio(towardBlack, bg);
    if (cb > bestRatio) {
      bestRatio = cb;
      best = towardBlack;
    }
    if (cb >= minRatio) return towardBlack;
  }

  return best;
}

function buildCustomTheme(rgbInput) {
  const base = [clampByte(rgbInput[0]), clampByte(rgbInput[1]), clampByte(rgbInput[2])];
  const bg = mixRgb(base, [0, 0, 0], 0.93);
  const uiBg = mixRgb(base, [0, 0, 0], 0.9);
  const optionBg = mixRgb(base, [0, 0, 0], 0.88);

  const title = enforceContrast(mixRgb(base, [255, 255, 255], 0.54), bg, 5.5);
  const subtitle = enforceContrast(mixRgb(base, [255, 255, 255], 0.16), bg, 2.3);
  const controlFg = enforceContrast(mixRgb(base, [255, 255, 255], 0.32), bg, 4.2);
  const controlHoverFg = enforceContrast(mixRgb(base, [255, 255, 255], 0.58), bg, 5.5);
  const label = enforceContrast(mixRgb(base, [255, 255, 255], 0.26), bg, 3.6);
  const value = enforceContrast(mixRgb(base, [255, 255, 255], 0.46), bg, 4.8);

  const border = mixRgb(base, [255, 255, 255], 0.12);
  const hoverBorder = mixRgb(base, [255, 255, 255], 0.28);
  const switchBg = mixRgb(base, [0, 0, 0], 0.58);
  const switchBorder = mixRgb(base, [255, 255, 255], 0.22);
  const switchOnBg = mixRgb(base, [255, 255, 255], 0.06);
  const switchOnBorder = mixRgb(base, [255, 255, 255], 0.4);
  const switchKnob = enforceContrast(mixRgb(base, [255, 255, 255], 0.78), switchOnBg, 3.0);

  return {
    bg,
    particle: mixRgb(base, [255, 255, 255], 0.34),
    wireA: mixRgb(base, [0, 0, 0], 0.2),
    wireB: mixRgb(base, [255, 255, 255], 0.08),
    wireNear: mixRgb(base, [0, 0, 0], 0.42),
    wireFar: mixRgb(base, [255, 255, 255], 0.46),
    shadeDark: mixRgb(base, [0, 0, 0], 0.5),
    shadeBright: mixRgb(base, [255, 255, 255], 0.3),
    morph: mixRgb(base, [255, 255, 255], 0.36),
    uiVars: {
      '--bg-solid': toRgbCss(bg),
      '--ui-title': toRgbaCss(title, 0.88),
      '--ui-subtitle': toRgbaCss(subtitle, 0.5),
      '--ui-control-border': toRgbaCss(border, 0.42),
      '--ui-control-fg': toRgbaCss(controlFg, 0.86),
      '--ui-control-hover-border': toRgbaCss(hoverBorder, 0.7),
      '--ui-control-hover-fg': toRgbaCss(controlHoverFg, 0.98),
      '--ui-control-bg': toRgbaCss(uiBg, 0.9),
      '--ui-control-option-bg': toRgbCss(optionBg),
      '--ui-label': toRgbaCss(label, 0.82),
      '--ui-value': toRgbaCss(value, 0.9),
      '--ui-switch-bg': toRgbaCss(switchBg, 0.86),
      '--ui-switch-border': toRgbaCss(switchBorder, 0.56),
      '--ui-switch-on-bg': toRgbaCss(switchOnBg, 0.9),
      '--ui-switch-on-border': toRgbaCss(switchOnBorder, 0.78),
      '--ui-switch-knob': toRgbaCss(switchKnob, 0.95),
      '--ui-switch-glow': toRgbaCss(mixRgb(base, [255, 255, 255], 0.46), 0.58),
      '--ui-stats': toRgbaCss(mixRgb(base, [255, 255, 255], 0.18), 0.42),
      '--ui-object-label': toRgbaCss(value, 0.64),
      '--ui-hint': toRgbaCss(label, 0.36),
      '--ui-accent': toRgbCss(base),
    },
  };
}

function readCustomRgb() {
  try {
    const saved = localStorage.getItem(CUSTOM_RGB_KEY);
    if (!saved) return CUSTOM_RGB_DEFAULT.slice();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length !== 3) return CUSTOM_RGB_DEFAULT.slice();
    return [clampByte(parsed[0]), clampByte(parsed[1]), clampByte(parsed[2])];
  } catch {
    return CUSTOM_RGB_DEFAULT.slice();
  }
}

function persistCustomRgb() {
  try {
    localStorage.setItem(CUSTOM_RGB_KEY, JSON.stringify(CUSTOM_RGB));
  } catch {
    // Ignore localStorage failures (private mode/quota).
  }
}

function updateCustomColorUi() {
  if (!customRed || !customGreen || !customBlue) return;

  const [r, g, b] = CUSTOM_RGB;
  customRed.value = String(r);
  customGreen.value = String(g);
  customBlue.value = String(b);

  if (customRedValue) customRedValue.textContent = String(r);
  if (customGreenValue) customGreenValue.textContent = String(g);
  if (customBlueValue) customBlueValue.textContent = String(b);
  if (customHex) customHex.textContent = toHex(CUSTOM_RGB);
  if (customSwatch) customSwatch.style.background = toRgbCss(CUSTOM_RGB);

  for (const entry of PRESET_SWATCH_BUTTONS) {
    entry.button.classList.toggle('is-active', rgbEquals(entry.rgb, CUSTOM_RGB));
  }
}

function getCustomRgbFromInputs() {
  return [
    clampByte(customRed ? customRed.value : CUSTOM_RGB[0]),
    clampByte(customGreen ? customGreen.value : CUSTOM_RGB[1]),
    clampByte(customBlue ? customBlue.value : CUSTOM_RGB[2]),
  ];
}

function setCustomRgb(rgb, options = {}) {
  const { persist = true, apply = true } = options;
  CUSTOM_RGB = [clampByte(rgb[0]), clampByte(rgb[1]), clampByte(rgb[2])];
  updateCustomColorUi();
  if (persist) persistCustomRgb();
  if (apply) applyPalette();
}

function initPresetSwatches() {
  if (!presetSwatches) return;

  presetSwatches.innerHTML = '';
  PRESET_SWATCH_BUTTONS.length = 0;

  for (const preset of PRESET_SWATCHES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-swatch';
    button.title = `${preset.name} (${toHex(preset.rgb)})`;
    button.setAttribute('aria-label', `${preset.name} preset ${toHex(preset.rgb)}`);
    button.style.setProperty('--swatch-color', toRgbCss(preset.rgb));
    button.addEventListener('click', () => {
      setCustomRgb(preset.rgb, { persist: true, apply: true });
    });

    presetSwatches.appendChild(button);
    PRESET_SWATCH_BUTTONS.push({ button, rgb: preset.rgb });
  }

  const shuffleButton = document.createElement('button');
  shuffleButton.type = 'button';
  shuffleButton.className = 'preset-swatch is-shuffle';
  shuffleButton.title = `${SHUFFLE_SWATCH_NAME} random preset`;
  shuffleButton.setAttribute('aria-label', `${SHUFFLE_SWATCH_NAME} random preset`);
  shuffleButton.addEventListener('click', () => {
    setCustomRgb(randomPresetRgb(), { persist: true, apply: true });
  });
  presetSwatches.appendChild(shuffleButton);
}

function applyPalette() {
  const palette = buildCustomTheme(CUSTOM_RGB);
  THEME = palette;
  for (const [k, v] of Object.entries(palette.uiVars)) {
    document.documentElement.style.setProperty(k, v);
  }
}

function rgbA(rgb, alpha) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
}

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function initObjectSelector() {
  select.innerHTML = '';

  OBJECTS.forEach((obj, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = obj.name;
    select.appendChild(opt);
  });

  select.onchange = () => startMorphToObject(OBJECTS[+select.value]);
  fillOpacity.oninput = syncRenderToggles;
  fillOpacity.onchange = syncRenderToggles;
  wireOpacity.oninput = syncRenderToggles;
  wireOpacity.onchange = syncRenderToggles;
  initPresetSwatches();

  const onCustomInput = () => {
    setCustomRgb(getCustomRgbFromInputs(), {
      persist: true,
      apply: true,
    });
  };

  if (customRed) {
    customRed.oninput = onCustomInput;
    customRed.onchange = onCustomInput;
  }
  if (customGreen) {
    customGreen.oninput = onCustomInput;
    customGreen.onchange = onCustomInput;
  }
  if (customBlue) {
    customBlue.oninput = onCustomInput;
    customBlue.onchange = onCustomInput;
  }

  setCustomRgb(CUSTOM_RGB, { persist: false, apply: true });
  syncRenderToggles();

  if (!OBJECTS.length) {
    document.getElementById('obj-label').textContent = 'No objects loaded';
    document.getElementById('stat-v').textContent = '--';
    document.getElementById('stat-e').textContent = '--';
    return;
  }

  loadObject(OBJECTS[0]);
}

/* ─────────────────────────────────────────────────────────────────────────
   Render loop
   Three draw passes per frame:
     1. Wide bloom   — thick, near-transparent strokes
     2. Narrow bloom — medium, near-transparent strokes
     3. Depth-shaded — thin crisp strokes: near=bright cyan, far=invisible
───────────────────────────────────────────────────────────────────────── */
const DEPTH_BUCKETS = 12;
const buckets = Array.from({ length: DEPTH_BUCKETS }, () => []);

function drawBackground(nowMs) {
  const t = nowMs * 0.001;

  // Keep the scene floor neutral black so only particles/geometry carry color.
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, W, H);

  // Particle-based ambient motion is less prone to HDR gradient banding.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const p of BG_PARTICLES) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -2) p.x = W + 2;
    else if (p.x > W + 2) p.x = -2;

    if (p.y < -2) p.y = H + 2;
    else if (p.y > H + 2) p.y = -2;

    const pulse = 0.5 + 0.5 * Math.sin(t * p.speed + p.phase);
    const alpha = p.alphaBase + pulse * 0.14;

    // Small soft dots read better than 1px squares, especially on HDR/high-density panels.
    ctx.beginPath();
    ctx.fillStyle = rgbA(THEME.particle, alpha);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWireframeModel(model, alphaScale = 1) {
  if (!model || !model.V.length || !model.E.length || alphaScale <= 0.001) return;
  const wireStrength = Math.max(0, Math.min(1, alphaScale));

  const T = model.V.map(v => mvec(R, v));
  const P2 = T.map(p => project(p));

  for (let i = 0; i < DEPTH_BUCKETS; i++) buckets[i].length = 0;

  for (const [a, b] of model.E) {
    const z = (T[a][2] + T[b][2]) * 0.5;
    const t = Math.max(0, Math.min(0.999, (Z_HALF - z) / (Z_HALF * 2)));
    buckets[Math.floor(t * DEPTH_BUCKETS)].push([a, b]);
  }

  ctx.save();
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = rgbA(THEME.wireA, 0.11 * wireStrength);
  ctx.beginPath();
  for (const [a, b] of model.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = rgbA(THEME.wireB, 0.17 * wireStrength);
  ctx.beginPath();
  for (const [a, b] of model.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();
  ctx.restore();

  ctx.lineWidth = 0.82 + 0.30 * wireStrength;
  for (let i = 0; i < DEPTH_BUCKETS; i++) {
    if (!buckets[i].length) continue;
    const t = (i + 0.5) / DEPTH_BUCKETS;
    const edgeAlpha = (0.06 + Math.pow(t, 1.35) * 0.94) * wireStrength;
    const alp = edgeAlpha.toFixed(3);
    // Bias toward brighter depth tones so wireframe remains readable on black.
    const c = lerpColor(THEME.wireNear, THEME.wireFar, 0.2 + t * 0.8);
    ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alp})`;
    ctx.beginPath();
    for (const [a, bi] of buckets[i]) {
      ctx.moveTo(P2[a][0], P2[a][1]);
      ctx.lineTo(P2[bi][0], P2[bi][1]);
    }
    ctx.stroke();
  }
}

function getModelTriangles(model) {
  const faces = model.F || [];
  const tris = [];

  for (const face of faces) {
    if (!face || face.length < 3) continue;
    if (face.length === 3) {
      tris.push([face[0], face[1], face[2]]);
    } else if (face.length === 4) {
      tris.push([face[0], face[1], face[2]]);
      tris.push([face[0], face[2], face[3]]);
    } else {
      for (let i = 1; i < face.length - 1; i++) {
        tris.push([face[0], face[i], face[i + 1]]);
      }
    }
  }

  return tris;
}

function getModelVertexNormals(model, triFaces) {
  if (model._vertexNormals) return model._vertexNormals;

  const V = model.V;
  const normals = Array.from({ length: V.length }, () => [0, 0, 0]);

  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const v of V) {
    cx += v[0];
    cy += v[1];
    cz += v[2];
  }
  const invCount = V.length ? 1 / V.length : 1;
  cx *= invCount;
  cy *= invCount;
  cz *= invCount;

  for (const tri of triFaces) {
    const ia = tri[0], ib = tri[1], ic = tri[2];
    const a = V[ia], b = V[ib], c = V[ic];

    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-9) continue;

    // Orient normals outward from object center to avoid winding inconsistencies.
    const fx = (a[0] + b[0] + c[0]) / 3 - cx;
    const fy = (a[1] + b[1] + c[1]) / 3 - cy;
    const fz = (a[2] + b[2] + c[2]) / 3 - cz;
    if (nx * fx + ny * fy + nz * fz < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }

    normals[ia][0] += nx; normals[ia][1] += ny; normals[ia][2] += nz;
    normals[ib][0] += nx; normals[ib][1] += ny; normals[ib][2] += nz;
    normals[ic][0] += nx; normals[ic][1] += ny; normals[ic][2] += nz;
  }

  for (let i = 0; i < normals.length; i++) {
    let nx = normals[i][0];
    let ny = normals[i][1];
    let nz = normals[i][2];
    let nl = Math.hypot(nx, ny, nz);

    if (nl < 1e-9) {
      nx = V[i][0] - cx;
      ny = V[i][1] - cy;
      nz = V[i][2] - cz;
      nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-9) {
        normals[i] = [0, 1, 0];
        continue;
      }
    }

    normals[i] = [nx / nl, ny / nl, nz / nl];
  }

  model._vertexNormals = normals;
  return normals;
}

function drawSolidFillModel(model, alphaScale = 1) {
  const opacity = FILL_OPACITY * alphaScale;
  if (!model || !model.V.length || opacity <= 0.001) return;

  const T = model.V.map(v => mvec(R, v));
  const P2 = T.map(p => project(p));

  if (!model._triFaces) model._triFaces = getModelTriangles(model);

  const triFaces = model._triFaces;
  if (!triFaces.length) return;

  // Draw fill to an offscreen layer at full triangle opacity, then composite once.
  // This prevents internal seam lines from accumulated per-triangle alpha blending.
  fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  fillLayerCtx.clearRect(0, 0, W, H);

  // Dense meshes (revolved/tubed forms) look better with topology-based smooth normals.
  const useSmoothShading = triFaces.length > 80;
  const vertexNormals = useSmoothShading ? getModelVertexNormals(model, triFaces) : null;

  const seamExpandPx = useSmoothShading ? DENSE_SEAM_EXPAND_PX : 0;

  const triOrder = triFaces
    .map((tri) => ({
      tri,
      z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3,
    }))
    .sort((a, b) => b.z - a.z);

  fillLayerCtx.globalCompositeOperation = 'source-over';
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    const v0 = T[a], v1 = T[b], v2 = T[c];
    const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
    const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];

    let nx;
    let ny;
    let nz;

    if (useSmoothShading) {
      const na = vertexNormals[a];
      const nb = vertexNormals[b];
      const nc = vertexNormals[c];
      nx = na[0] + nb[0] + nc[0];
      ny = na[1] + nb[1] + nc[1];
      nz = na[2] + nb[2] + nc[2];
      const nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-6) continue;
      nx /= nl;
      ny /= nl;
      nz /= nl;
    } else {
      nx = uy * vz - uz * vy;
      ny = uz * vx - ux * vz;
      nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-6) continue;
      nx /= nl;
      ny /= nl;
      nz /= nl;
    }

    const ndotlRaw = nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2];
    const ndotl = Math.max(0, useSmoothShading ? ndotlRaw : Math.abs(ndotlRaw));

    // Blinn-Phong style highlight with fixed camera direction.
    const hx = LIGHT_DIR[0] + VIEW_DIR[0];
    const hy = LIGHT_DIR[1] + VIEW_DIR[1];
    const hz = LIGHT_DIR[2] + VIEW_DIR[2];
    const hl = Math.hypot(hx, hy, hz);
    const hnx = hx / hl, hny = hy / hl, hnz = hz / hl;
    const nhRaw = nx * hnx + ny * hny + nz * hnz;
    const nh = Math.max(0, useSmoothShading ? nhRaw : Math.abs(nhRaw));
    const spec = Math.pow(nh, useSmoothShading ? 24 : 18);

    const ambient = 0.26;
    const diffuse = 0.72 * ndotl;
    const specular = useSmoothShading ? 0.18 * spec : 0.30 * spec;
    const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));

    const shadeColor = lerpColor(THEME.shadeDark, THEME.shadeBright, lit);
    let axd = ax;
    let ayd = ay;
    let bxd = bx;
    let byd = by;
    let cxd = cx;
    let cyd = cy;

    if (seamExpandPx > 0) {
      const mx = (ax + bx + cx) / 3;
      const my = (ay + by + cy) / 3;

      let dax = ax - mx;
      let day = ay - my;
      let dal = Math.hypot(dax, day);
      if (dal > 1e-6) {
        dax /= dal;
        day /= dal;
        axd = ax + dax * seamExpandPx;
        ayd = ay + day * seamExpandPx;
      }

      let dbx = bx - mx;
      let dby = by - my;
      let dbl = Math.hypot(dbx, dby);
      if (dbl > 1e-6) {
        dbx /= dbl;
        dby /= dbl;
        bxd = bx + dbx * seamExpandPx;
        byd = by + dby * seamExpandPx;
      }

      let dcx = cx - mx;
      let dcy = cy - my;
      let dcl = Math.hypot(dcx, dcy);
      if (dcl > 1e-6) {
        dcx /= dcl;
        dcy /= dcl;
        cxd = cx + dcx * seamExpandPx;
        cyd = cy + dcy * seamExpandPx;
      }
    }

    fillLayerCtx.beginPath();
    fillLayerCtx.moveTo(axd, ayd);
    fillLayerCtx.lineTo(bxd, byd);
    fillLayerCtx.lineTo(cxd, cyd);
    fillLayerCtx.closePath();
    fillLayerCtx.fillStyle = `rgb(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]})`;
    fillLayerCtx.fill();
  }

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = opacity;
  ctx.drawImage(fillLayerCanvas, 0, 0);
  ctx.restore();
}

function drawMorphPoints(nowMs, tRaw, t) {
  if (!MORPH || !MORPH.active) return;
  const points = getMorphNowVertices(nowMs);

  const params = computeFrameParams(points);
  MODEL_CY = params.cy;
  Z_HALF = params.zHalf;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Movement guides: source → target paths make the morph direction obvious.
  const linkAlpha = (0.08 + (1 - Math.abs(0.5 - t) * 2) * 0.08).toFixed(3);
  ctx.lineWidth = 0.65;
  ctx.strokeStyle = rgbA(THEME.morph, Number(linkAlpha));
  ctx.beginPath();
  for (let i = 0; i < MORPH.sampleCount; i += 2) {
    const pFrom = project(mvec(R, MORPH.fromPts[i]));
    const pTo = project(mvec(R, MORPH.toPts[i]));
    ctx.moveTo(pFrom[0], pFrom[1]);
    ctx.lineTo(pTo[0], pTo[1]);
  }
  ctx.stroke();

  // Particle streaks: tiny tails reinforce motion over simple fade.
  const tPrev = easeInOutCubic(Math.max(0, tRaw - 0.06));
  for (let i = 0; i < MORPH.sampleCount; i++) {
    const from = MORPH.fromPts[i];
    const to = MORPH.toPts[i];
    const v = points[i];
    const vPrev = [
      from[0] + (to[0] - from[0]) * tPrev,
      from[1] + (to[1] - from[1]) * tPrev,
      from[2] + (to[2] - from[2]) * tPrev,
    ];

    const p = project(mvec(R, v));
    const pPrev = project(mvec(R, vPrev));

    ctx.lineWidth = 1.0;
    ctx.strokeStyle = rgbA(THEME.morph, 0.22);
    ctx.beginPath();
    ctx.moveTo(pPrev[0], pPrev[1]);
    ctx.lineTo(p[0], p[1]);
    ctx.stroke();

    const r = 1.0 + t * 0.55;
    const a = 0.13 + Math.sin((p[0] + p[1] + nowMs * 0.03) * 0.01) * 0.04;
    ctx.beginPath();
    ctx.fillStyle = rgbA(THEME.morph, Math.max(0.06, a));
    ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  if (tRaw >= 1) {
    MORPH.active = false;
    setActiveModel(MORPH.toModel, MORPH.targetName, MORPH.targetV, MORPH.targetE);
    MORPH = null;
  }
}

function frame(nowMs = 0) {
  requestAnimationFrame(frame);

  // ── Physics ────────────────────────────────────────────────────────
  R = mmul(mry(wy), mmul(mrx(wx), mmul(mrz(wz), R)));
  if (++frameCount % 120 === 0) R = reorthogonalize(R);

  if (!dragging) {
    wx += (AUTO_WX - wx) * 0.04;
    wy += (AUTO_WY - wy) * 0.04;
    wz += (AUTO_WZ - wz) * 0.04;
  } else {
    wx *= 0.85;
    wy *= 0.85;
  }

  // ── Draw ───────────────────────────────────────────────────────────
  drawBackground(nowMs);

  if (MORPH && MORPH.active) {
    const tRaw = Math.max(0, Math.min(1, (nowMs - MORPH.startMs) / MORPH.durationMs));
    const t = easeInOutCubic(tRaw);
    drawSolidFillModel(MORPH.fromModel, (1 - t) * 0.65);
    drawSolidFillModel(MORPH.toModel, t * 0.65);
    if (WIRE_OPACITY > 0.001) {
      // Keep wireframes as faint context; primary effect is moving geometry points.
      drawWireframeModel(MORPH.fromModel, (1 - t) * 0.25 * WIRE_OPACITY);
      drawWireframeModel(MORPH.toModel, t * 0.25 * WIRE_OPACITY);
    }
    drawMorphPoints(nowMs, tRaw, t);
  } else {
    drawSolidFillModel(MODEL, 1);
    if (WIRE_OPACITY > 0.001) drawWireframeModel(MODEL, WIRE_OPACITY);
  }
}

function startApp() {
  initObjectSelector();
  requestAnimationFrame(frame);
}

const ready = window.WireframeObjectsReady || Promise.resolve();
ready.then(startApp).catch((err) => {
  console.error(err);
  document.getElementById('obj-label').textContent = 'Failed to load objects';
  requestAnimationFrame(frame);
});
