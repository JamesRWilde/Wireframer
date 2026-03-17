/**
 * SetEngineRendererHud.js - Renderer Mode HUD Display
 * 
 * PURPOSE:
 *   Updates the HUD display to show the current foreground rendering mode
 *   (GPU or CPU). This helps users understand which rendering path is active
 *   and can explain performance differences.
 * 
 * ARCHITECTURE ROLE:
 *   Called by resolveForegroundRenderMode() when the render mode is determined,
 *   by fallbackToCpuForegroundMode() when switching from GPU to CPU, and by
 *   toggleRendererMode() when the user manually toggles the mode. Updates a
 *   DOM element to display the current mode.
 * 
 * TOGGLE FUNCTIONALITY:
 *   When GPU is supported, the renderer stat becomes a clickable toggle button
 *   (initialized by InitEngineRendererToggle.js). Clicking it switches between GPU
 *   and CPU modes. The visual styling (cursor, underline) is applied during
 *   initialization, not by this function.
 */

"use strict";

// Import the DOM element reference for the renderer stat display
import { statsState } from '../../ui/state/StateUiStats.js';

/**
 * SetEngineRendererHud - Updates the renderer mode display in the HUD
 * 
 * @param {string} mode - The current render mode: 'gpu', 'cpu', or 'unknown'
 * 
 * This function updates the DOM element to show:
 * - "GPU" when WebGL rendering is active
 * - "CPU" when Canvas 2D fallback is active
 * - "--" when the mode is unknown (during initialization)
 */
export function SetEngineRendererHud(mode) {
  // Get the DOM element for the renderer stat display
  const statRenderer = statsState.statRenderer;
  
  // Guard: if element doesn't exist, nothing to update
  if (!statRenderer) return;
  
  // Update the display based on the current mode
  if (mode === 'gpu') {
    statRenderer.textContent = 'GPU';
  } else if (mode === 'cpu') {
    statRenderer.textContent = 'CPU';
  } else {
    // Unknown mode (during initialization or error)
    statRenderer.textContent = '--';
  }
}
