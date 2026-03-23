/**
 * setRunFrame.js - Single Frame Execution Logic
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
 * WHY THIS EXISTS:
 *   The frame loop needs a single orchestrator that chains physics → budget →
 *   render → telemetry in the correct order. This function is that chain.
 *   Separating it from requestAnimationFrame scheduling makes it independently
 *   testable and allows the frame loop to focus on timing rather than work.
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
import { state }from '@engine/state/stateLoop.js';

// Import physics update function - handles rotation and input
import { setPhysics }from '@engine/set/engine/setPhysics.js';

// Import scene renderer - draws background and foreground
import {setScene}from '@engine/set/render/setScene.js';

// Import telemetry HUD updater - displays stats in the UI
import { setTelemetryHud }from '@engine/set/engine/telemetry/setTelemetryHud.js';

// Import frame throttling check - skips frames if running too fast
import { getShouldRunFrame }from '@engine/get/engine/getShouldRunFrame.js';

// Import telemetry collector - smooths and stores timing metrics
import { setTelemetryState }from '@engine/set/engine/telemetry/setTelemetryState.js';

// Import frame budget manager for adaptive quality
import { setFrameTime }from '@engine/set/engine/frame/setFrameTime.js';
import { getBudget }from '@engine/get/engine/getBudget.js';

// No debug overlay needed; render mode use by telemetry HUD is internal.

/**
 * setRunFrame - Executes all operations for a single animation frame
 * 
 * @param {number} [nowMs=0] - Current timestamp from requestAnimationFrame
 *   Used for timing calculations and animation interpolation
 */
export function setRunFrame(nowMs = 0) {
  // Record frame start time for performance measurement
  const frameStartMs = performance.now();



  // Check if this frame should be skipped due to FPS limiting
  // Returns frame interval in ms, or null if frame should be skipped
  const frameIntervalMs = getShouldRunFrame(nowMs);
  if (frameIntervalMs === null) {
    return;
  }

  // Update frame timing state
  state.lastPresentedFrameMs = nowMs;
  state.lastFrameMs = nowMs;

  // Increment frame counter
  state.RENDER_FRAME_ID++;

  // Step 1: Update rotation physics
  const physMs = setPhysics();

  // Step 2: Check frame budget and adjust quality level
  getBudget();

  // Step 3: Render the scene (background + foreground)
  const { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas } = setScene(nowMs);

  // Calculate total frame time
  const frameMs = performance.now() - frameStartMs;

  // Step 4: Update frame budget tracking with this frame's time
  setFrameTime(frameMs);

  // Step 5: Update telemetry with timing metrics
  setTelemetryState(nowMs, frameMs, physMs, bgMs, fgMs, frameIntervalMs);

  // Step 6: Update the telemetry HUD display
  setTelemetryHud(nowMs);


  // Update frame loop state for next frame's canvas management
  state.cpuForegroundDrawnOnMainCanvas = drewCpuForeground && backgroundOnSeparateCanvas;
}
