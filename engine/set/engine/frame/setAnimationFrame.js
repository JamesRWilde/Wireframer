/**
 * frame.js - Main Animation Frame Entry Point
 * 
 * PURPOSE:
 *   Provides the animationFrame() function that serves as the callback for requestAnimationFrame.
 *   This is the heartbeat of the application - called by the browser ~60 times per second
 *   to drive the animation loop. It delegates actual work to setRunFrame() while handling
 *   frame timing and loop continuation.
 * 
 * ARCHITECTURE ROLE:
 *   This is the outermost layer of the animation loop. It's called by requestAnimationFrame,
 *   schedules the next frame, then delegates to setRunFrame() for the actual work. This
 *   separation allows setRunFrame to be called independently (e.g., for single-step debugging).
 *
 * WHY THIS EXISTS:
 *   Provides a lightweight wrapper around requestAnimationFrame so the frame loop can be
 *   controlled and tested independently from the request scheduling behavior.
 * 
 * FRAME LOOP FLOW:
 *   1. Browser calls animationFrame(timestamp)
 *   2. animationFrame() schedules next frame via requestAnimationFrame(frame)
 *   3. animationFrame() calls setRunFrame(nowMs) to do actual work
 *   4. setRunFrame() updates physics, renders, updates telemetry
 *   5. Browser calls animationFrame() again ~16ms later
 */

"use strict";

// Import the frame executor — performs physics, render, and telemetry per frame
import {setRunFrame}from '@engine/set/engine/setRunFrame.js';

// Frame state flags (gpuSceneDrawnLastFrame, cpuForegroundDrawnOnMainCanvas)
// are now on the shared loop state object imported from engine/state/loop.js

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
 * @returns {*} The return value of setRunFrame (typically undefined)
 * 
 * This function is designed to be passed directly to requestAnimationFrame:
 *   requestAnimationFrame(frame);
 * 
 * The browser will call this ~60 times per second (or matching display refresh rate).
 */
export function setAnimationFrame(nowMs = 0) { 
  // Store current timestamp for next frame's interval calculation
  __lastRafMs = nowMs;
  
  // Schedule the NEXT frame immediately, before doing any work
  // This ensures the browser can optimize scheduling and we don't miss frames
  // if setRunFrame takes longer than expected
  requestAnimationFrame(setAnimationFrame);
  
  // Delegate actual work to setRunFrame
  // This separation allows setRunFrame to be called independently for debugging
  return setRunFrame(nowMs);
}
