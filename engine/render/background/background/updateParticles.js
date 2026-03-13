/**
 * updateParticles.js - Particle Animation Module
 * 
 * PURPOSE:
 *   Updates particle positions and alpha values each frame.
 *   Handles wrapping at canvas edges and pulsing alpha animation.
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawBackground each frame to animate particles.
 *   Modifies particle array in place for performance.
 * 
 * ANIMATION DETAILS:
 *   - Particles move at constant velocity with wrapping at edges
 *   - Alpha pulses sinusoidally based on time and particle speed
 *   - 4px buffer zone prevents visible edge artifacts during wrap
 */

/**
 * updateParticles - Updates particle positions and alpha values
 * 
 * @param {Array<Object>} particles - Array of particle objects to update
 * @param {number} w - Canvas width for boundary wrapping
 * @param {number} h - Canvas height for boundary wrapping
 * @param {number} now - Current timestamp in milliseconds (from performance.now())
 * @param {number} velScale - Velocity multiplier from UI slider
 * @param {number} opacityScale - Opacity multiplier from UI slider
 * @param {number} themeAlphaBoost - Theme-specific alpha boost factor
 * 
 * @returns {void}
 * 
 * The function:
 * 1. Updates particle position based on velocity and scale
 * 2. Wraps particles at canvas edges with 4px buffer
 * 3. Computes pulsing alpha using sine wave
 * 4. Applies opacity scale and theme boost to final alpha
 */
export function updateParticles(particles, w, h, now, velScale, opacityScale, themeAlphaBoost) {
  for (const p of particles) {
    // Update position based on velocity and scale factor
    p.x += p.vx * velScale;
    p.y += p.vy * velScale;

    // Wrap particles at canvas edges with 4px buffer zone
    // This prevents visible edge artifacts when particles transition
    if (p.x < -4) p.x = w + 4;
    else if (p.x > w + 4) p.x = -4;
    if (p.y < -4) p.y = h + 4;
    else if (p.y > h + 4) p.y = -4;

    // Compute pulsing alpha using sine wave
    // Each particle pulses at its own speed with its own phase offset
    // This creates organic, non-uniform twinkling effect
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 * p.speed + p.phase);
    
    // Final alpha combines base alpha, pulse, opacity scale, and theme boost
    p.alpha = (p.alphaBase + pulse * 0.14) * opacityScale * themeAlphaBoost;
  }
}
