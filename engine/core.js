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
window.setBackgroundParticleDensity = setBackgroundParticleDensity;

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
let RENDER_FRAME_ID = 0;
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

function getModelFrameData(model) {
  if (!model || !model.V || !model.V.length) return null;
  if (model._frameData && model._frameData.id === RENDER_FRAME_ID) return model._frameData;

  const V = model.V;
  let T = model._cacheT;
  let P2 = model._cacheP2;
  if (!T || T.length !== V.length || !P2 || P2.length !== V.length) {
    T = new Array(V.length);
    P2 = new Array(V.length);
    for (let i = 0; i < V.length; i++) {
      T[i] = [0, 0, 0];
      P2[i] = [0, 0];
    }
    model._cacheT = T;
    model._cacheP2 = P2;
  }

  const r00 = R[0], r01 = R[1], r02 = R[2];
  const r10 = R[3], r11 = R[4], r12 = R[5];
  const r20 = R[6], r21 = R[7], r22 = R[8];
  const fov = Math.min(W, H) * 0.90 * ZOOM;
  const hw = W * 0.5;
  const hh = H * 0.5;

  for (let i = 0; i < V.length; i++) {
    const v = V[i];
    const tx = r00 * v[0] + r01 * v[1] + r02 * v[2];
    const ty = r10 * v[0] + r11 * v[1] + r12 * v[2];
    const tz = r20 * v[0] + r21 * v[1] + r22 * v[2];
    const t = T[i];
    t[0] = tx;
    t[1] = ty;
    t[2] = tz;

    const d = tz + 3.0;
    const p = P2[i];
    p[0] = hw + tx * fov / d;
    p[1] = hh - (ty - MODEL_CY) * fov / d;
  }

  model._frameData = { id: RENDER_FRAME_ID, T, P2 };
  return model._frameData;
}

/* ─────────────────────────────────────────────────────────────────────────
   Active model
───────────────────────────────────────────────────────────────────────── */
let MODEL = { V: [], E: [] };
const MORPH_DURATION_MS = 2000;
const MORPH_POINT_CAP = 700;
let MORPH = null;
let HOLD_ROTATION_FRAMES = 0;
window.DETAIL_LEVEL = 1;
let GLOBAL_MIN_LOD_PERCENT = 5; // Minimum LOD as percent of max vertices (settable)

function setGlobalMinLodPercent(percent) {
  GLOBAL_MIN_LOD_PERCENT = Math.max(1, Math.min(100, Number(percent) || 5));
}

// Minimal, robust QEM decimation that always reduces vertex count
function decimateMeshVertices(model, percent) {
  if (!model || !model.V || model.V.length < 3) return model;
  const n = model.V.length;
  const minPercent = Math.max(GLOBAL_MIN_LOD_PERCENT, 1);
  const clampedPercent = Math.max(minPercent, Math.min(100, percent));
  const targetCount = Math.max(3, Math.round((clampedPercent / 100) * n));
  if (targetCount >= n) return model;

  // BASIC decimator: randomly remove vertices and associated faces until targetCount is reached
  let V = model.V.map(v => v.slice());
  let F = model.F.map(f => f.slice());
  while (V.length > targetCount) {
    // Remove a random vertex
    const idx = Math.floor(Math.random() * V.length);
    V.splice(idx, 1);
    // Remove faces that reference this vertex
    F = F.filter(face => face.every(i => i !== idx));
    // Reindex faces
    F = F.map(face => face.map(i => (i > idx ? i - 1 : i)));
  }
  const E = buildEdgesFromFacesRuntime(F);
  if (!F.length || !V.length) {
    console.warn('Basic decimation produced empty mesh! Returning original.');
    return model;
  }
  return {
    ...model,
    V,
    F,
    E,
  };
}

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
  let maxD2 = 0;
  for (const [x, y, z] of vertices) {
    const dy = y - cy;
    const d2 = x * x + dy * dy + z * z;
    if (d2 > maxD2) maxD2 = d2;
  }

  return { cy, zHalf: Math.sqrt(maxD2) * 1.05 };
}

function setActiveModel(model, name) {
  MODEL = model;
  const params = computeFrameParams(MODEL.V);
  MODEL_CY = params.cy;
  Z_HALF = params.zHalf;
  console.log(`[setActiveModel] MODEL.V.length=${MODEL.V.length}, MODEL.E.length=${MODEL.E.length}`);
  updateHud(name, MODEL.V.length, MODEL.E.length);
}

function currentLodBucket() {
  return Math.round(DETAIL_LEVEL * 100);
}

function buildEdgesFromFacesRuntime(faces) {
  const E = [];
  const edgeSet = new Set();

  function addEdge(a, b) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = `${lo}|${hi}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    E.push([lo, hi]);
  }

  for (const face of faces || []) {
    if (!Array.isArray(face) || face.length < 2) continue;
    for (let i = 0; i < face.length; i++) {
      addEdge(face[i], face[(i + 1) % face.length]);
    }
  }

  return E;
}

// Utility: filter edges to only those with valid vertex indices
function filterValidEdges(E, V) {
  const n = V.length;
  return (E || []).filter(e =>
    Array.isArray(e) && e.length === 2 &&
    Number.isInteger(e[0]) && Number.isInteger(e[1]) &&
    e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1]
  );
}

function toRuntimeMesh(rawModel, obj) {
  if (!rawModel || typeof rawModel !== 'object') {
    throw new Error(`Invalid mesh for object '${obj.name}'`);
  }

  // Canonical mesh format used by registry/import pipeline.
  if (rawModel.format === 'indexed-polygons-v1' || (Array.isArray(rawModel.positions) && Array.isArray(rawModel.faces))) {
    const V = (rawModel.positions || []).map((v) => [Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0]);
    const F = (rawModel.faces || [])
      .filter((f) => Array.isArray(f) && f.length >= 3)
      .map((f) => f.map((idx) => Math.max(0, Math.floor(Number(idx) || 0))));
    const E = (Array.isArray(rawModel.edges) && rawModel.edges.length
      ? rawModel.edges
          .filter((e) => Array.isArray(e) && e.length >= 2)
          .map((e) => [Math.max(0, Math.floor(Number(e[0]) || 0)), Math.max(0, Math.floor(Number(e[1]) || 0))])
      : buildEdgesFromFacesRuntime(F));
    return {
      V,
      E: filterValidEdges(E, V),
      F,
      _meshFormat: 'indexed-polygons-v1',
      _shadingMode: rawModel.shadingMode || obj.shadingMode || obj.shading || 'auto',
      _creaseAngleDeg: Number.isFinite(rawModel.creaseAngleDeg) ? rawModel.creaseAngleDeg : obj.creaseAngleDeg,
    };
  }

  // Legacy shape contract support.
  const V = Array.isArray(rawModel.V) ? rawModel.V : [];
  const F = Array.isArray(rawModel.F) ? rawModel.F : [];
  const E = Array.isArray(rawModel.E) && rawModel.E.length ? rawModel.E : buildEdgesFromFacesRuntime(F);
  return {
    ...rawModel,
    V,
    E: filterValidEdges(E, V),
    F,
    _meshFormat: rawModel._meshFormat || 'legacy-vef',
    _shadingMode: rawModel._shadingMode || obj.shadingMode || obj.shading || 'auto',
    _creaseAngleDeg: Number.isFinite(rawModel._creaseAngleDeg) ? rawModel._creaseAngleDeg : obj.creaseAngleDeg,
  };
}

function getDetailModel(obj) {
  const percent = Math.max(GLOBAL_MIN_LOD_PERCENT, Math.round(DETAIL_LEVEL * 100));
  // Always build at highest detail
  const rawModel = obj.build({ detail: 1 });
  let model = toRuntimeMesh(rawModel, obj);
  // Decimate if needed
  if (percent < 100) {
    model = decimateMeshVertices(model, percent);
  }
  return model;
}

function loadObject(obj) {
  MORPH = null;
  const model = getDetailModel(obj);
  console.log(`[loadObject] model.V.length=${model.V.length}, model.E.length=${model.E.length}`);
  setActiveModel(model, obj.name);
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
  // Fast nearest-neighbor mapping with random sampling and hard cap for performance
  const nSource = sourceVertices.length;
  const nTarget = targetVertices.length;
  if (!nSource) return targetVertices.map((v) => [v[0], v[1], v[2]]);

  // Cap the number of points for morph mapping
  const MAX_MORPH_POINTS = 300;
  const sampleCount = Math.min(MAX_MORPH_POINTS, nSource, nTarget);

  // Randomly sample points from source and target for even coverage
  function randomSample(arr, count) {
    const n = arr.length;
    if (count >= n) return arr.slice();
    const result = [];
    const used = new Set();
    while (result.length < count) {
      const idx = Math.floor(Math.random() * n);
      if (!used.has(idx)) {
        used.add(idx);
        result.push(arr[idx]);
      }
    }
    return result;
  }

  const sourceSample = randomSample(sourceVertices, sampleCount);
  const targetSample = randomSample(targetVertices, sampleCount);

  // Normalize for fair distance
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
  const sourceBounds = getBounds(sourceSample);
  const targetBounds = getBounds(targetSample);
  const sourceNorm = sourceSample.map((v) => normalizePoint(v, sourceBounds));
  const targetNorm = targetSample.map((v) => normalizePoint(v, targetBounds));

  // Greedy nearest-neighbor assignment
  const used = new Array(sourceNorm.length).fill(false);
  const mapped = new Array(targetNorm.length);
  for (let j = 0; j < targetNorm.length; j++) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sourceNorm.length; i++) {
      if (used[i]) continue;
      const dx = sourceNorm[i][0] - targetNorm[j][0];
      const dy = sourceNorm[i][1] - targetNorm[j][1];
      const dz = sourceNorm[i][2] - targetNorm[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bestDist) {
        bestDist = d2;
        bestIdx = i;
      }
    }
    used[bestIdx] = true;
    mapped[j] = [sourceSample[bestIdx][0], sourceSample[bestIdx][1], sourceSample[bestIdx][2]];
  }

  // For the full targetVertices array, assign each to the nearest in the mapped sample
  const mappedFull = new Array(nTarget);
  for (let j = 0; j < nTarget; j++) {
    // Find nearest in targetSample
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let k = 0; k < targetSample.length; k++) {
      const dx = targetVertices[j][0] - targetSample[k][0];
      const dy = targetVertices[j][1] - targetSample[k][1];
      const dz = targetVertices[j][2] - targetSample[k][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bestDist) {
        bestDist = d2;
        bestIdx = k;
      }
    }
    mappedFull[j] = mapped[bestIdx];
  }
  return mappedFull;
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
    _shadingMode: toModel._shadingMode || 'auto',
    _creaseAngleDeg: toModel._creaseAngleDeg,
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

// Add a visible debug overlay to the page for mesh decimation status
function showDecimationDebugInfo(current, target) {
  let dbg = document.getElementById('decimation-debug');
  if (!dbg) {
    dbg = document.createElement('div');
    dbg.id = 'decimation-debug';
    dbg.style.position = 'fixed';
    dbg.style.bottom = '10px';
    dbg.style.right = '10px';
    dbg.style.background = 'rgba(0,0,0,0.8)';
    dbg.style.color = '#fff';
    dbg.style.font = 'bold 15px monospace';
    dbg.style.padding = '8px 16px';
    dbg.style.zIndex = 9999;
    dbg.style.borderRadius = '8px';
    document.body.appendChild(dbg);
  }
  dbg.textContent = `Decimator: vertices=${current}, target=${target}`;
}

