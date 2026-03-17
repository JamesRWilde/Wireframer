import * as state from '../state/cpuEngineFillRenderBridge.js';

export function cpuEngineFillSendRenderCommand(renderData, frameId) {
  if (!state.worker || !state.workerReady) return;
  state.worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}
