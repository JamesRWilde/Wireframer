/**
 * setProjectionUniforms.js - GPU Projection Uniform Setter
 *
 * PURPOSE:
 *   Sets the projection-related uniforms on a GPU shader program,
 *   including field of view, projection scale, and model center Y offset.
 *   These values depend on the current canvas size and zoom level, so they
 *   must be re-uploaded whenever either changes.
 *
 * ARCHITECTURE ROLE:
 *   Called by the scene model renderer before each draw call to configure
 *   the vertex shader's projection parameters. Computes FOV from the
 *   smaller viewport dimension and zoom level.
 *
 * WHY THIS EXISTS:
 *   The vertex shader needs projection scale and viewport parameters to
 *   transform 3D vertices into screen space. In true orthographic projection
 *   these are linear scales — X and Y are never divided by depth (Z).
 *   Z passes through to the depth buffer unchanged for depth ordering only.
 */

"use strict";

/**
 * setProjectionUniforms - Sets projection uniforms on a GPU shader program
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {Object} programLoc - Object with uniform locations (uProjX, uProjY, uModelCy)
 * @param {Object} params - Render parameters
 * @param {number} params.width - Canvas width in pixels
 * @param {number} params.height - Canvas height in pixels
 * @param {number} params.zoom - Current zoom level
 * @param {number} [params.modelCy] - Model center Y offset (default 0)
 * @returns {void}
 */
export function setProjectionUniforms(gl, programLoc, params) {
  // Compute field of view from the smaller dimension and zoom level.
  // The 0.9 factor leaves a 10% margin around the model so edges don't clip.
  const minDim = Math.min(params.width, params.height);
  const fov = minDim * 0.9 * params.zoom;

  // Compute projection scale factors for X and Y axes.
  // These convert from model-space units to clip-space coordinates.
  const projX = (2 * fov) / Math.max(1, params.width);
  const projY = (2 * fov) / Math.max(1, params.height);

  // Upload uniforms to the GPU
  gl.uniform1f(programLoc.uProjX, projX);
  gl.uniform1f(programLoc.uProjY, projY);
  gl.uniform1f(programLoc.uModelCy, params.modelCy ?? 0);
}
