'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   Canvas
───────────────────────────────────────────────────────────────────────── */
const canvas = document.getElementById('c');
const bgCanvas = document.getElementById('bg');
const fgCanvas = document.getElementById('fg');
const ctx    = canvas.getContext('2d');
const fillLayerCanvas = document.createElement('canvas');
const fillLayerCtx = fillLayerCanvas.getContext('2d');
let W = 0, H = 0;
const BG_PARTICLES = [];
let BG_PARTICLE_DENSITY = 1;
let BG_PARTICLE_DENSITY_TARGET = 1;
let BG_PARTICLE_VELOCITY = 1;
let BG_PARTICLE_VELOCITY_TARGET = 1;
let BG_PARTICLE_OPACITY = 1;
let BG_PARTICLE_OPACITY_TARGET = 1;

function clampBackgroundScale(level) {
  return Math.max(0, Math.min(5.2, Number(level) || 0));
}

function createBackgroundParticle() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    size: 0.9 + Math.random() * 1.6,
    vx: (Math.random() - 0.5) * 0.24,
    vy: (Math.random() - 0.5) * 0.24,
    phase: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 1.5,
    alphaBase: 0.12 + Math.random() * 0.16,
  };
}

function getBackgroundParticleTargetCount() {
  const baseCount = Math.max(210, Math.round((W * H) / 9500));
  return Math.max(0, Math.round(baseCount * BG_PARTICLE_DENSITY_TARGET));
}

function reconcileBackgroundParticles() {
  const targetCount = getBackgroundParticleTargetCount();
  const currentCount = BG_PARTICLES.length;
  if (targetCount === currentCount) return;

  const delta = targetCount - currentCount;
  const step = Math.max(1, Math.ceil(Math.abs(delta) * 0.12));
  const amount = Math.min(Math.abs(delta), step);

  if (delta > 0) {
    for (let i = 0; i < amount; i++) BG_PARTICLES.push(createBackgroundParticle());
  } else {
    BG_PARTICLES.splice(Math.max(0, BG_PARTICLES.length - amount), amount);
  }
}

function setBackgroundParticleDensity(level) {
  BG_PARTICLE_DENSITY_TARGET = clampBackgroundScale(level);
}

function setBackgroundParticleVelocity(level) {
  BG_PARTICLE_VELOCITY_TARGET = clampBackgroundScale(level);
}

function setBackgroundParticleOpacity(level) {
  BG_PARTICLE_OPACITY_TARGET = clampBackgroundScale(level);
}

function initBackgroundParticles() {
  if (!W || !H) return;

  BG_PARTICLE_DENSITY = BG_PARTICLE_DENSITY_TARGET;
  BG_PARTICLE_VELOCITY = BG_PARTICLE_VELOCITY_TARGET;
  BG_PARTICLE_OPACITY = BG_PARTICLE_OPACITY_TARGET;
  const count = getBackgroundParticleTargetCount();
  BG_PARTICLES.length = 0;

  for (let i = 0; i < count; i++) {
    BG_PARTICLES.push(createBackgroundParticle());
  }
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (bgCanvas) {
    bgCanvas.width = W;
    bgCanvas.height = H;
  }
  if (fgCanvas) {
    fgCanvas.width = W;
    fgCanvas.height = H;
  }
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
let HOLD_ROTATION_FRAMES = 0;
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
    .sort(compareMorphVertices);
}

function compareMorphVertices(a, b) {
  if (Math.abs(a[1] - b[1]) > 0.03) return a[1] - b[1];
  const aa = Math.atan2(a[2], a[0]);
  const ab = Math.atan2(b[2], b[0]);
  if (aa !== ab) return aa - ab;
  const ra = a[0] * a[0] + a[2] * a[2];
  const rb = b[0] * b[0] + b[2] * b[2];
  return ra - rb;
}

function mapVerticesToTargetOrder(sourceVertices, targetVertices) {
  if (!sourceVertices.length) {
    return targetVertices.map((v) => [v[0], v[1], v[2]]);
  }

  function getBounds(vertices) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const [x, y, z] of vertices) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    return {
      minX, minY, minZ,
      sx: Math.max(1e-6, maxX - minX),
      sy: Math.max(1e-6, maxY - minY),
      sz: Math.max(1e-6, maxZ - minZ),
    };
  }

  function normalizePoint(v, b) {
    return [
      (v[0] - b.minX) / b.sx,
      (v[1] - b.minY) / b.sy,
      (v[2] - b.minZ) / b.sz,
    ];
  }

  const sourceBounds = getBounds(sourceVertices);
  const targetBounds = getBounds(targetVertices);

  const sourceNorm = sourceVertices.map((v) => normalizePoint(v, sourceBounds));

  const indexedTarget = targetVertices
    .map((v, i) => ({ i, v: [v[0], v[1], v[2]] }))
    .sort((a, b) => compareMorphVertices(a.v, b.v));

  // Coherence weight: higher reduces chaotic point jumps but can over-constrain far-apart regions.
  const coherenceWeight = 0.18;
  const reverseBias = 0.5;

  function mapByOrder(order) {
    const mapped = new Array(targetVertices.length);
    const used = new Uint8Array(sourceVertices.length);
    let remaining = sourceVertices.length;
    let prevSourceNorm = null;

    for (const t of order) {
      const targetIndex = t.i;
      const nT = normalizePoint(t.v, targetBounds);

      let bestIndex = -1;
      let bestScore = Infinity;

      // Prefer one-to-one nearest mapping while source points remain.
      for (let i = 0; i < sourceNorm.length; i++) {
        if (remaining > 0 && used[i]) continue;
        const nS = sourceNorm[i];
        const dx = nS[0] - nT[0];
        const dy = nS[1] - nT[1];
        const dz = nS[2] - nT[2];
        const d2 = dx * dx + dy * dy + dz * dz;

        let continuity = 0;
        if (prevSourceNorm) {
          const cdx = nS[0] - prevSourceNorm[0];
          const cdy = nS[1] - prevSourceNorm[1];
          const cdz = nS[2] - prevSourceNorm[2];
          continuity = cdx * cdx + cdy * cdy + cdz * cdz;
        }

        const score = d2 + continuity * coherenceWeight;
        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }

      if (bestIndex < 0) bestIndex = 0;
      if (remaining > 0 && !used[bestIndex]) {
        used[bestIndex] = 1;
        remaining--;
      }

      const src = sourceVertices[bestIndex];
      mapped[targetIndex] = [src[0], src[1], src[2]];
      prevSourceNorm = sourceNorm[bestIndex];
    }

    return mapped;
  }

  const forward = mapByOrder(indexedTarget);
  const reverse = mapByOrder([...indexedTarget].reverse());
  const mapped = new Array(targetVertices.length);

  for (let i = 0; i < mapped.length; i++) {
    const a = forward[i] || targetVertices[i];
    const b = reverse[i] || a;
    mapped[i] = [
      a[0] * (1 - reverseBias) + b[0] * reverseBias,
      a[1] * (1 - reverseBias) + b[1] * reverseBias,
      a[2] * (1 - reverseBias) + b[2] * reverseBias,
    ];
  }

  return mapped;
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

  const meshFromPts = mapVerticesToTargetOrder(fromModel.V, toModel.V);
  const meshModel = {
    V: meshFromPts.map((v) => [v[0], v[1], v[2]]),
    E: toModel.E,
    F: toModel.F,
  };

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
    targetFrameParams: computeFrameParams(toModel.V),
    meshFromPts,
    meshToPts: toModel.V,
    meshModel,
  };

  updateHud(`${obj.name} (morphing)`, toModel.V.length, toModel.E.length);
}

