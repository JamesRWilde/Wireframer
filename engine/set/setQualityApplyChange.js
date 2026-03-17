import * as state from '../set/frameBudgetState.js';
import { getQualityPriority } from '../get/getQualityPriority.js';

export function setQualityApplyChange(targetQuality, avgFrameTime) {
  const isDowngrade = getQualityPriority(targetQuality) < getQualityPriority(state.currentQuality);
  const isUpgrade = getQualityPriority(targetQuality) > getQualityPriority(state.currentQuality);

  if (isDowngrade) {
    state.downgradeCounter++;
    state.upgradeCounter = 0;
    if (state.downgradeCounter >= state.DOWNGRADE_THRESHOLD) {
      state.currentQuality = targetQuality;
      state.downgradeCounter = 0;
      if (globalThis.DEBUG_BUDGET) {
        console.log('[frameBudget] Downgraded to', targetQuality.toUpperCase(), 'quality (avg:', avgFrameTime.toFixed(2), 'ms)');
      }
    }
  } else if (isUpgrade) {
    state.upgradeCounter++;
    state.downgradeCounter = 0;
    if (state.upgradeCounter >= state.UPGRADE_THRESHOLD) {
      state.currentQuality = targetQuality;
      state.upgradeCounter = 0;
      if (globalThis.DEBUG_BUDGET) {
        console.log('[frameBudget] Upgraded to', targetQuality.toUpperCase(), 'quality (avg:', avgFrameTime.toFixed(2), 'ms)');
      }
    }
  } else {
    state.upgradeCounter = 0;
    state.downgradeCounter = 0;
  }
}
