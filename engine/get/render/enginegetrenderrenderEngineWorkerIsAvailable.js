import * as state from '../state/renderEngineVertexTransformBridge.js';

export function renderEngineWorkerIsAvailable() {
  return state.workerAvailable;
}
