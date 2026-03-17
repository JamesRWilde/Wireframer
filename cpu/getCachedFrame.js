import * as state from './fillRenderBridgeState.js';

export function getCachedFrame() {
  return state.cachedImageBitmap ? { imageBitmap: state.cachedImageBitmap, frameId: state.cachedFrameId } : null;
}
