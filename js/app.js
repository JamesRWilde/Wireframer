'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   Canvas
───────────────────────────────────────────────────────────────────────── */
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
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
const wireToggle = document.getElementById('wire-toggle');
let FILL_OPACITY = 0;
let SHOW_WIREFRAME = true;

const LIGHT_DIR = (() => {
  const x = -0.38, y = 0.74, z = -0.56;
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
})();
const VIEW_DIR = [0, 0, -1];

function syncRenderToggles() {
  FILL_OPACITY = Number(fillOpacity.value) / 100;
  fillOpacityValue.textContent = `${Math.round(FILL_OPACITY * 100)}%`;
  SHOW_WIREFRAME = !!wireToggle.checked;
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
  wireToggle.oninput = syncRenderToggles;
  wireToggle.onchange = syncRenderToggles;
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

  ctx.fillStyle = '#050810';
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
    ctx.fillStyle = `rgba(105, 205, 255, ${alpha.toFixed(3)})`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Keep a very light vignette for depth, but avoid heavy gradients.
  const g = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, Math.max(W,H)*.72);
  g.addColorStop(0, 'rgba(10, 22, 48, 0.0)');
  g.addColorStop(1, 'rgba(0,   2, 12, 0.34)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawWireframeModel(model, alphaScale = 1) {
  if (!model || !model.V.length || !model.E.length || alphaScale <= 0.001) return;

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
  ctx.strokeStyle = `rgba(20, 150, 210, ${(0.05 * alphaScale).toFixed(3)})`;
  ctx.beginPath();
  for (const [a, b] of model.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = `rgba(50, 185, 235, ${(0.075 * alphaScale).toFixed(3)})`;
  ctx.beginPath();
  for (const [a, b] of model.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();
  ctx.restore();

  ctx.lineWidth = 0.75;
  for (let i = 0; i < DEPTH_BUCKETS; i++) {
    if (!buckets[i].length) continue;
    const t = (i + 0.5) / DEPTH_BUCKETS;
    const alp = (Math.pow(t, 1.6) * alphaScale).toFixed(3);
    const g = Math.floor(140 + t * 90);
    const b = Math.floor(190 + t * 65);
    ctx.strokeStyle = `rgba(65, ${g}, ${b}, ${alp})`;
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

function drawSolidFillModel(model, alphaScale = 1) {
  const opacity = FILL_OPACITY * alphaScale;
  if (!model || !model.V.length || opacity <= 0.001) return;

  const T = model.V.map(v => mvec(R, v));
  const P2 = T.map(p => project(p));

  if (!model._triFaces) model._triFaces = getModelTriangles(model);

  ctx.save();
  const triFaces = model._triFaces;
  if (!triFaces.length) {
    ctx.restore();
    return;
  }

  const triOrder = triFaces
    .map((tri) => ({
      tri,
      z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3,
    }))
    .sort((a, b) => b.z - a.z);

  ctx.globalCompositeOperation = 'source-over';
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    const depth = Math.max(0, Math.min(1, (Z_HALF - item.z) / (Z_HALF * 2)));
    const v0 = T[a], v1 = T[b], v2 = T[c];
    const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
    const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-6) continue;
    nx /= nl;
    ny /= nl;
    nz /= nl;

    // Use absolute diffuse so inconsistent face winding does not produce broken lighting.
    const ndotlRaw = nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2];
    const ndotl = Math.max(0, Math.abs(ndotlRaw));

    // Blinn-Phong style highlight with fixed camera direction.
    const hx = LIGHT_DIR[0] + VIEW_DIR[0];
    const hy = LIGHT_DIR[1] + VIEW_DIR[1];
    const hz = LIGHT_DIR[2] + VIEW_DIR[2];
    const hl = Math.hypot(hx, hy, hz);
    const hnx = hx / hl, hny = hy / hl, hnz = hz / hl;
    const spec = Math.pow(Math.max(0, Math.abs(nx * hnx + ny * hny + nz * hnz)), 18);

    const ambient = 0.26;
    const diffuse = 0.72 * ndotl;
    const specular = 0.30 * spec;
    const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));

    const r = Math.round(18 + 42 * lit);
    const g = Math.round(72 + 120 * lit);
    const bcol = Math.round(102 + 138 * lit);
    const alpha = opacity;

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = `rgba(${r}, ${g}, ${bcol}, ${alpha.toFixed(3)})`;
    ctx.fill();
  }

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
  ctx.strokeStyle = `rgba(95, 190, 245, ${linkAlpha})`;
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
    ctx.strokeStyle = 'rgba(118, 224, 255, 0.22)';
    ctx.beginPath();
    ctx.moveTo(pPrev[0], pPrev[1]);
    ctx.lineTo(p[0], p[1]);
    ctx.stroke();

    const r = 1.0 + t * 0.55;
    const a = 0.13 + Math.sin((p[0] + p[1] + nowMs * 0.03) * 0.01) * 0.04;
    ctx.beginPath();
    ctx.fillStyle = `rgba(108, 214, 255, ${Math.max(0.06, a).toFixed(3)})`;
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
    if (SHOW_WIREFRAME) {
      // Keep wireframes as faint context; primary effect is moving geometry points.
      drawWireframeModel(MORPH.fromModel, (1 - t) * 0.25);
      drawWireframeModel(MORPH.toModel, t * 0.25);
    }
    drawMorphPoints(nowMs, tRaw, t);
  } else {
    drawSolidFillModel(MODEL, 1);
    if (SHOW_WIREFRAME) drawWireframeModel(MODEL, 1);
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
