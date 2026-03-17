import * as state from './frameBudgetState.js';
import { getAverageFrameTime } from './getAverageFrameTime.js';
import { determineTargetQuality } from './determineTargetQuality.js';
import { applyQualityChange } from './applyQualityChange.js';

export function checkBudget() {
  const avgFrameTime = getAverageFrameTime();
  if (avgFrameTime === 0) return state.currentQuality;

  const targetQuality = determineTargetQuality(avgFrameTime);
  if (targetQuality === null) {
    state.upgradeCounter = 0;
    state.downgradeCounter = 0;
  } else {
    applyQualityChange(targetQuality, avgFrameTime);
  }

  return state.currentQuality;
}
