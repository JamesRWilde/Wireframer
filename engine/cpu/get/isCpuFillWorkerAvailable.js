import * as state from '../state/cpuFillRenderBridgeState.js';

export function isCpuFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
