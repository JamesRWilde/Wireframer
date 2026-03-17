import { bgState } from './backgroundState.js';
import { syncCanvasSize } from './syncCanvasSize.js';

export function initCanvas() {
  if (typeof document === 'undefined') return;

  const cpuCanvas = document.getElementById('c');
  globalThis.fgCanvas = document.getElementById('fg');
  globalThis.gpuCanvas = document.getElementById('gpu');
  
  globalThis.ctx = globalThis.fgCanvas ? globalThis.fgCanvas.getContext('2d') : null;
  
  if (!globalThis.ctx) {
    console.warn('[initCanvas] fg context not available, falling back to cpu');
    globalThis.ctx = cpuCanvas ? cpuCanvas.getContext('2d') : null;
  }
  
  globalThis.fillLayerCanvas = document.createElement('canvas');
  globalThis.fillLayerCtx = globalThis.fillLayerCanvas.getContext('2d', { alpha: true, desynchronized: true });
  
  if (globalThis.fillLayerCtx) globalThis.fillLayerCtx.imageSmoothingEnabled = false;

  if (typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function') {
    syncCanvasSize(cpuCanvas);
    globalThis.addEventListener('resize', () => syncCanvasSize(cpuCanvas));
    globalThis.addEventListener('resize', () => {
      globalThis.W = globalThis.innerWidth;
      globalThis.H = globalThis.innerHeight;
    });
  }

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
