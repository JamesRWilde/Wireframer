import * as state from '../state/stateRenderEngineVertexTransformBridge.js';

export function disposeRenderEngineWorkerTerminate() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
    state.workerAvailable = false;
  }
}
