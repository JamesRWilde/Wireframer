/**
 * rebuildBuffer.js - Helper to rebuild the particle buffer for the GPU background renderer
 *
 * PURPOSE:
 *   Updates the WebGL buffer with the latest particle data and returns the new particle count.
 *   Ensures the GPU buffer always matches the current set of particles for correct rendering.
 *
 * PARAMETERS:
 *   @param {WebGLRenderingContext} gl - The WebGL context used for rendering.
 *     - Must be a valid, active context.
 *   @param {WebGLBuffer} buffer - The buffer to upload data into.
 *     - Must be bound to gl.ARRAY_BUFFER before drawing.
 *   @param {Array<Object>} particles - Array of particle objects to upload.
 *     - Each object should have x, y, vx, vy, size, alphaBase, speed, phase properties.
 *
 * RETURNS:
 *   @returns {number} The new particle count (number of points in the buffer).
 *
 * USAGE:
 *   const count = rebuildBuffer(gl, buffer, particles);
 *
 * BEST PRACTICES:
 *   - Call this only when the particle array changes (add/remove).
 *   - Do not call if particles is empty or unchanged.
 *   - This function does not manage buffer or program lifetimes; see backgroundDispose for cleanup.
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain this function and its export.
 *   - Update comments if the particle data structure or buffer layout changes.
 */
import {backgroundParticleBuffer}from '@engine/init/gpu/create/backgroundParticleBuffer.js';

export function rebuildBackgroundBuffer(gl, buffer, particles) {
  if (!particles?.length) return 0;
  createParticleBuffer(gl, buffer, particles);
  return particles.length;
}
