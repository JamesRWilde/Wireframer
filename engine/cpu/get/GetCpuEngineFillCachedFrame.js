import * as state from '../state/StateCpuEngineFillRenderBridge.js';

export function GetCpuEngineFillCachedFrame() {
  return state.cachedImageBitmap ? { imageBitmap: state.cachedImageBitmap, frameId: state.cachedFrameId } : null;
}
