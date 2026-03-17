import { budgetState, DOWNGRADE_THRESHOLD, UPGRADE_THRESHOLD } from "@engine/set/engine/frame/budgetState.js";
import { priority }from '@engine/get/engine/quality/priority.js';

export function qualityApplyChange(targetQuality, avgFrameTime) {
  const isDowngrade = priority(targetQuality) < priority(budgetState.currentQuality);
  const isUpgrade = priority(targetQuality) > priority(budgetState.currentQuality);

  if (isDowngrade) {
    budgetState.downgradeCounter++;
    budgetState.upgradeCounter = 0;
    if (budgetState.downgradeCounter >= DOWNGRADE_THRESHOLD) {
      budgetState.currentQuality = targetQuality;
      budgetState.downgradeCounter = 0;
      if (globalThis.DEBUG_BUDGET) {
        console.log('[frameBudget] Downgraded to', targetQuality.toUpperCase(), 'quality (avg:', avgFrameTime.toFixed(2), 'ms)');
      }
    }
  } else if (isUpgrade) {
    budgetState.upgradeCounter++;
    budgetState.downgradeCounter = 0;
    if (budgetState.upgradeCounter >= UPGRADE_THRESHOLD) {
      budgetState.currentQuality = targetQuality;
      budgetState.upgradeCounter = 0;
      if (globalThis.DEBUG_BUDGET) {
        console.log('[frameBudget] Upgraded to', targetQuality.toUpperCase(), 'quality (avg:', avgFrameTime.toFixed(2), 'ms)');
      }
    }
  } else {
    budgetState.upgradeCounter = 0;
    budgetState.downgradeCounter = 0;
  }
}
