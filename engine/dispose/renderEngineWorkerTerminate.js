import * as state from '../state/renderEngineVertexTransformBridge.js';

export function renderEngineWorkerTerminate() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
    state.workerAvailable = false;
  }
}
