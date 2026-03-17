import * as state from '../fillRenderBridgeState.js';

export function getCpuFillCachedFrame() {
  return state.cachedImageBitmap ? { imageBitmap: state.cachedImageBitmap, frameId: state.cachedFrameId } : null;
}
