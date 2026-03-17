import * as state from './backgroundWorkerState.js';
import { getBackgroundCanvas } from './get/getBackgroundCanvas.js';

export function initBackgroundWorker() {
  if (state.workerInitialized) return state.workerReady;
  state.workerInitialized = true;
  
  if (typeof Worker === 'undefined') return false;
  
  try {
    state.worker = new Worker(
      new URL('../workers/backgroundWorker.js', import.meta.url).href,
      { type: 'module' }
    );
    
    state.worker.onmessage = (event) => {
      const { type, data, count } = event.data;
      if (type === 'ready') {
        state.workerReady = true;
      } else if (type === 'particles') {
        state.pendingWorkerParticles = { data, count };
      } else if (type === 'error') {
        console.error('[BackgroundWorker]', event.data.message);
        state.workerReady = false;
      }
    };
    
    state.worker.onerror = () => {
      state.workerReady = false;
    };
    
    const canvasState = getBackgroundCanvas();
    if (canvasState) {
      state.worker.postMessage({
        type: 'init',
        width: canvasState.w,
        height: canvasState.h,
        density: globalThis.BG_PARTICLE_DENSITY_PCT ?? 1,
        speed: globalThis.BG_PARTICLE_VELOCITY_PCT ?? 1,
        themeMode: globalThis.THEME_MODE ?? 'dark'
      });
    }
    
    return true;
  } catch (error) {
    console.warn('[BackgroundWorker] Failed to initialize:', error);
    return false;
  }
}
