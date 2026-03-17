import * as state from '../state/StateRenderEngineVertexTransformBridge.js';
import { InitRenderEngineWorkerTransform } from '../init/InitRenderEngineWorkerTransform.js';

export function SetRenderEngineWorkerSend(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  if (!state.workerAvailable && !InitRenderEngineWorkerTransform()) return;
  state.pendingFrameId = frameId;
  state.worker.postMessage({
    type: 'transform',
    vertices, rotation, fov, halfW, halfH, modelCy, frameId
  });
}
