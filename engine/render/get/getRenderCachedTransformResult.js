import * as state from '../renderVertexTransformBridgeState.js';

export function getRenderCachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
