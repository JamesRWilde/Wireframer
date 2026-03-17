/**
 * telemetryState.js - Performance Telemetry Smoothing
 * 
 * PURPOSE:
 *   Smooths performance timing metrics using Exponential Moving Average (EMA).
 *   This reduces jitter in the stats display while remaining responsive to
 *   actual performance changes.
 * 
 * ARCHITECTURE ROLE:
 *   Called by runFrame() each frame with timing measurements. Updates the
 *   smoothed EMA values in StateEngineLoop that are read by hud().
 * 
 * EMA FORMULA:
 *   newValue = alpha * currentSample + (1 - alpha) * previousEMA
 *   
 *   Where alpha (TELEMETRY_ALPHA = 0.2) controls smoothing:
 *   - Higher alpha = more responsive but jittery
 *   - Lower alpha = smoother but slower to react
 * 
 * METRICS TRACKED:
 *   - emaFrameMs: Total frame time
 *   - emaFpsFrameIntervalMs: Time between frames (for FPS calculation)
 *   - emaPhysMs: Physics update time
 *   - emaBgMs: Background render time
 *   - emaFgMs: Foreground render time
 */

"use strict";

// Import loop state and smoothing constant
import { state, TELEMETRY_ALPHA }from '@engine/state/engine/loop.js';

/**
 * telemetryState - Updates smoothed performance metrics
 * 
 * @param {number} nowMs - Current timestamp (unused but kept for API consistency)
 * @param {number} frameMs - Total frame time in milliseconds
 * @param {number} physMs - Physics update time in milliseconds
 * @param {number} bgMs - Background render time in milliseconds
 * @param {number} fgMs - Foreground render time in milliseconds
 * @param {number} frameIntervalMs - Time since last frame (for FPS calculation)
 * 
 * On the first call (emaFrameMs === 0), values are initialized directly.
 * On subsequent calls, EMA smoothing is applied.
 */
export function telemetryState(nowMs, frameMs, physMs, bgMs, fgMs, frameIntervalMs) {
  // Check if this is the first telemetry update (EMA values are zero)
  if (state.emaFrameMs === 0) {
    // First frame: initialize EMA values directly (no smoothing)
    state.emaFrameMs = frameMs;
    
    // Initialize FPS interval with fallback logic
    // If we have a valid frame interval, use it
    // Otherwise fall back to TELEMETRY_ALPHA or 16.67ms (60fps)
    let initialFps;
    if (frameIntervalMs > 0) {
      initialFps = frameIntervalMs;
    } else if (typeof TELEMETRY_ALPHA === 'number' && TELEMETRY_ALPHA > 0) {
      initialFps = TELEMETRY_ALPHA; // fallback usage
    } else {
      initialFps = 16.67; // assume 60fps as default
    }
    state.emaFpsFrameIntervalMs = initialFps;
    
    // Initialize other metrics directly
    state.emaPhysMs = physMs;
    state.emaBgMs = bgMs;
    state.emaFgMs = fgMs;
  } else {
    // Subsequent frames: apply EMA smoothing
    // EMA formula: newValue = alpha * sample + (1 - alpha) * previous
    const a = TELEMETRY_ALPHA;
    
    // Smooth total frame time
    state.emaFrameMs = state.emaFrameMs + (frameMs - state.emaFrameMs) * a;
    
    // Smooth FPS interval (only if we have a valid interval)
    if (frameIntervalMs > 0) state.emaFpsFrameIntervalMs = state.emaFpsFrameIntervalMs + (frameIntervalMs - state.emaFpsFrameIntervalMs) * a;
    
    // Smooth physics time
    state.emaPhysMs = state.emaPhysMs + (physMs - state.emaPhysMs) * a;
    
    // Smooth background render time
    state.emaBgMs = state.emaBgMs + (bgMs - state.emaBgMs) * a;
    
    // Smooth foreground render time
    state.emaFgMs = state.emaFgMs + (fgMs - state.emaFgMs) * a;
  }
}
