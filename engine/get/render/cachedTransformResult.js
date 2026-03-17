import * as state from '../state/renderEngineVertexTransformBridge.js';

export function cachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
