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
import { sceneRenderer }from '@engine/get/gpu/sceneRenderer.js';

// Import GPU renderer disabler for fallback on errors
import { disableSceneRenderer }from '@engine/dispose/gpu/disableSceneRenderer.js';
import { trace } from '@engine/state/render/forensicLog.js';

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
  const renderer = sceneRenderer(gl);
  if (!renderer) return false;

  // Log GPU rendering parameters for debugging
  console.log('[drawGpuSceneModel] Rendering parameters:', {
    verts: model?.V?.length,
    tris: model?.F?.length,
    fillAlpha: params.fillAlpha,
    wireAlpha: params.wireAlpha,
    zoom: params.zoom,
    rotation: params.rotation,
    theme: params.theme,
  });

  // Log the number of vertices and triangles being rendered
  console.log('[drawGpuSceneModel] Vertices:', model?.V?.length, 'Triangles:', model?.F?.length);

  const gpuEnd = trace('gpuDrawCall', 'gpu', { verts: model?.V?.length, tris: model?.F?.length });
  try {
    // Log WebGL state changes for debugging
    console.log('[drawGpuSceneModel] WebGL state before draw:', {
      depthTest: gl.isEnabled(gl.DEPTH_TEST),
      blend: gl.isEnabled(gl.BLEND),
      cullFace: gl.isEnabled(gl.CULL_FACE),
    });

    // Delegate to the renderer's model() method for actual GPU draw calls
    const result = renderer.model(model, params);
    gpuEnd({ drawn: result });
    return result;
  } catch (err) {
    // On GPU error, disable the renderer and mark GPU as failed
    gpuEnd({ error: err.message });
    disableSceneRenderer(err);
    return false;
  }
}
