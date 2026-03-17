import * as state from './vertexTransformBridgeState.js';

export function getCachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
