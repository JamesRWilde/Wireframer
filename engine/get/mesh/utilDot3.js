/**
 * dot3.js - 3D Vector Dot Product
 *
 * PURPOSE:
 *   Computes the dot product of two 3D vectors. Used for angle checks,
 *   projection calculations, and winding direction detection.
 *
 * ARCHITECTURE ROLE:
 *   General-purpose vector math utility used by mesh analysis functions
 *   (fixWinding) and any code that needs to compare vector directions.
 */

"use strict";

/**
 * dot3 - Computes the dot product of two 3D vectors.
 *
 * Returns a·b = |a||b|cos(θ). Positive when vectors point in the same
 * direction, negative when opposed, zero when perpendicular.
 *
 * @param {number[]} a - First vector [x, y, z]
 * @param {number[]} b - Second vector [x, y, z]
 * @returns {number} Dot product a·b
 */
export function utilDot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
