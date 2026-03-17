import * as state from '../state/cpuEngineFillRenderBridge.js';

export function isFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
