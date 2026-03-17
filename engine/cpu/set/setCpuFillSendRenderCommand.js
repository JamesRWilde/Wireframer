import * as state from '../fillRenderBridgeState.js';

export function setCpuFillSendRenderCommand(renderData, frameId) {
  if (!state.worker || !state.workerReady) return;
  state.worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}
