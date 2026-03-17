import * as state from './fillRenderBridgeState.js';

export function resizeCanvas(width, height) {
  if (!state.worker || !state.workerReady) return;
  state.worker.postMessage({ type: 'resize', width, height });
}
