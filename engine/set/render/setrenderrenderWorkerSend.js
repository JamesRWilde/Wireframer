import * as state from '../state/renderEngineVertexTransformBridge.js';
import { renderEngineWorkerTransform } from '../init/renderEngineWorkerTransform.js';

export function renderEngineWorkerSend(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  if (!state.workerAvailable && !InitRenderEngineWorkerTransform()) return;
  state.pendingFrameId = frameId;
  state.worker.postMessage({
    type: 'transform',
    vertices, rotation, fov, halfW, halfH, modelCy, frameId
  });
}
