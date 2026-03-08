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
 *   run() focuses purely on the work to be done each frame, making
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
import { state }from '@engine/state/loop.js';

// Import physics update function - handles rotation and input
import { physics }from '@engine/set/engine/physics.js';

// Import scene renderer - draws background and foreground
import {scene}from '@engine/set/render/scene.js';

// Import telemetry HUD updater - displays stats in the UI
import { hud }from '@engine/set/engine/telemetry/hud.js';

// Import frame throttling check - skips frames if running too fast
import { shouldRunFrame }from '@engine/get/engine/shouldRunFrame.js';

// Import telemetry collector - smooths and stores timing metrics
import { telemetryState }from '@engine/set/engine/telemetry/telemetryState.js';

// Import frame budget manager for adaptive quality
import { time }from '@engine/set/engine/frame/time.js';
import { budget }from '@engine/get/engine/budget.js';

// No debug overlay needed; render mode use by telemetry HUD is internal.

/**
 * runFrame - Executes all operations for a single animation frame
 * 
 * @param {number} [nowMs=0] - Current timestamp from requestAnimationFrame
 *   Used for timing calculations and animation interpolation
 */
export function run(nowMs = 0) {
  // Record frame start time for performance measurement
  const frameStartMs = performance.now();



  // Check if this frame should be skipped due to FPS limiting
  // Returns frame interval in ms, or null if frame should be skipped
  const frameIntervalMs = shouldRunFrame(nowMs);
  if (frameIntervalMs === null) {
    return;
  }

  // Update frame timing state
  state.lastPresentedFrameMs = nowMs;
  state.lastFrameMs = nowMs;

  // Increment frame counter
  state.RENDER_FRAME_ID++;

  // Step 1: Update rotation physics
  const physMs = physics();

  // Step 2: Check frame budget and adjust quality level
  budget();

  // Step 3: Render the scene (background + foreground)
  const { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas } = scene(nowMs);

  // Calculate total frame time
  const frameMs = performance.now() - frameStartMs;

  // Step 4: Update frame budget tracking with this frame's time
  time(frameMs);

  // Step 5: Update telemetry with timing metrics
  telemetryState(nowMs, frameMs, physMs, bgMs, fgMs, frameIntervalMs);

  // Step 6: Update the telemetry HUD display
  hud(nowMs);


  // Update frame loop state for next frame's canvas management
  state.cpuForegroundDrawnOnMainCanvas = drewCpuForeground && backgroundOnSeparateCanvas;
}
