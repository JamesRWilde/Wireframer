import { onMove } from './onMove.js';

export function attachInputListeners(canvas) {
  if (!canvas) return;
  // Remove any previous listeners by cloning the node (safe for this app)
  const newCanvas = canvas.cloneNode(true);
  canvas.parentNode.replaceChild(newCanvas, canvas);
  canvas = newCanvas;

  canvas.addEventListener('mousedown', e => {
    // ensure we have a full physics state object; most modules import
    // physicsState.js which creates one, but be defensive here as well.
    if (!globalThis.PHYSICS_STATE) {
      globalThis.PHYSICS_STATE = {
        wx:0, wy:0, wz:0,
        AUTO_WX:0.01, AUTO_WY:0.015, AUTO_WZ:0.0025,
        R: null,
        dragging: false,
        HOLD_ROTATION_FRAMES: 0,
      };
    }
    globalThis.PHYSICS_STATE.dragging = true;
    globalThis.PHYSICS_STATE.lastPointerX = e.clientX;
    globalThis.PHYSICS_STATE.lastPointerY = e.clientY;
    globalThis.PHYSICS_STATE.wx = 0;
    globalThis.PHYSICS_STATE.wy = 0;
  });

  globalThis.addEventListener('mouseup', () => {
    if (globalThis.PHYSICS_STATE) globalThis.PHYSICS_STATE.dragging = false;
  });

  globalThis.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));

  canvas.addEventListener('touchstart', e => {
    if (!globalThis.PHYSICS_STATE) globalThis.PHYSICS_STATE = {};
    globalThis.PHYSICS_STATE.dragging = true;
    globalThis.PHYSICS_STATE.lastPointerX = e.touches[0].clientX;
    globalThis.PHYSICS_STATE.lastPointerY = e.touches[0].clientY;
    globalThis.PHYSICS_STATE.wx = 0;
    globalThis.PHYSICS_STATE.wy = 0;
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    if (globalThis.PHYSICS_STATE) globalThis.PHYSICS_STATE.dragging = false;
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  canvas.addEventListener('wheel', (e) => {
    // Let Ctrl+wheel keep browser/page zoom behavior.
    if (e.ctrlKey) return;
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0012);
    // explicitly write to the global object rather than creating an implicit global variable
    globalThis.ZOOM = Math.max(globalThis.ZOOM_MIN, Math.min(globalThis.ZOOM_MAX, globalThis.ZOOM * factor));
  }, { passive: false });

  // Expose for other modules if needed
  globalThis._inputCanvas = canvas;
}
