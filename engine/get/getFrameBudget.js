import * as state from '../set/frameBudgetState.js';
import { getFrameAverageTime } from './getFrameAverageTime.js';
import { getQualityDetermineTarget } from '../get/getQualityDetermineTarget.js';
import { setQualityApplyChange } from '../set/setQualityApplyChange.js';

export function getFrameBudget() {
  const avgFrameTime = getFrameAverageTime();
  if (avgFrameTime === 0) return state.currentQuality;

  const targetQuality = getQualityDetermineTarget(avgFrameTime);
  if (targetQuality === null) {
    state.upgradeCounter = 0;
    state.downgradeCounter = 0;
  } else {
    setQualityApplyChange(targetQuality, avgFrameTime);
  }

  return state.currentQuality;
}
