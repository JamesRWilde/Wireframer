import * as state from ''../state/stateRenderEngineVertexTransformBridge.js'';

export function getRenderEngineCachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
