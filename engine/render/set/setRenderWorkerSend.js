import * as state from '../state/renderVertexTransformBridgeState.js';
import { initRenderWorkerInitTransform } from '../init/initRenderWorkerInitTransform.js';

export function setRenderWorkerSend(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  if (!state.workerAvailable && !initRenderWorkerInitTransform()) return;
  state.pendingFrameId = frameId;
  state.worker.postMessage({
    type: 'transform',
    vertices, rotation, fov, halfW, halfH, modelCy, frameId
  });
}
