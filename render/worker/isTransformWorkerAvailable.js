import * as state from './vertexTransformBridgeState.js';

export function isTransformWorkerAvailable() {
  return state.workerAvailable;
}
