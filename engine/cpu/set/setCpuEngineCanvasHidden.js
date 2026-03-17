/**
 * SetCpuEngineCanvasHidden.js - CPU Canvas Visibility Control
 * 
 * PURPOSE:
 *   Controls the visibility of the CPU canvas element by toggling its CSS display
 *   property. This is used to show/hide the CPU canvas based on which rendering
 *   path (GPU or CPU) is currently active.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderCpuPath and renderGpuPath to manage canvas visibility.
 *   The CPU canvas should be visible when using CPU rendering and hidden
 *   when using GPU rendering to avoid visual conflicts.
 * 
 * WHY CSS DISPLAY:
 *   We use CSS display (none/block) rather than visibility or opacity because:
 *   - display: none removes the element from layout (no rendering overhead)
 *   - It's simpler than managing z-index or opacity
 *   - It prevents any interaction with the hidden canvas
 */

"use strict";

/**
 * SetCpuEngineCanvasHidden - Shows or hides the CPU canvas
 * 
 * @param {boolean} hidden - Whether to hide the canvas (true) or show it (false)
 * 
 * This function is idempotent - it only updates the DOM if the current display
 * value differs from the target value, avoiding unnecessary DOM mutations.
 */
export function setCpuEngineCanvasHidden(hidden) {
  // Get the main rendering context (which is attached to the CPU canvas)
  const ctx = globalThis.ctx;
  
  // Guard: if context or canvas doesn't exist, nothing to do
  if (!ctx?.canvas) return;
  
  // Determine the target CSS display value
  // 'none' hides the element, 'block' shows it as a block element
  const displayValue = hidden ? 'none' : 'block';
  
  // Only update DOM if the value actually changed
  // This avoids unnecessary DOM mutations which can trigger style recalculations
  if (ctx.canvas.style.display !== displayValue) {
    ctx.canvas.style.display = displayValue;
  }
}
