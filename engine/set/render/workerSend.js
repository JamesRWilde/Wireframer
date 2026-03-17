import { transformState } from "@engine/state/render/vertexTransformBridge.js";
import { workerTransform } from '@engine/init/render/workerTransform.js';

export function workerSend(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  if (!transformState.workerAvailable && !workerTransform()) return;
  transformState.pendingFrameId = frameId;
  transformState.worker.postMessage({
    type: 'transform',
    vertices, rotation, fov, halfW, halfH, modelCy, frameId
  });
}
