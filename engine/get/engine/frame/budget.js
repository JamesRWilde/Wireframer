/**
 * budget.js - Frame Budget Evaluator
 *
 * PURPOSE:
 *   Evaluates the current frame time budget by computing the average
 *   frame time, determining if a quality change is needed, and applying
 *   hysteresis-guarded quality adjustments.
 *
 * ARCHITECTURE ROLE:
 *   Called each frame (or periodically) by the render loop to adapt
 *   rendering quality based on performance. Returns the current quality
 *   level after evaluation.
 *
 * FLOW:
 *   1. Compute average frame time from circular buffer
 *   2. Determine target quality based on budget thresholds
 *   3. Apply change with hysteresis if needed
 *   4. Return current quality level
 */

"use strict";

// Import budget state for accessing current quality
import { budgetState } from "@engine/set/engine/frame/budgetState.js";

// Import average frame time calculator
import { averageTime }from '@engine/get/engine/frame/averageTime.js';

// Import target quality determiner
import { determineTarget }from '@engine/get/engine/quality/determineTarget.js';

// Import quality change applier with hysteresis
import { qualityApplyChange }from '@engine/set/engine/qualityApplyChange.js';

/**
 * budget - Evaluates frame budget and adjusts quality level
 *
 * @returns {string} The current quality level ('high', 'medium', 'low')
 */
export function budget() {
  // Compute average frame time from recorded data
  const avgFrameTime = averageTime();

  // Return current quality if no data is available yet
  if (avgFrameTime === 0) return budgetState.currentQuality;

  // Determine the target quality based on average frame time
  const targetQuality = determineTarget(avgFrameTime);

  if (targetQuality === null) {
    // Frame time is within acceptable range, reset hysteresis counters
    budgetState.upgradeCounter = 0;
    budgetState.downgradeCounter = 0;
  } else {
    // Apply quality change with hysteresis (may not commit immediately)
    qualityApplyChange(targetQuality, avgFrameTime);
  }

  return budgetState.currentQuality;
}
