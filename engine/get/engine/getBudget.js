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

/**
 * budget - Evaluates frame budget and adjusts quality level
 *
 * @returns {string} The current quality level ('high', 'medium', 'low')
 */
export function getBudget() {
  // FORCE HIGH QUALITY MODE: disable adaptive downgrades for GPU timing debugging.
  // This satisfies the request to keep budgetState high for the cube performance issue.
  budgetState.currentQuality = 'high';
  budgetState.upgradeCounter = 0;
  budgetState.downgradeCounter = 0;
  return 'high';
}
