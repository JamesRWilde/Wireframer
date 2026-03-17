import * as state from '../renderVertexTransformBridgeState.js';

export function getRenderWorkerIsAvailable() {
  return state.workerAvailable;
}
