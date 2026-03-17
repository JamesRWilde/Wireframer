import * as state from '../state/cpuEngineFillRenderBridge.js';

export function cpuEngineIsFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
