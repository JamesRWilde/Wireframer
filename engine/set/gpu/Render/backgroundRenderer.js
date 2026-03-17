/**
 * SetGpuEngineRenderBackgroundRenderer.js - Main render function for GPU background renderer
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
 *     - needsRebuild: function - Helper to check if buffer needs rebuild.
 *     - rebuildBuffer: function - Helper to rebuild buffer.
 *     - SetGpuEngineRenderBackground: function - Helper to issue draw call.
 *     - particleCount: number - The previous particle count (will be updated).
 *
 * RETURNS:
 *   @returns {number} The updated particle count after rendering.
 *
 * USAGE:
 *   particleCount = SetGpuEngineRenderBackgroundRenderer({ gl, locations, buffer, params, needsRebuild, rebuildBuffer, SetGpuEngineRenderBackground, particleCount });
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain this function and its export.
 *   - Update comments if the render logic or parameter structure changes.
 */
export function backgroundRenderer(opts) {
  const { gl, locations, buffer, params, needsRebuild, rebuildBuffer, SetGpuEngineRenderBackground, particleCount: prevCount } = opts;
  const { particles } = params;
  let particleCount = prevCount;
  if (!particles?.length) return particleCount;
  if (particleBufferNeedsRebuild(particles, particleCount)) {
    particleCount = rebuildBuffer(gl, buffer, particles);
  }
  SetGpuEngineRenderBackground(gl, locations, buffer, particleCount, params);
  return particleCount;
}
