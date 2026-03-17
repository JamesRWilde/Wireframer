/**
 * model.js - GPU Model Render Dispatcher
 *
 * PURPOSE:
 *   Forwards GPU model rendering calls to the scene model renderer.
 *   Acts as a thin delegation layer between the draw API and the
 *   actual WebGL rendering implementation.
 *
 * ARCHITECTURE ROLE:
 *   Called by the scene draw API's model() method. Delegates to
 *   sceneModel.js for the actual WebGL draw calls.
 */

"use strict";

// Import the scene model renderer for actual GPU draw calls
import { sceneModel } from '@engine/set/gpu/render/sceneModel.js';

/**
 * model - Renders a 3D model using the GPU scene pipeline
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {Object} model - Mesh data { V, F, E }
 * @param {Object} params - Render parameters (theme, rotation, zoom, etc.)
 * @param {Object} shaderPack - Compiled shader programs and locations
 * @param {Object} bufferStore - GPU buffer management object
 * @param {Object} tmpArrays - Pre-allocated Float32Arrays for uniform uploads
 * @returns {boolean} Whether rendering succeeded
 */
export function model(gl, model, params, shaderPack, bufferStore, tmpArrays) {
  return sceneModel(gl, model, params, shaderPack, bufferStore, tmpArrays);
}
