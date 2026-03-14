/**
 * setBackgroundParticleVelocityUI.js - Background Particle Velocity Setter
 *
 * PURPOSE:
 *   Updates the global target velocity level for the background particle system.
 *
 * ARCHITECTURE ROLE:
 *   Called by UI controls to adjust particle motion speed in the background display.
 *
 * DATA FORMAT:
 *   - level: 0-1 scale representing particle velocity multiplier.
 *
 * @param {number} level - Target velocity level (0-1)
 */

"use strict";

export function setBackgroundParticleVelocityUI(level) {
  globalThis.BG_PARTICLE_VELOCITY_TARGET = level;
}
