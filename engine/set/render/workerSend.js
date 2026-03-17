import * as state from '../state/renderEngineVertexTransformBridge.js';
import { workerTransform } from '../init/workerTransform.js';

export function workerSend(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  if (!state.workerAvailable && !InitRenderEngineWorkerTransform()) return;
  state.pendingFrameId = frameId;
  state.worker.postMessage({
    type: 'transform',
    vertices, rotation, fov, halfW, halfH, modelCy, frameId
  });
}
