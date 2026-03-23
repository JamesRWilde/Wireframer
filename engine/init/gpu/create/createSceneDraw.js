/**
 * sceneDraw.js - GPU Scene Draw API Factory
 *
 * PURPOSE:
 *   Creates the draw API object that provides model() and clear() functions
 *   for GPU-based scene rendering. Sets up temporary color arrays for
 *   efficient uniform uploads without per-frame allocation.
 *
 * ARCHITECTURE ROLE:
 *   Called by sceneRenderer during GPU initialization. Encapsulates the
 *   WebGL draw pipeline behind a simple interface consumed by the
 *   render loop.
 */

"use strict";

// Import the model rendering function for GPU scene draw calls
import { getModelFn } from '@engine/set/gpu/render/getModelFn.js';

// Import the clear/draw function to clear the WebGL canvas
import { drawGpu } from '@engine/set/gpu/drawGpu.js';

/**
 * sceneDraw - Creates the GPU scene draw API
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} shaderPack - Compiled shader programs and locations
 * @param {Object} bufferStore - GPU buffer management object
 * @returns {Object} Draw API with { model, clear } methods
 */
export function createSceneDraw(gl, canvas, shaderPack, bufferStore) {
  // Pre-allocated Float32Arrays to avoid per-frame garbage collection
  // These are reused across draw calls for light, view, shading, and wire colors
  const tmpArrays = {
    tmpLight: new Float32Array(3),      // Light direction vector
    tmpView: new Float32Array(3),       // View direction vector
    tmpShadeDark: new Float32Array(3),  // Dark shade color (normalized RGB)
    tmpShadeBright: new Float32Array(3), // Bright shade color (normalized RGB)
    tmpWireNear: new Float32Array(3),   // Near wire color (normalized RGB)
    tmpWireFar: new Float32Array(3),    // Far wire color (normalized RGB)
  };

  return {
    /**
     * Renders a 3D model using the GPU shader pipeline
     * @param {Object} model - Mesh data { V, F, E }
     * @param {Object} params - Render parameters (theme, rotation, zoom, etc.)
     * @returns {boolean} Whether rendering succeeded
     */
    model(model, params) {
      return getModelFn(gl, model, params, shaderPack, bufferStore, tmpArrays);
    },

    /**
     * Clears the WebGL canvas (viewport + color/depth buffers)
     */
    clear() {
      draw(gl, canvas);
    }
  };
}
