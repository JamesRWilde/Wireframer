import * as state from '../worker/vertexTransformBridgeState.js';

export function getCachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
