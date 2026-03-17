import * as state from '../state/stateCpuEngineFillRenderBridge.js';

export function getCpuEngineIsFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
