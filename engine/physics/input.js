
/* ─────────────────────────────────────────────────────────────────────────
   Rotation state (uses globals from globalVars.js: R, wx, wy, wz, frameCount, dragging)
   AUTO_WX, AUTO_WY, AUTO_WZ are set after globals are loaded
───────────────────────────────────────────────────────────────────────── */

// Initialize rotation after math functions are available
initRotation();

AUTO_WX = 0.003;   // pitch
AUTO_WY = 0.007;   // yaw  (main spin)
AUTO_WZ = 0.0015;  // roll
wx = AUTO_WX; wy = AUTO_WY; wz = AUTO_WZ;

/* ─────────────────────────────────────────────────────────────────────────
   Input — mouse & touch
───────────────────────────────────────────────────────────────────────── */
// (lx, ly declared in globalVars.js)

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

canvas = document.getElementById('c');
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

