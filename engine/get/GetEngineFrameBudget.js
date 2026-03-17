import * as state from '../set/SetEngineFrameBudgetState.js';
import { GetEngineFrameAverageTime } from './GetEngineFrameAverageTime.js';
import { GetEngineQualityDetermineTarget } from '../get/GetEngineQualityDetermineTarget.js';
import { SetEngineQualityApplyChange } from '../set/SetEngineQualityApplyChange.js';

export function GetEngineFrameBudget() {
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
