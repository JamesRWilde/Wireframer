/**
 * qualityApplyChange.js - Adaptive Quality Level Changer
 *
 * PURPOSE:
 *   Applies a quality level change using hysteresis counters to prevent
 *   rapid oscillation between quality levels. Only commits a change after
 *   a sustained number of consecutive frames trending in one direction.
 *
 * ARCHITECTURE ROLE:
 *   Called by budget.js when the average frame time suggests a quality
 *   change is needed. Updates the budgetState.currentQuality level when
 *   hysteresis thresholds are met.
 *
 * HYSTERESIS:
 *   - Downgrades require DOWNGRADE_THRESHOLD (5) consecutive over-budget frames
 *   - Upgrades require UPGRADE_THRESHOLD (15) consecutive under-budget frames
 *   - This asymmetry prevents thrashing during borderline performance
 */

"use strict";

// Import budget state and hysteresis thresholds
import { budgetState, DOWNGRADE_THRESHOLD, UPGRADE_THRESHOLD } from "@engine/set/engine/frame/budgetState.js";

// Import quality priority comparison helper
import { priority }from '@engine/get/engine/priority.js';
/**
 * qualityApplyChange - Evaluates and applies a quality level change with hysteresis
 *
 * @param {string} targetQuality - The suggested target quality level ('high'|'medium'|'low')
 * @param {number} avgFrameTime - The current average frame time in ms (for debug logging)
 * @returns {void}
 */
export function qualityApplyChange(targetQuality, avgFrameTime) {
  // Determine if this is a downgrade or upgrade relative to current quality
  const isDowngrade = priority(targetQuality) < priority(budgetState.currentQuality);
  const isUpgrade = priority(targetQuality) > priority(budgetState.currentQuality);

  if (isDowngrade) {
    // Increment downgrade counter, reset upgrade counter
    budgetState.downgradeCounter++;
    budgetState.upgradeCounter = 0;

    // Commit downgrade if threshold is reached
    if (budgetState.downgradeCounter >= DOWNGRADE_THRESHOLD) {
      budgetState.currentQuality = targetQuality;
      budgetState.downgradeCounter = 0;
    }
  } else if (isUpgrade) {
    // Increment upgrade counter, reset downgrade counter
    budgetState.upgradeCounter++;
    budgetState.downgradeCounter = 0;

    // Commit upgrade if threshold is reached (requires more frames for safety)
    if (budgetState.upgradeCounter >= UPGRADE_THRESHOLD) {
      budgetState.currentQuality = targetQuality;
      budgetState.upgradeCounter = 0;
    }
  } else {
    // No change needed, reset both counters
    budgetState.upgradeCounter = 0;
    budgetState.downgradeCounter = 0;
  }
}
