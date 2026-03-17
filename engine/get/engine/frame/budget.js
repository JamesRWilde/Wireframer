import { budgetState } from "@engine/set/engine/frame/budgetState.js";
import { averageTime }from '@engine/get/engine/frame/averageTime.js';
import { determineTarget }from '@engine/get/engine/quality/determineTarget.js';
import { qualityApplyChange }from '@engine/set/engine/qualityApplyChange.js';

export function budget() {
  const avgFrameTime = averageTime();
  if (avgFrameTime === 0) return budgetState.currentQuality;

  const targetQuality = determineTarget(avgFrameTime);
  if (targetQuality === null) {
    budgetState.upgradeCounter = 0;
    budgetState.downgradeCounter = 0;
  } else {
    qualityApplyChange(targetQuality, avgFrameTime);
  }

  return budgetState.currentQuality;
}
