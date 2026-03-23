/**
 * time.js - Frame Time Recording
 *
 * PURPOSE:
 *   Records the duration of a single frame into a circular buffer for
 *   later analysis by the frame budget system.
 *
 * ARCHITECTURE ROLE:
 *   Called at the end of each render frame by the main loop to track
 *   frame timing. The recorded times are consumed by averageTime.js
 *   and budget.js for quality level decisions.
 *
 * WHY THIS EXISTS:
 *   Isolates frame timing persistence so quality and budget calculations can
 *   remain stateless and purely analytical.
 *
 * DETAILS:
 *   Uses a circular buffer (Float32Array) to avoid allocation overhead.
 *   The index wraps around after WINDOW_SIZE entries.
 */

"use strict";

// Import budget state and window size constant for circular buffer management
import { budgetState, WINDOW_SIZE } from '@engine/set/engine/frame/setBudgetState.js';

/**
 * time - Records a frame duration in the circular buffer
 *
 * @param {number} frameMs - Frame duration in milliseconds
 * @returns {void}
 */
export function setFrameTime(frameMs) {
  // Write the frame time at the current index
  budgetState.frameTimes[budgetState.frameTimeIndex] = frameMs;

  // Advance the index, wrapping around at WINDOW_SIZE
  budgetState.frameTimeIndex = (budgetState.frameTimeIndex + 1) % WINDOW_SIZE;

  // Track how many entries have been recorded (capped at WINDOW_SIZE)
  if (budgetState.frameTimeCount < WINDOW_SIZE) budgetState.frameTimeCount++;
}
