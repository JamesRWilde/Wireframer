/**
 * setBackgroundParticleDensityUI.js - Background Particle Density Setter
 *
 * PURPOSE:
 *   Updates the global target density level for the background particle system.
 *
 * ARCHITECTURE ROLE:
 *   Called by UI controls to adjust how many particles are rendered in the background.
 *
 * DATA FORMAT:
 *   - level: 0-1 scale representing particle density multiplier.
 *
 * @param {number} level - Target density level (0-1)
 */

"use strict";

export function setBackgroundParticleDensityUI(level) {
  globalThis.BG_PARTICLE_DENSITY_TARGET = level;
}
