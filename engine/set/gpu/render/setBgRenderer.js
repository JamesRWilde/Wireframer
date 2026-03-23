/**
 * backgroundRenderer.js - Main render function for GPU background renderer
 *
 * PURPOSE:
 *   Handles the per-frame rendering logic for the GPU background renderer. Checks if the buffer needs to be rebuilt,
 *   updates the buffer if necessary, and issues the draw call using the provided helpers.
 *
 * PARAMETERS:
 *   @param {Object} opts - Options object containing all state and helpers.
 *     - gl: WebGLRenderingContext - The WebGL context used for rendering.
 *     - locations: Object - Attribute and uniform locations, including the program.
 *     - buffer: WebGLBuffer - The buffer containing packed particle data.
 *     - params: Object - Render parameters (must include particles, width, height, time, velocityScale, opacityScale, color).
 *     - rebuildBuffer: function - Helper to rebuild buffer.
 *     - background: function - Helper to issue draw call.
 *     - particleCount: number - The previous particle count (will be updated).
 *
 * RETURNS:
 *   @returns {number} The updated particle count after rendering.
 *
 * WHY THIS EXISTS:
 *   Encapsulates the GPU background render pipeline so a single function can
 *   manage buffer rebuild and draw calls, enabling cleaner high-level control.
 *
 * USAGE:
 *   particleCount = backgroundRenderer({ gl, locations, buffer, params, rebuildBuffer, background, particleCount });
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain this function and its export.
 *   - Update comments if the render logic or parameter structure changes.
 */
export function setBgRenderer(opts) {
  const { gl, locations, buffer, params, rebuildBuffer, background, particleCount: prevCount } = opts;
  const { particles } = params;
  let particleCount = prevCount;
  if (!particles?.length) return particleCount;
  if (particleBufferNeedsRebuild(particles, particleCount)) {
    particleCount = rebuildBuffer(gl, buffer, particles);
  }
  background(gl, locations, buffer, particleCount, params);
  return particleCount;
}
