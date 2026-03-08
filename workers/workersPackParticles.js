/**
 * packParticles.js - Particle Data Packer
 *
 * PURPOSE:
 *   Packs the particle array into a Float32Array for transfer to the main thread.
 *   Used in the background worker to efficiently send particle data for rendering.
 *
 * ARCHITECTURE ROLE:
 *   Utility for background-worker.js. Converts an array of particle objects
 *   into a flat, transferable buffer for fast communication with the main thread.
 *
 * HOW IT WORKS:
 *   1. Allocates a Float32Array of length 4 * particle count
 *   2. For each particle, writes x, y, size, and alpha to the array
 *   3. Alpha is taken from p.alpha if present, else p.alphaBase, else 0.5
 *   4. Returns the packed Float32Array for transfer
 *
 * @param {Array<Object>} particles - Array of particle objects
 *   Each particle should have x, y, size, and alpha/alphaBase properties.
 * @returns {Float32Array} Packed particle data [x, y, size, alpha, ...]
 *   Flat array suitable for transfer to main thread for rendering.
 */

"use strict";

export function workersPackParticles(particles) {
  // Allocate buffer: 4 floats per particle (x, y, size, alpha)
  const data = new Float32Array(particles.length * 4);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const idx = i * 4;
    // Write position
    data[idx] = p.x;
    data[idx + 1] = p.y;
    // Write size
    data[idx + 2] = p.size;
    // Write alpha (fallback to alphaBase or 0.5 if missing)
    data[idx + 3] = p.alpha ?? p.alphaBase ?? 0.5;
  }
  return data;
}
