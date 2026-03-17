import * as state from '../set/engineFrameBudgetState.js';

export function engineQualityDetermineTarget(avgFrameTime) {
  if (avgFrameTime > state.BUDGET_LOW) return 'low';
  if (avgFrameTime > state.BUDGET_MEDIUM) return 'medium';
  if (avgFrameTime < state.BUDGET_HIGH) return 'high';
  return null;
}
