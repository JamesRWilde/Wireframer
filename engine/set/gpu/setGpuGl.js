"use strict";

/**
 * setGpuGl.js - Set GPU WebGL Context
 *
 * PURPOSE:
 *   Stores the WebGL rendering context so the GPU pipeline can access it
 *   for draw calls, buffer operations, and shader management.
 *
 * ARCHITECTURE ROLE:
 *   Setter for glState.gpuGl. Called once during setSwitchToGpuMode
 *   after the WebGL context is created. Read by all GPU render functions.
 *
 * WHY THIS EXISTS:
 *   The WebGL context is the core handle for all GPU operations. Storing
 *   it in shared state avoids threading the context through every GPU
 *   function call in the rendering chain.
 */

"use strict";

// Import the GPU state container — holds the WebGL context reference
import { glState } from '@engine/state/gpu/stateGlState.js';

/**
 * setGpuGl - Stores the WebGL rendering context
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl - The WebGL context to store
 */
export function setGpuGl(gl) {
  glState.gpuGl = gl;
}
