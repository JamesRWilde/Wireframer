/**
 * createParticle.js - Background Particle Factory
 *
 * PURPOSE:
 *   Creates a single particle object with randomized position, velocity,
 *   size, alpha, and phase for background animation effects.
 *
 * ARCHITECTURE ROLE:
 *   Called by seedParticles to populate the background particle array.
 *   Each particle represents a floating dot that drifts across the
 *   background canvas with pulsing opacity.
 */

"use strict";

/**
 * createParticle - Creates a new particle with random properties
 *
 * @param {number} w - Canvas width for random X positioning
 * @param {number} h - Canvas height for random Y positioning
 * @param {number} [velocityScale=1] - Multiplier for particle velocity
 * @returns {Object} Particle object with x, y, vx, vy, size, alphaBase, phase, speed, alpha
 */
export function createParticle(w, h, velocityScale = 1) {
  // Random speed between 0.2 and 1.0
  const speed = 0.2 + Math.random() * 0.8;

  // Random direction uniformly distributed across 360 degrees
  const angle = (Math.random() - 0.5) * Math.PI * 2;

  // Convert polar velocity to Cartesian components
  const vx = Math.cos(angle) * speed * velocityScale;
  const vy = Math.sin(angle) * speed * velocityScale;

  return {
    x: Math.random() * w,               // Random starting X position
    y: Math.random() * h,               // Random starting Y position
    vx,                                  // X velocity component
    vy,                                  // Y velocity component
    size: 0.5 + Math.random() * 1.6,    // Random radius (0.5 to 2.1 px)
    alphaBase: 0.2 + Math.random() * 0.8, // Base opacity (0.2 to 1.0)
    phase: Math.random() * Math.PI * 2, // Random phase offset for pulsing
    speed,                               // Speed magnitude for pulse frequency
    alpha: 0,                            // Current opacity (updated each frame)
  };
}
