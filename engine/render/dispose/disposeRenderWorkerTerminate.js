import * as state from '../state/renderVertexTransformBridgeState.js';

export function disposeRenderWorkerTerminate() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
    state.workerAvailable = false;
  }
}
