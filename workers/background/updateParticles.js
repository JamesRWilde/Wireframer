"use strict";

"use strict";

"use strict";

/**
 * updateParticles.js - Particle Position and Alpha Updater
 *
 * PURPOSE:
 *   Updates particle positions, wraps them around canvas edges, and updates alpha
 *   to create a pulsing effect.
 *
 * ARCHITECTURE ROLE:
 *   Used by the background worker to keep the particle system animated and
 *   produce per-frame particle state for rendering.
 *
 * DATA FORMAT:
 *   - particles: array of particle objects { x, y, vx, vy, speed, phase, alphaBase, alpha }
 *   - state: contains canvas width/height and themeMode (light/dark)
 *
 * @param {Array<Object>} particles - Array of particle objects
 * @param {Object} state - State object with width, height, themeMode
 * @param {number} now - Current timestamp
 * @param {number} velScale - Velocity scale factor
 * @param {number} opacityScale - Opacity scale factor
 * @returns {void}
 */

"use strict";

export function updateParticles(particles, state, now, velScale, opacityScale) {
  const themeAlphaBoost = state.themeMode === 'light' ? 1.75 : 1;
  for (const p of particles) {
    // Update position based on velocity and scale
    p.x += p.vx * velScale;
    p.y += p.vy * velScale;
    // Wrap at edges with a small buffer so particles re-enter smoothly.
    if (p.x < -4) p.x = state.width + 4;
    else if (p.x > state.width + 4) p.x = -4;
    if (p.y < -4) p.y = state.height + 4;
    else if (p.y > state.height + 4) p.y = -4;
    // Compute pulsing alpha
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 * p.speed + p.phase);
    p.alpha = (p.alphaBase + pulse * 0.14) * opacityScale * themeAlphaBoost;
  }
}
