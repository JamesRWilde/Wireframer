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
import { state }from '@engine/state/engine/loop.js';

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
import { budget }from '@engine/get/engine/frame/budget.js';

// Import debug overlay for sphere/centre visualisation
import {renderDebugOverlay}from '@engine/get/render/debugOverlay.js';
import {updateDebugOverlay}from '@engine/render/debugOverlay.js';

// Import render mode flag (for telemetry display)
import { isGpuMode } from '@engine/set/render/renderForeground.js';

// Forensic logging
import { trace, mark } from '@engine/state/render/forensicLog.js';

/**
 * runFrame - Executes all operations for a single animation frame
 * 
 * @param {number} [nowMs=0] - Current timestamp from requestAnimationFrame
 *   Used for timing calculations and animation interpolation
 */
export function run(nowMs = 0) {
  // Record frame start time for performance measurement
  const frameStartMs = performance.now();

  // Log at the start of runFrame
  console.log('[runFrame] Executing runFrame at timestamp:', nowMs);

  // Check if this frame should be skipped due to FPS limiting
  // Returns frame interval in ms, or null if frame should be skipped
  const frameIntervalMs = shouldRunFrame(nowMs);
  if (frameIntervalMs === null) {
    mark('frame-skip', 'frame', { reason: 'fps-limit' });
    return;
  }

  // Update frame timing state
  state.lastPresentedFrameMs = nowMs;
  state.lastFrameMs = nowMs;

  // Increment frame counter
  state.RENDER_FRAME_ID++;
  const fid = state.RENDER_FRAME_ID;

  const frameEnd = trace('frame', 'frame', { fid });

  // Step 1: Update rotation physics
  const physEnd = trace('physics', 'physics', { fid });
  const physMs = physics();
  physEnd({ ms: physMs });

  // Step 2: Check frame budget and adjust quality level
  budget();

  // Step 3: Render the scene (background + foreground)
  const { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas } = scene(nowMs);

  // Render debug overlay (sphere outline + centre cross) if enabled
  renderDebugOverlay();

  // Calculate total frame time
  const frameMs = performance.now() - frameStartMs;

  // Step 4: Update frame budget tracking with this frame's time
  time(frameMs);

  // Step 5: Update telemetry with timing metrics
  telemetryState(nowMs, frameMs, physMs, bgMs, fgMs, frameIntervalMs);

  // Step 6: Update the telemetry HUD display
  hud(nowMs);

  // Update the debug overlay with telemetry metrics
  console.log('[run] Calling updateDebugOverlay with metrics:', {
    fps: 1000 / frameMs,
    frameMs,
    renderer: isGpuMode ? 'gpu' : 'cpu',
  });

  updateDebugOverlay({
    fps: 1000 / frameMs, // Calculate FPS from frame time
    frameMs,
    renderer: isGpuMode ? 'gpu' : 'cpu', // Use the current render mode
  });

  // Update frame loop state for next frame's canvas management
  state.cpuForegroundDrawnOnMainCanvas = drewCpuForeground && backgroundOnSeparateCanvas;

  frameEnd({ totalMs: frameMs, bgMs, fgMs, physMs });
}

// Enable debug logging for frame timing
console.log('[runFrame] Debug logging enabled');

/**
 * runFrame - Executes all operations for a single animation frame
 *
 * @param {number} [nowMs=0] - Current timestamp from requestAnimationFrame
 *   Used for timing calculations and animation interpolation
 */
export function runFrame(nowMs = 0) {
  const start = performance.now();

  // Log at the start of runFrame
  console.log('[runFrame] Executing runFrame at timestamp:', nowMs);

  // Step 1: Check if frame should run (FPS limiting)
  const frameIntervalMs = shouldRunFrame(nowMs);
  if (!frameIntervalMs) return;
  console.log(`[runFrame] Frame throttled, interval: ${frameIntervalMs}ms`);

  // Step 2: Update rotation physics
  const physicsStart = performance.now();
  physics(state);
  console.log(`[runFrame] Physics update took ${performance.now() - physicsStart}ms`);

  // Step 3: Check frame budget and adjust quality
  const budgetStart = performance.now();
  budget(state);
  console.log(`[runFrame] Budget adjustment took ${performance.now() - budgetStart}ms`);

  // Step 4: Render scene (background + foreground)
  const renderStart = performance.now();
  scene(state);
  console.log(`[runFrame] Scene rendering took ${performance.now() - renderStart}ms`);

  // Step 5: Collect and update telemetry
  const telemetryStart = performance.now();
  telemetryState(state);
  console.log(`[runFrame] Telemetry update took ${performance.now() - telemetryStart}ms`);

  // Step 6: Update the telemetry HUD display
  const hudStart = performance.now();
  hud(state);
  console.log(`[runFrame] HUD update took ${performance.now() - hudStart}ms`);

  // Log frame interval and rendering times
  console.log(`[runFrame] Frame interval: ${frameIntervalMs}ms`);
  console.log(`[runFrame] Foreground rendering time: ${fgMs}ms`);
  console.log(`[runFrame] Background rendering time: ${bgMs}ms`);

  console.log(`[runFrame] Total frame time: ${performance.now() - start}ms`);
}
