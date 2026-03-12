// Initialize shared canvas globals used by rendering modules
// Must be imported before any module that relies on `ctx` or `fgCanvas`.
import { bgState } from '../render/background/backgroundState.js';

export function initCanvas() {
  if (typeof document === 'undefined') return;

  const cpuCanvas = document.getElementById('c');
  globalThis.fgCanvas = document.getElementById('fg');
  // use foreground canvas as primary drawing context (always on top)
  globalThis.ctx = globalThis.fgCanvas ? globalThis.fgCanvas.getContext('2d') : null;
  // cpuCanvas remains available for offscreen operations if needed
  if (!globalThis.ctx) {
    console.warn('[initCanvas] fg context not available, falling back to cpu');
    globalThis.ctx = cpuCanvas ? cpuCanvas.getContext('2d') : null;
  }
  // prepare a dedicated offscreen canvas for fill‑layer rendering
  globalThis.fillLayerCanvas = document.createElement('canvas');
  globalThis.fillLayerCtx = globalThis.fillLayerCanvas.getContext('2d', { alpha: true, desynchronized: true });
  if (globalThis.fillLayerCtx) globalThis.fillLayerCtx.imageSmoothingEnabled = false;

  // resize all canvases to match viewport
  // make sure all canvases have matching resolution to viewport
  function syncSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // update global dimensions so other modules can use them reliably
    globalThis.W = w;
    globalThis.H = h;
    if (cpuCanvas) {
      cpuCanvas.width = w;
      cpuCanvas.height = h;
    }
    const bgCanvas = document.getElementById('bg');
    if (bgCanvas) {
      bgCanvas.width = w;
      bgCanvas.height = h;
    }
    if (globalThis.fgCanvas) {
      globalThis.fgCanvas.width = w;
      globalThis.fgCanvas.height = h;
    }
    if (globalThis.fillLayerCanvas) {
      globalThis.fillLayerCanvas.width = w;
      globalThis.fillLayerCanvas.height = h;
    }
    console.debug('[initCanvas] synced canvas sizes', w, h);
  }
  if (typeof window !== 'undefined') {
    syncSize();
    window.addEventListener('resize', syncSize);
    // also keep globals up to date on resize
    window.addEventListener('resize', () => {
      globalThis.W = window.innerWidth;
      globalThis.H = window.innerHeight;
    });
  }

  // Wire up background canvas for the background renderer state if available.
  try {
    const bgCanvas = document.getElementById('bg');
    if (bgCanvas) {
      bgState.canvas = bgCanvas;
    }
  } catch (err) {
    console.warn('[initCanvas] failed to locate bg canvas', err);
  }
}

export default initCanvas;
