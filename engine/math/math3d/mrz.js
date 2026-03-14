/**
 * mrz.js - Z-Axis Rotation Matrix Constructor
 * 
 * PURPOSE:
 *   Creates a 3x3 rotation matrix for rotation around the Z axis.
 *   This is one of the three fundamental rotation matrices used to
 *   construct arbitrary 3D rotations via Euler angles.
 * 
 * ARCHITECTURE ROLE:
 *   Available for any code that needs Z-axis rotation. While the initial
 *   rotation setup uses X and Y axes, Z rotation is available for
 *   more complex rotation sequences.
 * 
 * MATHEMATICAL BASIS:
 *   The rotation matrix for angle θ around the Z axis is:
 *   [cos(θ), -sin(θ), 0]
 *   [sin(θ),  cos(θ), 0]
 *   [  0,       0,    1]
 * 
 *   This rotates points in the XY plane while leaving Z unchanged.
 */

"use strict";

/**
 * mrz - Creates a 3x3 rotation matrix for Z-axis rotation
 * 
 * @param {number} a - Rotation angle in radians
 *   Positive angles rotate counter-clockwise when looking down the Z axis
 * 
 * @returns {Array<number>} 3x3 rotation matrix as flat 9-element array
 *   Layout: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 */
export function mrz(a) {
  // Precompute cosine and sine (used twice each)
  const c = Math.cos(a), s = Math.sin(a);
  
  // Return the rotation matrix in row-major order
  // Row 0: [c, -s, 0] - X axis rotates toward -Y
  // Row 1: [s, c, 0] - Y axis rotates toward +X
  // Row 2: [0, 0, 1] - Z axis is unchanged
  return [c,-s,0, s,c,0, 0,0,1];
}
