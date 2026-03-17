import * as state from '../renderVertexTransformBridgeState.js';

export function disposeRenderWorkerTerminate() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
    state.workerAvailable = false;
  }
}
