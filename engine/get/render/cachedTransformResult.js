import * as statefrom "@engine/state/render/background/worker.js";

export function cachedTransformResult() {
  return state.cachedResult ? { ...state.cachedResult, frameId: state.cachedFrameId } : null;
}
