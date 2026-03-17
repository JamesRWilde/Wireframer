import * as state from '../state/stateRenderEngineVertexTransformBridge.js';
import { initRenderEngineWorkerTransform } from '../init/initRenderEngineWorkerTransform.js';

export function setRenderEngineWorkerSend(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  if (!state.workerAvailable && !InitRenderEngineWorkerTransform()) return;
  state.pendingFrameId = frameId;
  state.worker.postMessage({
    type: 'transform',
    vertices, rotation, fov, halfW, halfH, modelCy, frameId
  });
}
