/**
 * particles.js - Particle Array Initializer
 *
 * PURPOSE:
 *   Initializes the global particles array based on the current state.
 *   Used in the background worker to seed or reseed the particle system.
 *
 * ARCHITECTURE ROLE:
 *   Creates the initial particle pool that is later updated and packed for rendering.
 *   Particle count is determined by canvas size and user-configurable density.
 *
 * WHY THIS EXISTS:
 *   Clarifies purpose for the particle initializer and meets header standard.
 *
 * DATA FORMAT:
 *   - particles: populated with objects { x, y, vx, vy, size, alphaBase, phase, speed }
 *
 * @param {Object} state - State object with width, height, density, speed
 * @param {Array<Object>} particles - The array to populate with particle objects
 * @returns {void}
 */

"use strict";

export function workersParticles(state, particles) {
  particles.length = 0;
  // Base count: roughly 1 particle per 45000 pixels, with a minimum to avoid emptiness.
  const baseCount = Math.max(8, Math.round((state.width * state.height) / 45000));
  // Apply density multiplier (user-controlled 0-1 value) to scale particle count.
  const densityMult = state.density * 1.6;
  const count = Math.max(0, Math.round(baseCount * densityMult));

  // Scale based on mode: GPU gets stronger visibility and more particles by default.
  const isGpuMode = state.mode === 'gpu';
  const baseSize = isGpuMode ? 2.6 : 1.6;
  const sizeVariance = isGpuMode ? 2.1 : 1.8;
  const opacityBaseMin = isGpuMode ? 0.5 : 0.28;
  const opacityBaseMax = isGpuMode ? 0.95 : 0.85;

  for (let i = 0; i < count; i++) {
    // Random angle and speed for motion
    const angle = Math.random() * Math.PI * 2;
    const spd = (0.2 + Math.random() * 0.8) * state.speed;
    particles.push({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      size: baseSize + Math.random() * sizeVariance,
      alphaBase: opacityBaseMin + Math.random() * (opacityBaseMax - opacityBaseMin),
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.7
    });
  }
}
