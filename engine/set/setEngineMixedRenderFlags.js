/**
 * SetEngineMixedRenderFlags.js - Mixed Rendering State Handler
 * 
 * PURPOSE:
 *   Handles edge cases in the rendering pipeline where the background and foreground
 *   are on different canvases, or where the rendering mode has changed between frames.
 *   This function manages the frame loop state flags to ensure proper canvas clearing
 *   and compositing behavior.
 * 
 * ARCHITECTURE ROLE:
 *   Called during the frame loop when the rendering configuration doesn't fit the
 *   standard GPU-only or CPU-only paths. It updates FRAME_LOOP_STATE flags that
 *   other rendering functions read to determine their behavior.
 * 
 * WHY THIS EXISTS:
 *   The rendering pipeline has multiple canvas layers (bg, cpu, fg) and two rendering
 *   modes (GPU, CPU). When these interact in non-standard ways (e.g., background on
 *   separate canvas but CPU foreground on main canvas), we need explicit state tracking
 *   to avoid visual artifacts like ghosting or double-drawing.
 */

"use strict";

/**
 * SetEngineMixedRenderFlags - Manages rendering state for mixed canvas configurations
 * 
 * @param {boolean} backgroundOnSeparateCanvas - Whether background particles are rendered
 *   on a separate canvas (bg) rather than the main canvas
 * @param {boolean} gpuDrawn - Whether GPU rendering was successfully used this frame
 * 
 * This function updates FRAME_LOOP_STATE flags that control:
 * - Whether to clear the GPU scene canvas next frame
 * - Whether CPU foreground is currently composited on the main canvas
 */
export function setEngineMixedRenderFlags(backgroundOnSeparateCanvas, gpuDrawn) {
  // Mark that GPU scene was drawn (for next frame's clearing logic)
  globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = true;
}
