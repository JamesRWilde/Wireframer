/**
 * getBackgroundRenderer.js - GPU Renderer Factory
 * 
 * PURPOSE:
 *   Lazily initializes and returns the GPU background renderer.
 *   Implements singleton pattern with failure tracking.
 * 
 * ARCHITECTURE ROLE:
 *   Called when GPU rendering is needed for the background.
 *   Creates renderer on first call, caches it for subsequent calls.
 * 
 * WHY LAZY INITIALIZATION:
 *   GPU context creation is expensive and may fail on some devices.
 *   Deferring creation until needed avoids unnecessary overhead.
 */

import { bgState } from '../backgroundState.js';
import { createGpuBackgroundRenderer } from '../../gpu/background-gpu/createGpuBackgroundRenderer.js';

/**
 * getBackgroundRenderer - Gets or creates the GPU background renderer
 * 
 * @returns {Object|null} GPU renderer instance, or null if unavailable/failed
 * 
 * The function:
 * 1. Returns cached renderer if it exists
 * 2. Returns null if previous initialization failed
 * 3. Creates new renderer if canvas is available
 * 4. Sets failure flag if creation fails
 */
export function getBackgroundRenderer() {
  // Return cached renderer if available, or null if previously failed
  if (bgState.renderer || bgState.rendererFailed) return bgState.renderer;
  
  // Validate prerequisites: canvas must exist and factory function must be available
  if (!bgState.canvas || typeof createGpuBackgroundRenderer !== 'function') {
    bgState.rendererFailed = true;
    return null;
  }

  // Attempt to create GPU renderer
  bgState.renderer = createGpuBackgroundRenderer(bgState.canvas);
  
  // Set failure flag if creation returned null
  if (!bgState.renderer) bgState.rendererFailed = true;
  
  return bgState.renderer;
}
