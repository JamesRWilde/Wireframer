/**
 * randomFloat.js - Random float in range
 *
 * One function per file module.
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
