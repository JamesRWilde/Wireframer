import * as state from '../set/engineFrameBudgetState.js';
import { averageTime } from './averageTime.js';
import { determineTarget } from '../get/determineTarget.js';
import { qualityApplyChange } from '../set/qualityApplyChange.js';

export function budget() {
  const avgFrameTime = GetEngineFrameAverageTime();
  if (avgFrameTime === 0) return state.currentQuality;

  const targetQuality = GetEngineQualityDetermineTarget(avgFrameTime);
  if (targetQuality === null) {
    state.upgradeCounter = 0;
    state.downgradeCounter = 0;
  } else {
    SetEngineQualityApplyChange(targetQuality, avgFrameTime);
  }

  return state.currentQuality;
}
