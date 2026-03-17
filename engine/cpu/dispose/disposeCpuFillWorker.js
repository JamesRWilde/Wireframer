import * as state from '../state/cpuFillRenderBridgeState.js';

export function disposeCpuFillWorker() {
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
