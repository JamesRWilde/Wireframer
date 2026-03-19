/**
 * sceneRenderer.js - GPU Scene Renderer Factory
 *
 * PURPOSE:
 *   Creates a complete GPU scene renderer by initializing the WebGL context,
 *   compiling shader programs, setting up GPU buffers, and assembling the
 *   draw API. This is the primary entry point for GPU-based rendering.
 *
 * ARCHITECTURE ROLE:
 *   Called by the sceneRenderer getter (engine/get/gpu/sceneRenderer.js) to
 *   lazily create the singleton GPU renderer. Returns an object with model()
 *   and clear() methods for the render loop.
 *
 * DETAILS:
 *   - Tries WebGL2 first, falls back to WebGL1 and experimental-webgl
 *   - Stores the GL context globally as globalThis.gpuGl
 *   - Checks for 32-bit index support for large models
 *   - Creates shader programs, buffer store, and draw API
 */

"use strict";

// Import shader program creation
// Compiles vertex and fragment shaders for fill and wire rendering
import { scenePrograms }from '@engine/init/gpu/create/scenePrograms.js';

// Import buffer store creation
// Manages vertex buffers for fill positions, normals, and wire edges
import { sceneBufferStore }from '@engine/init/gpu/create/sceneBufferStore.js';

// Import draw API creation
// Provides model and clear functions for WebGL rendering
import { sceneDraw }from '@engine/init/gpu/create/sceneDraw.js';

/**
 * sceneRenderer - Creates a GPU scene renderer for a canvas element
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to render into
 * @returns {Object|null} Renderer object with { mode, model, clear, dispose }
 *   or null if WebGL initialization fails
 */
export function sceneRenderer(gl) {
  if (!gl) {
    return null;
  }

  // Check for 32-bit index support (needed for models with >65535 vertices)
  const supportsUint32 = !!gl.getExtension('OES_element_index_uint') ||
    (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext);

  // Compile fill and wire shader programs
  let shaderPack;
  try {
    shaderPack = scenePrograms(gl);
    if (!shaderPack) console.warn('[sceneRenderer] scenePrograms returned null');
  } catch (err) {
    console.warn('[sceneRenderer] shader error:', err);
    return null;
  }

  // Create GPU buffer store for vertex/index data
  const bufferStore = sceneBufferStore(gl, supportsUint32);
  if (!bufferStore) console.warn('[sceneRenderer] bufferStore failed');

  // Create the draw API that wraps all GPU rendering operations
  const drawApi = sceneDraw(gl, gl.canvas, shaderPack, bufferStore);
  if (!drawApi) console.warn('[sceneRenderer] drawApi failed');

  // Return the engine-owned renderer interface
  return {
    gl, // Include the WebGL context in the returned object
    mode: 'gpu-scene',
    model: drawApi.model,
    clear: drawApi.clear,
    dispose() {
      // Clean up shader programs on disposal
      if (shaderPack && typeof shaderPack.dispose === 'function') shaderPack.dispose();
    },
  };
}
