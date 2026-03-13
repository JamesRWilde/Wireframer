/**
 * updateRendererHud.js - Renderer Mode HUD Display
 * 
 * PURPOSE:
 *   Updates the HUD display to show the current foreground rendering mode
 *   (GPU or CPU). This helps users understand which rendering path is active
 *   and can explain performance differences.
 * 
 * ARCHITECTURE ROLE:
 *   Called by resolveForegroundRenderMode() when the render mode is determined,
 *   and by fallbackToCpuForegroundMode() when switching from GPU to CPU.
 *   Updates a DOM element to display the current mode.
 * 
 * WHY THIS EXISTS:
 *   The app automatically selects GPU rendering when available and falls back
 *   to CPU when GPU fails. Showing the current mode helps users understand
 *   why performance might differ from expectations.
 */

// Import the DOM element reference for the renderer stat display
import { getStatRenderer } from '../../../ui/statsState.js';

/**
 * updateRendererHud - Updates the renderer mode display in the HUD
 * 
 * @param {string} mode - The current render mode: 'gpu', 'cpu', or 'unknown'
 * 
 * This function updates the DOM element to show:
 * - "GPU" when WebGL rendering is active
 * - "CPU" when Canvas 2D fallback is active
 * - "--" when the mode is unknown (during initialization)
 */
export function updateRendererHud(mode) {
  // Get the DOM element for the renderer stat display
  const statRenderer = getStatRenderer();
  
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
