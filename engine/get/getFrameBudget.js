import * as state from '../frame/frameBudgetState.js';
import { getAverageFrameTime } from './getFrameAverageTime.js';
import { determineTargetQuality } from '../quality/determineTargetQuality.js';
import { applyQualityChange } from '../quality/applyQualityChange.js';

export function getFrameBudget() {
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
