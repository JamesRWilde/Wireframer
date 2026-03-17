// Import GPU renderer getter to access the singleton renderer instance
import { getSceneGpuRenderer } from './get/getSceneGpuRenderer.js';

// Import GPU renderer disabler for fallback on errors
import { disableSceneGpuRenderer } from './dispose/disableSceneGpuRenderer.js';

/**
 * drawGpuSceneModel - Renders the 3D model using the GPU (WebGL) renderer
 * 
 * @param {Object} model - The mesh object to render { V, F, E }
 * @param {Object} params - Rendering parameters (theme, rotation, zoom, etc.)
 * 
 * @returns {boolean} Whether GPU rendering succeeded
 *   true: GPU rendering completed successfully
 *   false: GPU rendering failed (renderer unavailable or error occurred)
 */
export function drawGpuSceneModel(model, params) {
  const renderer = getSceneGpuRenderer();
  if (!renderer) return false;

  try {
    // Engine-owned mesh only
    return renderer.renderModel(model, params);
  } catch (err) {
    disableSceneGpuRenderer(err);
    return false;
  }
}
