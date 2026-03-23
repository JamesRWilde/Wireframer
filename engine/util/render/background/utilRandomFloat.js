/**
 * randomFloat.js - Random float in range
 *
 * PURPOSE:
 *   Generates a random float between min (inclusive) and max (exclusive).
 *
 * ARCHITECTURE ROLE:
 *   Used in background particle and mesh animation systems that need
 *   non-deterministic variation for visual richness.
 *
 * WHY THIS EXISTS:
 *   Centralizes random range generation so that all modules produce
 *   consistent random values and easy testability.
 */

"use strict";

/**
 * randomFloat - Generates a random floating-point number in [min, max)
 *
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random float in range [min, max)
 */
export function utilRandomFloat(min, max) {
  return min + Math.random() * (max - min);
}
