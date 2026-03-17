import * as state from ''../set/setEngineFrameBudgetState.js'';
import { getEngineFrameAverageTime } from ''./getEngineFrameAverageTime.js'';
import { getEngineQualityDetermineTarget } from ''../get/getEngineQualityDetermineTarget.js'';
import { setEngineQualityApplyChange } from ''../set/setEngineQualityApplyChange.js'';

export function getEngineFrameBudget() {
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
