import * as state from ''../state/stateCpuEngineFillRenderBridge.js'';

export function setCpuEngineFillSendRenderCommand(renderData, frameId) {
  if (!state.worker || !state.workerReady) return;
  state.worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}
