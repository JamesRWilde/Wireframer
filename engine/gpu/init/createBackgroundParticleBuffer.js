/**
 * createParticleBuffer.js - Helper for uploading particle data to a WebGL buffer
 *
 * PURPOSE:
 *   Encapsulates the logic for converting an array of particle objects into a Float32Array
 *   and uploading it to a WebGL buffer for use in the GPU background renderer.
 *
 * PARAMETERS:
 *   @param {WebGLRenderingContext} gl - The WebGL context
 *   @param {WebGLBuffer} buffer - The buffer to upload data into
 *   @param {Array<Object>} particles - Array of particle objects with x, y, vx, vy, size, alphaBase, speed, phase
 *
 * RETURNS: void
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain this helper function and its export.
 *   - Update comments if the particle data structure changes.
 */
export function createBackgroundParticleBuffer(gl, buffer, particles) {
  const stride = 8;
  const data = new Float32Array(particles.length * stride);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const o = i * stride;
    data[o] = p.x;
    data[o + 1] = p.y;
    data[o + 2] = p.vx;
    data[o + 3] = p.vy;
    data[o + 4] = p.size;
    data[o + 5] = p.alphaBase;
    data[o + 6] = p.speed;
    data[o + 7] = p.phase;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}
