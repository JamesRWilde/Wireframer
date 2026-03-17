import { transformState } from "@engine/state/render/vertexTransformBridge.js";

export function isAvailable() {
  return transformState.workerAvailable;
}
