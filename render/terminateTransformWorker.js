import * as state from './vertexTransformBridgeState.js';

export function terminateTransformWorker() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
    state.workerAvailable = false;
  }
}
