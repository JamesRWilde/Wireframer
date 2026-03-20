/**
 * seedParticles.js - Background Particle Seeder
 *
 * PURPOSE:
 *   Populates the background particle array with the correct number of
 *   particles based on canvas size, density settings, and velocity scale.
 *   Handles reseeding when density or canvas size changes.
 *
 * ARCHITECTURE ROLE:
 *   Called by the background renderer before particle updates. Computes
 *   the target particle count from viewport area and density percentage,
 *   then creates particles using createParticle().
 *
 * DETAILS:
 *   Tracks the last canvas size and density to avoid unnecessary reseeding.
 *   Returns scaling factors for velocity, opacity, and theme alpha boost.
 */

"use strict";

// Import particle factory for creating individual particles
import { createParticle }from '@engine/init/render/createParticle.js';

// Import centralized render state
import { getThemeMode } from '@engine/get/render/themeMode.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';

/** Maximum density multiplier to cap particle count */
const MAX_DENSITY_MULT = 1.6;

/** Maximum velocity multiplier to cap particle speed */
const MAX_VELOCITY_MULT = 1;

// Track previous sizing to detect changes requiring reseed
let lastSize = { w: 0, h: 0 };
let lastDensity = 1;

/**
 * seedParticles - Seeds or reseeds the background particle array
 *
 * @param {Array<Object>} particles - The particle array to populate (mutated in place)
 * @param {number} w - Canvas width in pixels
 * @param {number} h - Canvas height in pixels
 * @returns {Object} Rendering parameters { velScale, opacityScale, themeAlphaBoost }
 */
export function seedParticles(particles, w, h) {
  // Compute base particle count from canvas area (1 particle per ~45000 px^2)
  const baseCount = Math.max(8, Math.round((w * h) / 45000));

  // Read user density and velocity settings
  const densityPct = bgState.densityPct;
  const density = densityPct * MAX_DENSITY_MULT;
  const velocityPct = bgState.velocityPct;
  const velocityScale = velocityPct * MAX_VELOCITY_MULT;

  // Determine if reseeding is needed
  const mustReseed = density !== lastDensity;
  const sizeChanged = lastSize.w !== w || lastSize.h !== h;

  // Reseed if density changed, canvas resized, or particles are empty
  if (mustReseed || !particles.length || sizeChanged) {
    particles.length = 0;
    const count = Math.max(0, Math.round(baseCount * density));
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(w, h, velocityScale));
    }
    lastSize = { w, h };
    lastDensity = density;
  }

  // Compute per-frame scaling factors
  const velScale = velocityPct * MAX_VELOCITY_MULT;
  const opacityScale = bgState.opacityPct * 1;
  // Light theme needs higher alpha to be visible against light backgrounds
  const themeAlphaBoost = getThemeMode() === 'light' ? 1.75 : 1;

  return { velScale, opacityScale, themeAlphaBoost };
}
