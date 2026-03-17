// Import GPU renderer getter to access the singleton renderer instance
import { sceneRenderer }from '@engine/get/gpu/sceneRenderer.js';

// Import GPU renderer disabler for fallback on errors
import { disableSceneRenderer }from '@engine/dispose/gpu/disableSceneRenderer.js';

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
export function drawSceneModel(model, params) {
  const renderer = sceneRenderer();
  if (!renderer) return false;

  try {
    // Engine-owned mesh only
    return renderer.model(model, params);
  } catch (err) {
    disableSceneRenderer(err);
    return false;
  }
}
