/**
 * averageTime.js - Average Frame Time Calculator
 *
 * PURPOSE:
 *   Computes the arithmetic mean of all recorded frame times in the
 *   circular buffer. Used by the frame budget system to evaluate
 *   whether rendering quality should be adjusted.
 *
 * ARCHITECTURE ROLE:
 *   Called by budget.js to get the smoothed frame time average.
 *   Reads from the circular buffer maintained by time.js.
 */

"use strict";

// Import budget state to access the circular frame time buffer
import { budgetState } from '@engine/set/engine/frame/budgetState.js';

/**
 * averageTime - Computes the average frame time from the circular buffer
 *
 * @returns {number} The average frame time in milliseconds, or 0 if no data
 */
export function averageTime() {
  // Return 0 if no frame times have been recorded yet
  if (budgetState.frameTimeCount === 0) return 0;

  // Sum all recorded frame times
  let sum = 0;
  for (let i = 0; i < budgetState.frameTimeCount; i++) {
    sum += budgetState.frameTimes[i];
  }

  // Return the arithmetic mean
  return sum / budgetState.frameTimeCount;
}
