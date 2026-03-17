import { fillState } from "@engine/state/cpu/fillRenderBridge.js";

export function sendRenderCommand(renderData, frameId) {
  if (!fillState.worker || !fillState.workerReady) return;
  fillState.worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}
