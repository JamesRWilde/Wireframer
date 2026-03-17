import * as state from ''../set/setEngineFrameBudgetState.js'';

export function getEngineQualityDetermineTarget(avgFrameTime) {
  if (avgFrameTime > state.BUDGET_LOW) return 'low';
  if (avgFrameTime > state.BUDGET_MEDIUM) return 'medium';
  if (avgFrameTime < state.BUDGET_HIGH) return 'high';
  return null;
}
