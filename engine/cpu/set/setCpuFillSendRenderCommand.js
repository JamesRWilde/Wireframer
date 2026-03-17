import * as state from '../state/cpuFillRenderBridgeState.js';

export function setCpuFillSendRenderCommand(renderData, frameId) {
  if (!state.worker || !state.workerReady) return;
  state.worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}
