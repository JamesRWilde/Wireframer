import * as state from '../state/stateCpuEngineFillRenderBridge.js';

export function getCpuEngineFillCachedFrame() {
  return state.cachedImageBitmap ? { imageBitmap: state.cachedImageBitmap, frameId: state.cachedFrameId } : null;
}
