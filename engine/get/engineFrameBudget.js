import * as state from '../set/engineFrameBudgetState.js';
import { engineFrameAverageTime } from './engineFrameAverageTime.js';
import { engineQualityDetermineTarget } from '../get/engineQualityDetermineTarget.js';
import { engineQualityApplyChange } from '../set/engineQualityApplyChange.js';

export function engineFrameBudget() {
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
