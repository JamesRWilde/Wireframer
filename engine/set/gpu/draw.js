/**
 * draw.js - GPU Canvas Clear Dispatcher
 *
 * PURPOSE:
 *   Dispatches a canvas clear operation to the GPU clear module.
 *   Clears the WebGL viewport and color/depth buffers.
 *
 * ARCHITECTURE ROLE:
 *   Called by the scene draw API to clear the GPU canvas before rendering.
 *   Acts as a thin forwarding layer to sceneCanvas.
 */

"use strict";

// Import the GPU canvas clear implementation
import { sceneCanvas } from '@engine/set/gpu/sceneCanvas.js';

/**
 * draw - Clears the WebGL canvas (viewport + buffers)
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {HTMLCanvasElement} canvas - The canvas element to clear
 * @returns {void}
 */
export function draw(gl, canvas) {
  sceneCanvas(gl, canvas);
}
