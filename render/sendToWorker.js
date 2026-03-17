import * as state from './vertexTransformBridgeState.js';
import { initTransformWorker } from './initTransformWorker.js';

export function sendToWorker(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  if (!state.workerAvailable && !initTransformWorker()) return;
  state.pendingFrameId = frameId;
  state.worker.postMessage({
    type: 'transform',
    vertices, rotation, fov, halfW, halfH, modelCy, frameId
  });
}
