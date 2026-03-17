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
 *   SetEngineFrameRun() focuses purely on the work to be done each frame, making
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
import { state }from '@ui/get/read/state.js';

// Import physics update function - handles rotation and input
import { physics }from '@engine/set/engine/physics.js';

// Import scene renderer - draws background and foreground
import {scene}from '@engine/set/render/scene.js';

// Import telemetry HUD updater - displays stats in the UI
import { hud }from '@engine/set/engine/renderer/hud.js';

// Import frame throttling check - skips frames if running too fast
import { shouldRunFrame }from '@engine/get/engine/shouldRunFrame.js';

// Import telemetry collector - smooths and stores timing metrics
import { telemetryState }from '@engine/set/engine/telemetry/telemetryState.js';

// Import frame budget manager for adaptive quality
import { time }from '@engine/set/engine/frame/time.js';
import { budget }from '@engine/get/engine/frame/budget.js';

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
export function run(nowMs = 0) {
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
  const physMs = SetEnginePhysics();

  // Step 2: Check frame budget and adjust quality level
  // This tracks rolling average frame time and adjusts rendering quality
  // to maintain target FPS when the system is under load
  GetEngineFrameBudget();
  
  // Step 3: Render the scene (background + foreground)
  // Returns timing metrics and rendering state
  // Note: we used to guard against zero opacity values here, but that forced
  // sliders to jump back to opaque when dragged to 0. The sliders now
  // initialize correctly in startApp, so we allow genuine transparency.
  const { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas } = renderScene(nowMs);

  // Calculate total frame time
  const frameMs = performance.now() - frameStartMs;

  // Step 4: Update frame budget tracking with this frame's time
  SetEngineFrameTime(frameMs);

  // Step 5: Update telemetry with timing metrics
  // This smooths values using EMA and stores them for HUD display
  SetEngineTelemetry(nowMs, frameMs, physMs, bgMs, fgMs, frameIntervalMs);
  
  // Step 6: Update the telemetry HUD display
  // This is throttled to avoid expensive DOM updates every frame
  SetEngineTelemetryHud(nowMs);
  
  // Update frame loop state for next frame's canvas management
  // This tracks whether CPU foreground is on the main canvas, which affects
  // clearing and compositing decisions in subsequent frames
  globalThis.FRAME_LOOP_STATE.cpuForegroundDrawnOnMainCanvas = drewCpuForeground && backgroundOnSeparateCanvas;
}
