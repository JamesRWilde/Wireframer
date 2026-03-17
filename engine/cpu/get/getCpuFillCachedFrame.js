import * as state from '../state/cpuFillRenderBridgeState.js';

export function getCpuFillCachedFrame() {
  return state.cachedImageBitmap ? { imageBitmap: state.cachedImageBitmap, frameId: state.cachedFrameId } : null;
}
