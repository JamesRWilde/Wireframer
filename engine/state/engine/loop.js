/**
 * StateEngineLoop.js - Main Render Loop State Constants and Shared State
 * 
 * PURPOSE:
 *   Defines the shared state object and constants used by the main render loop.
 *   This is the single source of truth for loop timing, frame counting, render
 *   mode, and telemetry smoothing values.
 * 
 * ARCHITECTURE ROLE:
 *   Imported by multiple loop modules (frame.js, runFrame.js, SetEngineTelemetry.js, etc.)
 *   that need to read or update loop state. The state object is mutable while the
 *   export binding is const, following the project's pattern for shared mutable state.
 * 
 * WHY A SINGLE STATE OBJECT:
 *   Rather than exporting many individual variables, we use a single state object.
 *   This makes it clear that these values are related (they're all loop state),
 *   allows atomic updates (multiple properties in one assignment), and simplifies
 *   imports (one import instead of many).
 */

"use strict";

/**
 * state - Shared mutable state for the main render loop
 * 
 * This object is imported and mutated directly by loop modules.
 * Properties are initialized to sensible defaults and updated each frame.
 */
export const state = {
  // Frame ID counter - incremented each frame, used for debugging and throttling
  RENDER_FRAME_ID: 0,
  
  // Timestamp of the last frame's start (from requestAnimationFrame)
  // Used for delta time calculations and FPS measurement
  lastFrameMs: -1,
  
  // Timestamp of the last actually-presented frame
  // May differ from lastFrameMs if frames are dropped or throttled
  lastPresentedFrameMs: -1,
  
  // Total frame count since app start
  // Used for throttled operations (e.g., update telemetry every N frames)
  frameCount: 0,
  
  // Current foreground rendering mode: 'gpu', 'cpu', or 'unknown'
  // Determined at startup and updated if GPU rendering fails
  foregroundRenderMode: 'unknown',
  
  // Timestamp of the last telemetry UI update
  // Used to throttle DOM updates (expensive) to ~4 times per second
  telemetryLastUiMs: 0,
  
  // EMA (Exponential Moving Average) metrics for performance telemetry
  // These provide smoothed values that reduce jitter in the stats display
  // EMA formula: newValue = alpha * currentSample + (1 - alpha) * previousEMA
  emaFrameMs: 0,           // Total frame time (physics + bg + fg rendering)
  emaFpsFrameIntervalMs: 0, // Time between frames (for FPS calculation)
  emaPhysMs: 0,            // Physics update time (rotation, input)
  emaBgMs: 0,              // Background particle rendering time
  emaFgMs: 0,              // Foreground model rendering time
};

/**
 * MAX_FPS - Maximum frames per second (0 = uncapped)
 * 
 * When set to 0, the loop runs at the display's refresh rate (typically 60fps).
 * When set to a positive number, frames are throttled to this rate.
 * 
 * Currently set to 0 (uncapped) for maximum smoothness.
 */
export const MAX_FPS = 0;

/**
 * MIN_FRAME_INTERVAL_MS - Minimum time between frames in milliseconds
 * 
 * Calculated from MAX_FPS. When MAX_FPS is 0, this is also 0 (no throttling).
 * Used by shouldRunFrame() to skip frames when running too fast.
 */
export const MIN_FRAME_INTERVAL_MS = MAX_FPS > 0 ? (1000 / MAX_FPS) : 0;

/**
 * TELEMETRY_UI_INTERVAL_MS - Minimum time between telemetry DOM updates
 * 
 * Set to 250ms (4 updates per second). DOM updates are expensive and the stats
 * don't need to update every frame - 4 times per second is readable without
 * causing performance overhead.
 */
export const TELEMETRY_UI_INTERVAL_MS = 250;

/**
 * TELEMETRY_ALPHA - EMA smoothing factor for telemetry values
 * 
 * Range: 0-1. Higher values = more responsive but jittery.
 * Lower values = smoother but slower to react.
 * 0.2 provides a good balance between responsiveness and smoothness.
 */
export const TELEMETRY_ALPHA = 0.2;

// Note: Trivial setter functions were intentionally removed to follow the
// project's single-responsibility rule. Modules that need to update state
// should import `state` and write properties directly:
//   import { state }from '@ui/get/read/state.js';
//   state.frameCount++;
