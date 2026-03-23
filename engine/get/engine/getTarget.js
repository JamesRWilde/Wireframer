/**
 * determineTarget.js - Target Quality Determiner
 *
 * PURPOSE:
 *   Determines the target quality level based on the current average
 *   frame time. Returns null if the frame time is within the high
 *   quality budget (no change needed).
 *
 * ARCHITECTURE ROLE:
 *   Called by budget.js to evaluate the performance state. Compares
 *   average frame time against budget thresholds to decide which
 *   quality level the engine should target.
 *
 * THRESHOLDS:
 *   - >24ms (BUDGET_LOW): target 'low'
 *   - >18ms (BUDGET_MEDIUM): target 'medium'
 *   - <14ms (BUDGET_HIGH): target 'high'
 *   - Otherwise: null (no change)
 */

"use strict";

// Import budget thresholds for quality level boundaries
import { budgetState, BUDGET_LOW, BUDGET_MEDIUM, BUDGET_HIGH }from "@engine/set/engine/frame/budgetState.js";

/**
 * determineTarget - Determines the target quality level from frame time
 *
 * @param {number} avgFrameTime - Current average frame time in milliseconds
 * @returns {string|null} Target quality level ('high'|'medium'|'low'), or null if no change needed
 */
export function getTarget(avgFrameTime) {
  // Check thresholds from most strict to least strict
  if (avgFrameTime > BUDGET_LOW) return 'low';      // Way over budget, downgrade to low
  if (avgFrameTime > BUDGET_MEDIUM) return 'medium'; // Over budget, downgrade to medium
  if (avgFrameTime < BUDGET_HIGH) return 'high';     // Well under budget, upgrade to high

  // Frame time is in the acceptable range between BUDGET_HIGH and BUDGET_MEDIUM
  return null;
}
