import * as state from '../fillRenderBridgeState.js';

export function isCpuFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
