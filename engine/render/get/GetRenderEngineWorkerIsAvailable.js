import * as state from '../state/StateRenderEngineVertexTransformBridge.js';

export function GetRenderEngineWorkerIsAvailable() {
  return state.workerAvailable;
}
