/**
 * resolveForegroundRenderMode.js - GPU/CPU Render Mode Detection
 * 
 * PURPOSE:
 *   Determines whether to use GPU (WebGL) or CPU (Canvas 2D) rendering for the
 *   foreground 3D model. This decision is made once at startup (or when a new
 *   model is loaded) and cached to avoid repeated detection overhead.
 * 
 * ARCHITECTURE ROLE:
 *   Called during model activation (setActiveModel) and app initialization.
 *   The resolved mode is stored in loopState.foregroundRenderMode and read
 *   by the frame loop to select the appropriate rendering path.
 * 
 * DETECTION LOGIC:
 *   1. If mode is already resolved (not 'unknown'), return cached value
 *   2. Check if GPU renderer is available via getSceneGpuRenderer()
 *   3. If GPU renderer exists, use 'gpu' mode; otherwise use 'cpu' mode
 *   4. Cache the result and update the HUD display
 */

"use strict";

// Import loop state to read/write the cached render mode
import { state } from './loopState.js';

// Import HUD updater to display the current render mode (GPU/CPU)
import { updateRendererHud } from './updateRendererHud.js';

// Import GPU renderer getter to check if GPU is available
import { getSceneGpuRenderer } from '../gpu/scene/getSceneGpuRenderer.js';

/**
 * resolveForegroundRenderMode - Determines and caches the foreground render mode
 * 
 * @returns {string} The resolved render mode: 'gpu' or 'cpu'
 * 
 * This function is idempotent - calling it multiple times returns the same result
 * without re-running detection. The mode is cached in state.foregroundRenderMode.
 * 
 * Called by:
 * - setActiveModel() when a new model is activated
 * - startApp() during initialization
 * - Any code that needs to know the current render mode
 */
export function resolveForegroundRenderMode() {
  // If mode is already resolved (not 'unknown'), return the cached value
  // This avoids repeated detection and ensures consistent behavior
  if (state.foregroundRenderMode !== 'unknown') return state.foregroundRenderMode;
  
  // Check if GPU renderer is available
  // getSceneGpuRenderer returns the GPU renderer if WebGL is available and initialized
  const renderer = getSceneGpuRenderer();
  
  // Determine mode based on GPU renderer availability
  // If renderer exists, use GPU; otherwise fall back to CPU
  const mode = renderer ? 'gpu' : 'cpu';
  
  // Cache the resolved mode in loop state
  // This prevents re-detection on subsequent calls
  state.foregroundRenderMode = mode;
  
  // Update the HUD to show the current render mode
  // This displays "GPU" or "CPU" in the stats panel
  updateRendererHud(mode);
  
  // Return the resolved mode
  return mode;
}
