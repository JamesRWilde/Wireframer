import * as state from '../state/renderEngineVertexTransformBridge.js';

export function renderEngineCachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
