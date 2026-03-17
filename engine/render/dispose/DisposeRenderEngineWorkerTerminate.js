import * as state from '../state/StateRenderEngineVertexTransformBridge.js';

export function DisposeRenderEngineWorkerTerminate() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
    state.workerAvailable = false;
  }
}
