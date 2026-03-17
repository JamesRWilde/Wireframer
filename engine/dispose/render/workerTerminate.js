import { transformState } from "@engine/state/render/vertexTransformBridge.js";

export function workerTerminate() {
  if (transformState.worker) {
    transformState.worker.terminate();
    transformState.worker = null;
    transformState.workerAvailable = false;
  }
}
