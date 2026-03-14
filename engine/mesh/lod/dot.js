/**
 * dot.js - 3D Vector Dot Product
 * 
 * PURPOSE:
 *   Computes the dot product of two 3D vectors. The dot product measures
 *   how much two vectors point in the same direction, and is used
 *   extensively in geometric calculations.
 * 
 * ARCHITECTURE ROLE:
 *   Used by mesh processing algorithms for normal calculations, angle
 *   computations, and projection operations.
 * 
 * MATHEMATICAL BASIS:
 *   For vectors a = [ax, ay, az] and b = [bx, by, bz]:
 *   a · b = ax*bx + ay*by + az*bz
 *   
 *   Properties:
 *   - a · b = |a| * |b| * cos(θ)
 *   - a · b = 0 if a and b are perpendicular
 *   - a · a = |a|² (squared magnitude)
 */

"use strict";

/**
 * dot - Computes the dot product of two 3D vectors
 * 
 * @param {Array<number>} a - First vector [x, y, z]
 * @param {Array<number>} b - Second vector [x, y, z]
 * 
 * @returns {number} The dot product (scalar)
 */
export function dot(a, b) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}
