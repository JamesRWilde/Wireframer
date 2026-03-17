import * as state from '../state/renderEngineVertexTransformBridge.js';

export function isAvailable() {
  return state.workerAvailable;
}
