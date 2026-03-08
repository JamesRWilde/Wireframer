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
let DETAIL_LEVEL = 1;
const MODEL_CACHE = new Map();
const MODEL_CACHE_LIMIT = 80;

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

function currentLodBucket() {
  return Math.round(DETAIL_LEVEL * 100);
}

function getDetailModel(obj) {
  const key = `${obj.name}|${currentLodBucket()}`;
  const cached = MODEL_CACHE.get(key);
  if (cached) return cached;

  const model = obj.build({ detail: DETAIL_LEVEL });
  MODEL_CACHE.set(key, model);

  if (MODEL_CACHE.size > MODEL_CACHE_LIMIT) {
    const firstKey = MODEL_CACHE.keys().next().value;
    MODEL_CACHE.delete(firstKey);
  }

  return model;
}

function loadObject(obj) {
  MORPH = null;
  const model = getDetailModel(obj);
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
  const toModel = getDetailModel(obj);
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

