/**
 * frame.js - Main Animation Frame Entry Point
 * 
 * PURPOSE:
 *   Provides the SetEngineFrame() function that serves as the callback for requestAnimationFrame.
 *   This is the heartbeat of the application - called by the browser ~60 times per second
 *   to drive the animation loop. It delegates actual work to runFrame() while handling
 *   frame timing and loop continuation.
 * 
 * ARCHITECTURE ROLE:
 *   This is the outermost layer of the animation loop. It's called by requestAnimationFrame,
 *   schedules the next frame, then delegates to runFrame() for the actual work. This
 *   separation allows runFrame to be called independently (e.g., for single-step debugging).
 * 
 * FRAME LOOP FLOW:
 *   1. Browser calls SetEngineFrame(timestamp)
 *   2. SetEngineFrame() schedules next frame via requestAnimationFrame(frame)
 *   3. SetEngineFrame() calls runFrame(nowMs) to do actual work
 *   4. runFrame() updates physics, renders, updates telemetry
 *   5. Browser calls SetEngineFrame() again ~16ms later
 */

"use strict";

// Import the runFrame function that performs the actual per-frame work
// This includes physics updates, rendering, and telemetry updates
import { runFrame } from './run.js';

// Initialize shared frame state flags on first load
// These track whether GPU or CPU rendering was used last frame, which affects
// canvas clearing and compositing decisions in subsequent frames
if (!globalThis.FRAME_LOOP_STATE) {
  globalThis.FRAME_LOOP_STATE = {
    gpuSceneDrawnLastFrame: false,        // Was GPU path used last frame?
    cpuForegroundDrawnOnMainCanvas: false // Is CPU foreground currently on main canvas?
  };
}

// Track the timestamp of the previous frame for interval calculation
// Used for debug logging of rAF timing (helps diagnose jank)
let __lastRafMs = 0;

/**
 * frame - The main animation loop callback
 * 
 * @param {number} [nowMs=0] - High-resolution timestamp from requestAnimationFrame
 *   This is a DOMHighResTimeStamp representing the current time in milliseconds
 *   since page load. Provided automatically by the browser.
 * 
 * @returns {*} The return value of runFrame (typically undefined)
 * 
 * This function is designed to be passed directly to requestAnimationFrame:
 *   requestAnimationFrame(frame);
 * 
 * The browser will call this ~60 times per second (or matching display refresh rate).
 */
export function animationFrame(nowMs = 0) {
  // Debug logging: measure time between consecutive frames
  // This helps diagnose jank (dropped frames) during development
  // Only logs when DEBUG_RAF global is set to avoid performance overhead
  if (__lastRafMs) {
    const diff = nowMs - __lastRafMs;
    if (globalThis.DEBUG_RAF) console.log('[frame] rAF interval', diff.toFixed(2));
  }
  
  // Store current timestamp for next frame's interval calculation
  __lastRafMs = nowMs;
  
  // Schedule the NEXT frame immediately, before doing any work
  // This ensures the browser can optimize scheduling and we don't miss frames
  // if runFrame takes longer than expected
  requestAnimationFrame(frame);
  
  // Delegate actual work to runFrame
  // This separation allows runFrame to be called independently for debugging
  return runFrame(nowMs);
}
