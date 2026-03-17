import * as state from '../state/cpuEngineFillRenderBridge.js';

export function cpuEngineFillWorker() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
    state.workerReady = false;
    state.workerAvailable = false;
  }
  if (state.cachedImageBitmap) {
    state.cachedImageBitmap.close();
    state.cachedImageBitmap = null;
  }
  state.offscreenCanvas = null;
}
