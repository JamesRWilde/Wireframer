/**
 * mry.js - Y-Axis Rotation Matrix Constructor
 * 
 * PURPOSE:
 *   Creates a 3x3 rotation matrix for rotation around the Y axis.
 *   This is one of the three fundamental rotation matrices used to
 *   construct arbitrary 3D rotations via Euler angles.
 * 
 * ARCHITECTURE ROLE:
 *   Used by rotationInitialize() to set up the initial model orientation.
 *   Available for any code that needs Y-axis rotation.
 * 
 * WHY THIS EXISTS:
 *   Centralizes Y rotation math in one function to prevent inconsistent
 *   matrix construction and to make rotation inheritance easier to debug.
 * 
 * MATHEMATICAL BASIS:
 *   The rotation matrix for angle θ around the Y axis is:
 *   [ cos(θ), 0, sin(θ)]
 *   [   0,    1,   0   ]
 *   [-sin(θ), 0, cos(θ)]
 * 
 *   This rotates points in the XZ plane while leaving Y unchanged.
 */

"use strict";

/**
 * mry - Creates a 3x3 rotation matrix for Y-axis rotation
 * 
 * @param {number} a - Rotation angle in radians
 *   Positive angles rotate counter-clockwise when looking down the Y axis
 * 
 * @returns {Array<number>} 3x3 rotation matrix as flat 9-element array
 *   Layout: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 */
export function utilMatrixY(a) {
  // Precompute cosine and sine (used twice each)
  const c = Math.cos(a), s = Math.sin(a);
  
  // Return the rotation matrix in row-major order
  // Row 0: [c, 0, s] - X axis rotates toward +Z
  // Row 1: [0, 1, 0] - Y axis is unchanged
  // Row 2: [-s, 0, c] - Z axis rotates toward -X
  return [c,0,s, 0,1,0,-s,0,c];
}
