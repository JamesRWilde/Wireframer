/**
 * workersUpdateParticles.js - Particle Position and Alpha Updater
 *
 * PURPOSE:
 *   Updates particle positions (velocity integration with screen wrapping)
 *   and computes pulsing alpha values based on time and particle phase.
 *   Used by both the main-thread fallback and the background worker.
 *
 * ARCHITECTURE ROLE:
 *   Called by the background renderer (main thread) and the background
 *   worker to update particle state each frame. Shared between both
 *   execution contexts.
 *
 * WHY THIS EXISTS:
 *   Documents shared update logic and ensures the file is fully compliant
 *   with the repository's header style.
 *
 * DETAILS:
 *   - Wraps particles at screen edges (+4px margin)
 *   - Computes pulsing alpha using sin wave based on time and particle phase
 *   - Applies velocity scale, opacity scale, and theme alpha boost
 */

"use strict";

/**
 * workersUpdateParticles - Updates particle positions and alpha values
 *
 * @param {Array<Object>} particles - Array of particle objects to update (mutated in place)
 * @param {number} w - Canvas width for edge wrapping
 * @param {number} h - Canvas height for edge wrapping
 * @param {number} now - Current timestamp in milliseconds
 * @param {number} velScale - Velocity multiplier for speed control
 * @param {number} opacityScale - Opacity multiplier from density settings
 * @param {number} themeAlphaBoost - Alpha boost factor for light theme visibility
 * @returns {void}
 */
export function workersUpdateParticles(particles, w, h, now, velScale, opacityScale, options = {}) {
  const { themeAlphaBoost = 1, mode = 'cpu' } = options;
  for (const p of particles) {
    // Integrate position by velocity
    p.x += p.vx * velScale;
    p.y += p.vy * velScale;

    // Wrap particles at screen edges with small margin
    if (p.x < -4) p.x = w + 4;
    else if (p.x > w + 4) p.x = -4;
    if (p.y < -4) p.y = h + 4;
    else if (p.y > h + 4) p.y = -4;

    // Compute pulsing alpha based on time and particle phase
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 * p.speed + p.phase);

    // Apply GPU mode boost for better visibility while still respecting opacity control.
    const modeAlphaBoost = (mode === 'gpu') ? 1.2 : 1;
    const pulseScale = (mode === 'gpu') ? 0.2 : 0.14;

    // Combine base alpha, pulse, and scaling factors (clamped to [0,1]).
    p.alpha = Math.min(1, (p.alphaBase + pulse * pulseScale * modeAlphaBoost) * opacityScale * themeAlphaBoost);
  }
}
