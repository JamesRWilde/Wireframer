/**
 * getBgParticleBufferNeedsRebuild.js - Particle Buffer Rebuild Check
 *
 * PURPOSE:
 *   Checks if the number of particles has changed since the last frame, indicating the buffer must be rebuilt.
 *   Used to avoid unnecessary buffer uploads and maximize GPU efficiency.
 *
 * ARCHITECTURE ROLE:
 *   Called in GPU background path to determine if a particle vertex buffer rebuild is required.
 *
 * WHY THIS EXISTS:
 *   Encapsulates change detection logic for particle buffer rebuilds so rendering code
 *   can remain focused on GPU data preparation.
 *
 * USAGE:
 *   if (getBgParticleBufferNeedsRebuild(particles, lastCount)) { ... }
 *
 * MAINTAINER GUIDELINES:
 *   - This file should contain only this standalone pure function and its export.
 */

"use strict";
export function getBgParticleBufferNeedsRebuild(particles, lastCount) {
  return particles?.length !== lastCount;
}
