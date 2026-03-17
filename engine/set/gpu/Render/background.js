/**
 * SetGpuEngineRenderBackground.js - Helper to render GPU background particles
 *
 * PURPOSE:
 *   Issues all WebGL draw calls for the animated background particles using the current buffer and uniforms.
 *   Sets up all attribute pointers, uniforms, and blending state for correct rendering.
 *
 * PARAMETERS:
 *   @param {WebGLRenderingContext} gl - The WebGL context used for rendering.
 *     - Must be a valid, active context.
 *   @param {Object} locations - Attribute and uniform locations, including the program.
 *     - Should include: program, seedPosLoc, velLoc, sizeLoc, alphaBaseLoc, speedLoc, phaseLoc, resLoc, timeLoc, velocityScaleLoc, opacityScaleLoc, colorLoc.
 *   @param {WebGLBuffer} buffer - The buffer containing packed particle data.
 *     - Must be bound to gl.ARRAY_BUFFER before drawing.
 *   @param {number} particleCount - Number of particles to render (number of points).
 *   @param {Object} params - Render parameters:
 *     - width: Canvas width in pixels
 *     - height: Canvas height in pixels
 *     - time: Animation time in seconds
 *     - velocityScale: Particle velocity scale
 *     - opacityScale: Particle opacity scale
 *     - color: RGB color array [r, g, b]
 *
 * USAGE:
 *   SetGpuEngineRenderBackground(gl, locations, buffer, particleCount, params);
 *
 * BEST PRACTICES:
 *   - Ensure all attribute/uniform locations are valid before calling.
 *   - Call this only after updating the buffer and uniforms for the current frame.
 *   - This function does not manage buffer or program lifetimes; see DisposeGpuEngineBackground for cleanup.
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain this function and its export.
 *   - Update comments if attribute/uniform layout or rendering logic changes.
 */
export function background(gl, locations, buffer, particleCount, params) {
  const { resLoc, timeLoc, velocityScaleLoc, opacityScaleLoc, colorLoc, seedPosLoc, velLoc, sizeLoc, alphaBaseLoc, speedLoc, phaseLoc } = locations;
  const { width, height, time, velocityScale, opacityScale, color } = params;

  gl.viewport(0, 0, width, height);
  gl.useProgram(locations.program);
  gl.uniform2f(resLoc, width, height);
  gl.uniform1f(timeLoc, time);
  gl.uniform1f(velocityScaleLoc, velocityScale);
  gl.uniform1f(opacityScaleLoc, opacityScale);
  gl.uniform3fv(colorLoc, color);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const stride = 8 * 4;
  gl.enableVertexAttribArray(seedPosLoc);
  gl.vertexAttribPointer(seedPosLoc, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(velLoc);
  gl.vertexAttribPointer(velLoc, 2, gl.FLOAT, false, stride, 8);
  gl.enableVertexAttribArray(sizeLoc);
  gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, stride, 16);
  gl.enableVertexAttribArray(alphaBaseLoc);
  gl.vertexAttribPointer(alphaBaseLoc, 1, gl.FLOAT, false, stride, 20);
  gl.enableVertexAttribArray(speedLoc);
  gl.vertexAttribPointer(speedLoc, 1, gl.FLOAT, false, stride, 24);
  gl.enableVertexAttribArray(phaseLoc);
  gl.vertexAttribPointer(phaseLoc, 1, gl.FLOAT, false, stride, 28);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.POINTS, 0, particleCount);
}
