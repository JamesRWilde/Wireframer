import { state }from "@engine/state/engine/loop.js";
import { averageTime }from '@engine/get/engine/frame/averageTime.js';
import { determineTarget }from '@engine/get/engine/quality/determineTarget.js';
import { qualityApplyChange }from '@engine/set/engine/qualityApplyChange.js';

export function budget() {
  const avgFrameTime = averageTime();
  if (avgFrameTime === 0) return state.currentQuality;

  const targetQuality = determineTarget(avgFrameTime);
  if (targetQuality === null) {
    state.upgradeCounter = 0;
    state.downgradeCounter = 0;
  } else {
    qualityApplyChange(targetQuality, avgFrameTime);
  }

  return state.currentQuality;
}
