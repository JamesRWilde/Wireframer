/**
 * cross.js - 3D Vector Cross Product
 * 
 * PURPOSE:
 *   Computes the cross product of two 3D vectors. The cross product produces
 *   a vector perpendicular to both input vectors, with magnitude equal to
 *   the area of the parallelogram formed by the inputs.
 * 
 * ARCHITECTURE ROLE:
 *   Used by mesh processing algorithms that need to compute face normals,
 *   determine orientation, or perform other geometric calculations.
 * 
 * MATHEMATICAL BASIS:
 *   For vectors a = [ax, ay, az] and b = [bx, by, bz]:
 *   a × b = [ay*bz - az*by, az*bx - ax*bz, ax*by - ay*bx]
 *   
 *   Properties:
 *   - Perpendicular to both a and b
 *   - |a × b| = |a| * |b| * sin(θ) (area of parallelogram)
 *   - a × b = -(b × a) (anti-commutative)
 */

"use strict";

/**
 * cross - Computes the cross product of two 3D vectors
 * 
 * @param {Array<number>} a - First vector [x, y, z]
 * @param {Array<number>} b - Second vector [x, y, z]
 * 
 * @returns {Array<number>} Cross product vector [x, y, z]
 *   This vector is perpendicular to both a and b
 */
export function cross(a, b) {
  return [
    a[1]*b[2] - a[2]*b[1],  // x = ay*bz - az*by
    a[2]*b[0] - a[0]*b[2],  // y = az*bx - ax*bz
    a[0]*b[1] - a[1]*b[0],  // z = ax*by - ay*bx
  ];
}
