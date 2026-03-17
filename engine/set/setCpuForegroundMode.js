/**
 * fallbackToCpuForegroundMode.js - GPU to CPU Render Mode Fallback
 * 
 * PURPOSE:
 *   Handles the fallback transition when GPU (WebGL) rendering fails or is
 *   unavailable. This function switches the foreground rendering mode to CPU
 *   (Canvas 2D) and updates the HUD to reflect the change.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderGpuPath when drawGpuSceneModel returns false (indicating
 *   GPU rendering failed). This is part of the graceful degradation strategy
 *   that ensures the app continues working even without WebGL support.
 * 
 * WHY SEPARATE:
 *   The fallback logic is isolated to make it easy to extend (e.g., showing
 *   a user notification, logging analytics, or attempting alternative GPU paths).
 */

"use strict";

// Import loop state to update the cached render mode
import { state } from '../loopState.js';

// Import the HUD update function to display the current render mode
// This shows "GPU" or "CPU" in the stats display so users know which path is active
import { updateRendererHud } from '../update/updateRendererHud.js';

/**
 * setCpuForegroundMode - Switches foreground rendering to CPU path
 * 
 * This function is called when GPU rendering fails (context lost, shader compile
 * error, unsupported features, etc.). It updates the global render mode state
 * and refreshes the HUD to inform the user.
 * 
 * The CPU path uses Canvas 2D for rendering, which is universally supported
 * but typically slower than WebGL for complex scenes.
 */
export function setCpuForegroundMode() {
  // Update the render mode to CPU in loop state
  // This variable is read by the frame loop to determine which rendering path to use
  state.foregroundRenderMode = 'cpu';
  
  // Update the HUD display to show "CPU" instead of "GPU"
  // This helps users understand why performance might be different
  updateRendererHud(state.foregroundRenderMode);
}
