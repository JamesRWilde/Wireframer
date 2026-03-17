import * as statefrom "@engine/state/render/background/worker.js";

export function fillCachedFrame() {
  return state.cachedImageBitmap ? { imageBitmap: state.cachedImageBitmap, frameId: state.cachedFrameId } : null;
}
