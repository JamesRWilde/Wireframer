/**
 * fallbackTo2dBackgroundRenderer.js - GPU to CPU Fallback Handler
 * 
 * PURPOSE:
 *   Handles graceful degradation when GPU background rendering fails.
 *   Disposes GPU resources and sets flags to prevent further GPU attempts.
 * 
 * ARCHITECTURE ROLE:
 *   Called when GPU renderer initialization or rendering throws an error.
 *   Ensures the application continues with CPU-based 2D canvas rendering.
 * 
 * WHY FALLBACK IS NEEDED:
 *   Not all browsers/devices support WebGL, or GPU context may be lost.
 *   This module ensures the particle background still works via CPU rendering.
 */

import { bgState } from './backgroundState.js';

/**
 * fallbackTo2dBackgroundRenderer - Disables GPU renderer and falls back to 2D
 * 
 * @param {Error} err - The error that triggered the fallback
 * 
 * @returns {void}
 * 
 * The function:
 * 1. Disposes GPU renderer resources if they exist
 * 2. Sets renderer to null to prevent reuse
 * 3. Sets rendererFailed flag to skip future GPU attempts
 * 4. Resets GPU render timestamp
 * 5. Logs warning with error details
 */
export function fallbackTo2dBackgroundRenderer(err) {
  // Dispose GPU renderer if it has a dispose method
  if (bgState.renderer && typeof bgState.renderer.dispose === 'function') {
    try {
      bgState.renderer.dispose();
    } catch {
      // Ignore cleanup failures - renderer may already be in invalid state
    }
  }
  
  // Clear renderer reference and set failure flag
  bgState.renderer = null;
  bgState.rendererFailed = true;
  
  // Reset GPU render timestamp to allow immediate CPU rendering
  bgState.gpuLastRenderMs = -1;
  
  // Log warning with error details for debugging
  console.warn('Wireframer: GPU background disabled, falling back to 2D.', err);
}
