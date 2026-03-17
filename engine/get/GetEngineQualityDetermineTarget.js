import * as state from '../set/SetEngineFrameBudgetState.js';

export function GetEngineQualityDetermineTarget(avgFrameTime) {
  if (avgFrameTime > state.BUDGET_LOW) return 'low';
  if (avgFrameTime > state.BUDGET_MEDIUM) return 'medium';
  if (avgFrameTime < state.BUDGET_HIGH) return 'high';
  return null;
}
