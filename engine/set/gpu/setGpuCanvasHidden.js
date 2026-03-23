/**
 * canvasHidden.js - GPU Canvas Visibility Control
 *
 * PURPOSE:
 *   Controls the visibility of the GPU canvas element by toggling its CSS visibility
 *   property. Uses visibility instead of display because Chrome cannot create WebGL
 *   contexts on display:none elements.
 *
 * ARCHITECTURE ROLE:
 *   Called by renderGpuPath and renderCpuPath to manage canvas visibility.
 *   The GPU canvas should be visible when using GPU rendering and hidden
 *   when using CPU rendering to avoid visual conflicts.
 *
 * WHY VISIBILITY (NOT DISPLAY):
 *   - display: none prevents WebGL context creation in Chrome
 *   - visibility: hidden keeps the element in the render tree (WebGL works)
 *   - pointer-events: none is set in CSS to prevent interaction anyway
 */

"use strict";

// Import GPU canvas getter — retrieves the WebGL canvas DOM element
import { getGpuCanvas } from '@engine/get/render/getGpuCanvas.js';

/**
 * setGpuCanvasHidden - Shows or hides the GPU canvas
 *
 * @param {boolean} hidden - Whether to hide the canvas (true) or show it (false)
 */
export function setGpuCanvasHidden(hidden) {
  const gpuCanvas = getGpuCanvas();
  if (!gpuCanvas) {
    console.warn('[canvasHidden] gpuCanvas is null');
    return;
  }

  const visibilityValue = hidden ? 'hidden' : 'visible';
  if (gpuCanvas.style.visibility !== visibilityValue) {
    gpuCanvas.style.visibility = visibilityValue;
  }
}
