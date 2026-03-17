import * as state from '../state/StateRenderEngineVertexTransformBridge.js';

export function GetRenderEngineCachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
