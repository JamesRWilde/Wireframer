import { transformState } from "@engine/state/render/vertexTransformBridge.js";

export function cachedTransformResult() {
  return transformState.cachedResult ? { ...transformState.cachedResult, frameId: transformState.cachedFrameId } : null;
}
