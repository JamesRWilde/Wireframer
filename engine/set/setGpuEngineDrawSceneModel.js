// Import GPU renderer getter to access the singleton renderer instance
import { getGpuEngineSceneRenderer } from '../get/getGpuEngineSceneRenderer.js';

// Import GPU renderer disabler for fallback on errors
import { disposeGpuEngineDisableSceneRenderer } from '../dispose/disposeGpuEngineDisableSceneRenderer.js';

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
export function setGpuEngineDrawSceneModel(model, params) {
  const renderer = GetGpuEngineSceneRenderer();
  if (!renderer) return false;

  try {
    // Engine-owned mesh only
    return renderer.SetGpuEngineRenderModel(model, params);
  } catch (err) {
    DisposeGpuEngineDisableSceneRenderer(err);
    return false;
  }
}
