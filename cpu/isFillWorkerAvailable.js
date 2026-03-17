import * as state from './fillRenderBridgeState.js';

export function isFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
