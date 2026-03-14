/**
 * setGpuCanvasHidden.js - GPU Canvas Visibility Control
 * 
 * PURPOSE:
 *   Controls the visibility of the GPU canvas element by toggling its CSS display
 *   property. This is used to show/hide the GPU canvas based on which rendering
 *   path (GPU or CPU) is currently active.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderGpuPath and renderCpuPath to manage canvas visibility.
 *   The GPU canvas should be visible when using GPU rendering and hidden
 *   when using CPU rendering to avoid visual conflicts.
 * 
 * WHY CSS DISPLAY:
 *   We use CSS display (none/block) rather than visibility or opacity because:
 *   - display: none removes the element from layout (no rendering overhead)
 *   - It's simpler than managing z-index or opacity
 *   - It prevents any interaction with the hidden canvas
 */

"use strict";

/**
 * setGpuCanvasHidden - Shows or hides the GPU canvas
 * 
 * @param {boolean} hidden - Whether to hide the canvas (true) or show it (false)
 * 
 * This function is idempotent - it only updates the DOM if the current display
 * value differs from the target value, avoiding unnecessary DOM mutations.
 */
export function setGpuCanvasHidden(hidden) {
  // Get the GPU canvas element
  const gpuCanvas = globalThis.gpuCanvas;
  
  // Guard: if canvas doesn't exist, nothing to do
  if (!gpuCanvas) return;
  
  // Determine the target CSS display value
  // 'none' hides the element, 'block' shows it as a block element
  const displayValue = hidden ? 'none' : 'block';
  
  // Only update DOM if the value actually changed
  // This avoids unnecessary DOM mutations which can trigger style recalculations
  if (gpuCanvas.style.display !== displayValue) {
    gpuCanvas.style.display = displayValue;
  }
}
