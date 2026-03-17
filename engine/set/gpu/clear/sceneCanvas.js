/**
 * sceneCanvas.js - GPU Scene Canvas Clear
 *
 * PURPOSE:
 *   Sets the WebGL viewport to the canvas dimensions and clears both
 *   the color buffer (to transparent black) and the depth buffer.
 *
 * ARCHITECTURE ROLE:
 *   Called by the GPU clear/draw module before each render pass.
 *   Ensures a clean framebuffer for the new frame.
 */

"use strict";

/**
 * sceneCanvas - Clears the WebGL viewport and buffers
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {HTMLCanvasElement} canvas - The canvas element (used for viewport size)
 * @returns {void}
 */
export function sceneCanvas(gl, canvas) {
  // Set viewport to match canvas dimensions
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Clear color buffer to transparent black
  gl.clearColor(0, 0, 0, 0);

  // Clear both color and depth buffers
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
