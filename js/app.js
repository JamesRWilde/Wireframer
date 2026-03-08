'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   Canvas
───────────────────────────────────────────────────────────────────────── */
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
let W = 0, H = 0;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
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

function project(p) {
  const fov = Math.min(W, H) * 0.90;
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

function loadObject(obj) {
  MODEL = obj.build();

  // Vertical centre for screen alignment
  let minY = Infinity, maxY = -Infinity;
  for (const [, y] of MODEL.V) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  MODEL_CY = (minY + maxY) / 2;

  // Depth-shading range: max distance from origin (bounding sphere)
  let maxD = 0;
  for (const [x, y, z] of MODEL.V) {
    const d = Math.sqrt(x*x + (y - MODEL_CY)*(y - MODEL_CY) + z*z);
    if (d > maxD) maxD = d;
  }
  Z_HALF = maxD * 1.05;

  // Update HUD
  document.getElementById('obj-label').textContent = obj.name;
  document.getElementById('stat-v').textContent    = MODEL.V.length;
  document.getElementById('stat-e').textContent    = MODEL.E.length;
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

/* ─────────────────────────────────────────────────────────────────────────
   Object selector
───────────────────────────────────────────────────────────────────────── */
const select = document.getElementById('obj-select');

OBJECTS.forEach((obj, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = obj.name;
  select.appendChild(opt);
});

select.addEventListener('change', () => loadObject(OBJECTS[+select.value]));

loadObject(OBJECTS[0]);

/* ─────────────────────────────────────────────────────────────────────────
   Render loop
   Three draw passes per frame:
     1. Wide bloom   — thick, near-transparent strokes
     2. Narrow bloom — medium, near-transparent strokes
     3. Depth-shaded — thin crisp strokes: near=bright cyan, far=invisible
───────────────────────────────────────────────────────────────────────── */
const DEPTH_BUCKETS = 12;
const buckets = Array.from({ length: DEPTH_BUCKETS }, () => []);

function drawBackground() {
  ctx.fillStyle = '#050810';
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, Math.max(W,H)*.72);
  g.addColorStop(0, 'rgba(10, 22, 48, 0.0)');
  g.addColorStop(1, 'rgba(0,   2, 12, 0.65)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function frame() {
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

  // ── Transform ──────────────────────────────────────────────────────
  const T  = MODEL.V.map(v => mvec(R, v));
  const P2 = T.map(p => project(p));

  // ── Depth buckets ──────────────────────────────────────────────────
  for (let i = 0; i < DEPTH_BUCKETS; i++) buckets[i].length = 0;

  for (const [a, b] of MODEL.E) {
    const z = (T[a][2] + T[b][2]) * 0.5;
    // t=1 → nearest (z≈-Z_HALF), t=0 → farthest (z≈+Z_HALF)
    const t = Math.max(0, Math.min(0.999, (Z_HALF - z) / (Z_HALF * 2)));
    buckets[Math.floor(t * DEPTH_BUCKETS)].push([a, b]);
  }

  // ── Draw ───────────────────────────────────────────────────────────
  drawBackground();

  // Pass 1 – wide bloom
  ctx.save();
  ctx.lineWidth   = 4.5;
  ctx.strokeStyle = 'rgba(20, 150, 210, 0.050)';
  ctx.beginPath();
  for (const [a, b] of MODEL.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();

  // Pass 2 – narrow bloom
  ctx.lineWidth   = 1.8;
  ctx.strokeStyle = 'rgba(50, 185, 235, 0.075)';
  ctx.beginPath();
  for (const [a, b] of MODEL.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();
  ctx.restore();

  // Pass 3 – depth-shaded crisp lines (near=bright, far=invisible)
  ctx.lineWidth = 0.75;
  for (let i = 0; i < DEPTH_BUCKETS; i++) {
    if (!buckets[i].length) continue;
    const t   = (i + 0.5) / DEPTH_BUCKETS;
    const alp = Math.pow(t, 1.6).toFixed(2);
    const g   = Math.floor(140 + t * 90);
    const b   = Math.floor(190 + t * 65);
    ctx.strokeStyle = `rgba(65, ${g}, ${b}, ${alp})`;
    ctx.beginPath();
    for (const [a, bi] of buckets[i]) {
      ctx.moveTo(P2[a][0],  P2[a][1]);
      ctx.lineTo(P2[bi][0], P2[bi][1]);
    }
    ctx.stroke();
  }
}

requestAnimationFrame(frame);
