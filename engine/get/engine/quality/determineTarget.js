import { budgetState, BUDGET_LOW, BUDGET_MEDIUM, BUDGET_HIGH }from "@engine/set/engine/frame/budgetState.js";

export function determineTarget(avgFrameTime) {
  if (avgFrameTime > BUDGET_LOW) return 'low';
  if (avgFrameTime > BUDGET_MEDIUM) return 'medium';
  if (avgFrameTime < BUDGET_HIGH) return 'high';
  return null;
}
