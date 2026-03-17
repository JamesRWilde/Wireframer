import * as state from '../state/renderVertexTransformBridgeState.js';

export function getRenderWorkerIsAvailable() {
  return state.workerAvailable;
}
