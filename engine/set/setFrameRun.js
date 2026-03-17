/**
 * runFrame.js - Single Frame Execution Logic
 * 
 * PURPOSE:
 *   Executes all per-frame operations: physics updates, scene rendering, and
 *   telemetry collection. This is the workhorse function called by frame()
 *   each animation frame. It orchestrates the entire frame pipeline.
 * 
 * ARCHITECTURE ROLE:
 *   Called by frame() which handles requestAnimationFrame scheduling.
 *   setFrameRun() focuses purely on the work to be done each frame, making
 *   it testable independently of the animation loop.
 * 
 * FRAME PIPELINE:
 *   1. Check if frame should run (FPS limiting)
 *   2. Update rotation physics
 *   3. Check frame budget and adjust quality
 *   4. Render scene (background + foreground)
 *   5. Collect and update telemetry
 *   6. Update the telemetry HUD display
 */

"use strict";

// Import loop state for frame tracking and timing
import { state } from '../state/loopState.js';

// Import physics update function - handles rotation and input
import { setPhysics } from './setPhysics.js';

// Import scene renderer - draws background and foreground
import { renderScene } from '../render/set/setRenderScene.js';

// Import telemetry HUD updater - displays stats in the UI
import { setTelemetryHud } from './setTelemetryHud.js';

// Import frame throttling check - skips frames if running too fast
import { shouldRunFrame } from '../get/getShouldRunFrame.js';

// Import telemetry collector - smooths and stores timing metrics
import { setTelemetry } from './setTelemetry.js';

// Import frame budget manager for adaptive quality
import { setFrameTime } from './setFrameTime.js';
import { getFrameBudget } from '../get/getFrameBudget.js';

/**
 * runFrame - Executes all operations for a single animation frame
 * 
 * @param {number} [nowMs=0] - Current timestamp from requestAnimationFrame
 *   Used for timing calculations and animation interpolation
 * 
 * This function is the core of the animation loop. It:
 * 1. Checks if this frame should be skipped (FPS limiting)
 * 2. Updates physics (rotation, input handling)
 * 3. Checks frame budget and adjusts rendering quality
 * 4. Renders the scene (background particles + 3D model)
 * 5. Collects performance metrics
 * 6. Updates the telemetry HUD display
 */
export function setFrameRun(nowMs = 0) {
  // Record frame start time for performance measurement
  const frameStartMs = performance.now();

  // Check if this frame should be skipped due to FPS limiting
  // Returns frame interval in ms, or null if frame should be skipped
  const frameIntervalMs = shouldRunFrame(nowMs);
  if (frameIntervalMs === null) return;
  
  // Update frame timing state
  // lastPresentedFrameMs tracks when frames are actually rendered (not skipped)
  // lastFrameMs tracks the most recent frame attempt
  state.lastPresentedFrameMs = nowMs;
  state.lastFrameMs = nowMs;
  
  // Increment frame counter
  // Used for throttled operations (e.g., telemetry updates every N frames)
  state.RENDER_FRAME_ID++;

  // Step 1: Update rotation physics
  // This handles auto-rotation, angular velocity decay, and input integration
  // Returns the time spent on physics for telemetry
  const physMs = setPhysics();

  // Step 2: Check frame budget and adjust quality level
  // This tracks rolling average frame time and adjusts rendering quality
  // to maintain target FPS when the system is under load
  getFrameBudget();
  
  // Step 3: Render the scene (background + foreground)
  // Returns timing metrics and rendering state
  // Note: we used to guard against zero opacity values here, but that forced
  // sliders to jump back to opaque when dragged to 0. The sliders now
  // initialize correctly in startApp, so we allow genuine transparency.
  const { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas } = renderScene(nowMs);

  // Calculate total frame time
  const frameMs = performance.now() - frameStartMs;

  // Step 4: Update frame budget tracking with this frame's time
  setFrameTime(frameMs);

  // Step 5: Update telemetry with timing metrics
  // This smooths values using EMA and stores them for HUD display
  setTelemetry(nowMs, frameMs, physMs, bgMs, fgMs, frameIntervalMs);
  
  // Step 6: Update the telemetry HUD display
  // This is throttled to avoid expensive DOM updates every frame
  setTelemetryHud(nowMs);
  
  // Update frame loop state for next frame's canvas management
  // This tracks whether CPU foreground is on the main canvas, which affects
  // clearing and compositing decisions in subsequent frames
  globalThis.FRAME_LOOP_STATE.cpuForegroundDrawnOnMainCanvas = drewCpuForeground && backgroundOnSeparateCanvas;
}
