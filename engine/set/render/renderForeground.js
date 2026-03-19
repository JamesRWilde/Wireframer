/**
 * renderForeground.js - Foreground Render Function Pointer
 * 
 * PURPOSE:
 *   Provides a single function pointer that points to the active foreground
 *   rendering function (either GPU or CPU path). This eliminates all per-frame
 *   conditionals and checks - the render loop simply calls this function.
 * 
 * ARCHITECTURE ROLE:
 *   This module owns the mutable function reference that is set by
 *   initRenderPipeline() and toggleRenderMode(). The render loop imports
 *   and calls this function directly without any mode checks.
 * 
 * INITIALIZATION:
 *   - initRenderPipeline() detects WebGL and sets renderForeground to either
 *     gpuPath or cpuPath based on availability
 *   - Only the selected pipeline is ever initialized and active
 *   - The other pipeline remains completely uninitialized
 * 
 * TOGGLING:
 *   - toggleRenderMode() swaps the function pointer
 *   - Disposes the old pipeline completely
 *   - Initializes the new pipeline
 *   - Updates the HUD display
 * 
 * USAGE:
 *   import { renderForeground, isGpuMode } from '@engine/set/render/renderForeground.js';
 *   
 *   // In render loop:
 *   const drewCpuForeground = renderForeground(meshToRender, backgroundOnSeparateCanvas, morphing);
 */

"use strict";

// Private mutable state - only this module can modify these
let _renderForeground = null;
let _isGpuMode = false;

/**
 * getRenderForeground - Returns the current foreground render function
 * @returns {function|null} The active render function
 */
export function getRenderForeground() {
  return _renderForeground;
}

/**
 * setRenderForeground - Sets the foreground render function
 * @param {function} fn - The render function to set
 */
export function setRenderForeground(fn) {
  _renderForeground = fn;
}

/**
 * isGpuMode - Returns whether GPU rendering is active
 * @returns {boolean}
 */
export function isGpuMode() {
  return _isGpuMode;
}

/**
 * setIsGpuMode - Sets the GPU mode flag
 * @param {boolean} value - Whether GPU mode is active
 */
export function setIsGpuMode(value) {
  _isGpuMode = value;
}
