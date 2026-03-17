/**
 * canvasCpuHidden.js - CPU Canvas Visibility Control
 *
 * PURPOSE:
 *   Controls the visibility of the CPU canvas element by toggling its CSS display
 *   property. This is used to show/hide the CPU canvas based on which rendering
 *   path (GPU or CPU) is currently active.
 *
 * ARCHITECTURE ROLE:
 *   Called by cpuPath and gpuPath to manage canvas visibility.
 *   The CPU canvas should be visible when using CPU rendering and hidden
 *   when using GPU rendering to avoid visual conflicts.
 */

"use strict";

/**
 * canvasCpuHidden - Shows or hides the CPU canvas
 *
 * @param {boolean} hidden - Whether to hide the canvas (true) or show it (false)
 *
 * This function is idempotent - it only updates the DOM if the current display
 * value differs from the target value, avoiding unnecessary DOM mutations.
 */
export function canvasCpuHidden(hidden) {
  const ctx = globalThis.ctx;
  
  if (!ctx?.canvas) return;
  
  const displayValue = hidden ? 'none' : 'block';
  
  if (ctx.canvas.style.display !== displayValue) {
    ctx.canvas.style.display = displayValue;
  }
}
