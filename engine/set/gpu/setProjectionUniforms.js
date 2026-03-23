/**
 * projectionUniforms.js - GPU Projection Uniform Setter
 *
 * PURPOSE:
 *   Sets the projection-related uniforms on a GPU shader program,
 *   including field of view, projection scale, model center Y offset,
 *   and depth scale for the perspective divide.
 *
 * ARCHITECTURE ROLE:
 *   Called by the scene model renderer before each draw call to configure
 *   the vertex shader's projection parameters. Computes FOV from the
 *   smaller viewport dimension and zoom level.
 */

"use strict";

/**
 * projectionUniforms - Sets projection uniforms on a shader program
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {Object} programLoc - Object with uniform locations (uProjX, uProjY, uModelCy, uDepthScale)
 * @param {Object} params - Render parameters
 * @param {number} params.width - Canvas width in pixels
 * @param {number} params.height - Canvas height in pixels
 * @param {number} params.zoom - Current zoom level
 * @param {number} [params.modelCy] - Model center Y offset
 * @param {number} [params.zHalf] - Half extent of model's Z range
 * @returns {void}
 */
export function setProjectionUniforms(gl, programLoc, params) {
  // Compute field of view from the smaller dimension and zoom level
  const minDim = Math.min(params.width, params.height);
  const fov = minDim * 0.9 * params.zoom;

  // Compute projection scale factors for X and Y axes
  const projX = (2 * fov) / Math.max(1, params.width);
  const projY = (2 * fov) / Math.max(1, params.height);

  // Compute depth scale to normalize Z values to [-1, 1] range
  const depthScale = 1 / Math.max(1.5, params.zHalf * 2.5);

  // Upload uniforms to the GPU
  gl.uniform1f(programLoc.uProjX, projX);
  gl.uniform1f(programLoc.uProjY, projY);
  gl.uniform1f(programLoc.uModelCy, params.modelCy ?? 0);
  gl.uniform1f(programLoc.uDepthScale, depthScale);
}
