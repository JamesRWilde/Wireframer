import { fillState } from "@engine/state/cpu/fillRenderBridge.js";

export function fillCachedFrame() {
  return fillState.cachedImageBitmap ? { imageBitmap: fillState.cachedImageBitmap, frameId: fillState.cachedFrameId } : null;
}
