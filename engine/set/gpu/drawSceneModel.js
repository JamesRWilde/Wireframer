/**
 * drawSceneModel.js - GPU Scene Model Renderer
 *
 * PURPOSE:
 *   Renders a 3D model using the GPU (WebGL) scene renderer. Handles
 *   renderer retrieval, error catching, and automatic fallback to CPU
 *   rendering if GPU rendering fails.
 *
 * ARCHITECTURE ROLE:
 *   Called by the render loop when the engine is in GPU mode. Delegates
 *   to the scene renderer's model() method and catches any GPU errors
 *   to trigger graceful fallback.
 */

"use strict";

// Import GPU renderer getter to access the singleton renderer instance
import { getSceneRendererGpu }from '@engine/get/gpu/getSceneRendererGpu.js';

// Import GPU renderer disabler for fallback on errors
import { disableSceneRenderer }from '@engine/dispose/gpu/disableSceneRenderer.js';
import { switchToCpuMode } from '@engine/set/render/switchToCpuMode.js';

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
export function drawSceneModel(gl, model, params) {
  // Get the GPU scene renderer (lazy-creates on first call)
  const renderer = getSceneRendererGpu(gl);
  if (!renderer) return false;

  try {

    // Delegate to the renderer's model() method for actual GPU draw calls
    const result = renderer.model(model, params);
    return result;
  } catch (err) {
    // On GPU error, disable the renderer and mark GPU as failed
    disableSceneRenderer(err);

    // Fall back to CPU mode to avoid continual GPU retries and ensure only
    // one pipeline is active at a time.
    switchToCpuMode();

    return false;
  }
}
