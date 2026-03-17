import * as state from '../state/renderVertexTransformBridgeState.js';

export function getRenderCachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
