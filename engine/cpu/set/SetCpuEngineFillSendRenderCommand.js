import * as state from '../state/StateCpuEngineFillRenderBridge.js';

export function SetCpuEngineFillSendRenderCommand(renderData, frameId) {
  if (!state.worker || !state.workerReady) return;
  state.worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}
