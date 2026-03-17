/**
 * shouldRunFrame.js - Frame Rate Throttling
 * 
 * PURPOSE:
 *   Determines whether the current frame should be executed or skipped based on
 *   the configured maximum frame rate. This implements frame rate limiting to
 *   reduce CPU/GPU usage when the display refresh rate exceeds the desired rate.
 * 
 * ARCHITECTURE ROLE:
 *   Called at the start of runFrame() to decide whether to proceed with rendering
 *   or return early. When MAX_FPS is 0 (uncapped), all frames run.
 * 
 * HOW IT WORKS:
 *   Compares the time since the last frame against MIN_FRAME_INTERVAL_MS.
 *   If insufficient time has passed, returns null to signal "skip this frame".
 *   Otherwise, returns the frame interval for FPS calculation.
 */

"use strict";

// Import loop state and frame interval constant
import { state, MIN_FRAME_INTERVAL_MS } from '../loopState.js';

/**
 * shouldRunFrame - Checks if the current frame should run or be skipped
 * 
 * @param {number} nowMs - Current timestamp from requestAnimationFrame
 * 
 * @returns {number|null} 
 *   - number: Frame interval in ms (time since last presented frame)
 *   - null: Frame should be skipped (running too fast)
 * 
 * When MAX_FPS is 0 (uncapped), this always returns a number (never null).
 * When MAX_FPS is set, frames are skipped if they arrive too quickly.
 */
export function getShouldRunFrame(nowMs) {
  // Check if frame rate limiting is enabled (MIN_FRAME_INTERVAL_MS > 0)
  // AND we have a valid last frame timestamp (state.lastFrameMs >= 0)
  // AND insufficient time has passed since the last frame
  if (MIN_FRAME_INTERVAL_MS > 0 && state.lastFrameMs >= 0 && nowMs - state.lastFrameMs < MIN_FRAME_INTERVAL_MS) {
    // Skip this frame - running faster than the configured max FPS
    return null;
  }
  
  // Calculate frame interval for FPS measurement
  // If we have a previous presented frame, return the interval
  // Otherwise return 0 (first frame)
  return state.lastPresentedFrameMs >= 0 ? (nowMs - state.lastPresentedFrameMs) : 0;
}
