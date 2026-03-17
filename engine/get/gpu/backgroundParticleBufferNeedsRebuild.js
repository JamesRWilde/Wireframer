/**
 * particleBufferNeedsRebuild.js - Helper to determine if the particle buffer needs to be rebuilt
 *
 * PURPOSE:
 *   Checks if the number of particles has changed since the last frame, indicating the buffer must be rebuilt.
 *   Used to avoid unnecessary buffer uploads and maximize GPU efficiency.
 *
 * PARAMETERS:
 *   @param {Array} particles - The current array of particle objects.
 *     - Should be the array passed to the renderer for this frame.
 *   @param {number} lastCount - The previous particle count (from last buffer upload).
 *     - Should be tracked by the renderer and updated after each rebuild.
 *
 * RETURNS:
 *   @returns {boolean} True if the buffer needs to be rebuilt (particle count changed), false otherwise.
 *
 * USAGE:
 *   if (needsRebuild(particles, lastCount)) { ... }
 *
 * BEST PRACTICES:
 *   - Only use this to check for count changes; for deep equality, use a more thorough comparison.
 *   - Always update lastCount after a successful buffer rebuild.
 *   - This function does not manage buffer or program lifetimes; see DisposeGpuEngineBackground for cleanup.
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain this function and its export.
 *   - Update comments if buffer rebuild logic or particle structure changes.
 */
export function backgroundParticleBufferNeedsRebuild(particles, lastCount) {
  return particles?.length !== lastCount;
}
