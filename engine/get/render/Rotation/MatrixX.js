/**
 * mrx.js - X-Axis Rotation Matrix Constructor
 * 
 * PURPOSE:
 *   Creates a 3x3 rotation matrix for rotation around the X axis.
 *   This is one of the three fundamental rotation matrices used to
 *   construct arbitrary 3D rotations via Euler angles.
 * 
 * ARCHITECTURE ROLE:
 *   Used by rotationInitialize() to set up the initial model orientation.
 *   Available for any code that needs X-axis rotation.
 * 
 * MATHEMATICAL BASIS:
 *   The rotation matrix for angle θ around the X axis is:
 *   [1,    0,     0   ]
 *   [0,  cos(θ), -sin(θ)]
 *   [0,  sin(θ),  cos(θ)]
 * 
 *   This rotates points in the YZ plane while leaving X unchanged.
 */

"use strict";

/**
 * mrx - Creates a 3x3 rotation matrix for X-axis rotation
 * 
 * @param {number} a - Rotation angle in radians
 *   Positive angles rotate counter-clockwise when looking down the X axis
 * 
 * @returns {Array<number>} 3x3 rotation matrix as flat 9-element array
 *   Layout: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 */
export function renderEngineRotationMatrixX(a) {
  // Precompute cosine and sine (used twice each)
  const c = Math.cos(a), s = Math.sin(a);
  
  // Return the rotation matrix in row-major order
  // Row 0: [1, 0, 0] - X axis is unchanged
  // Row 1: [0, c, -s] - Y axis rotates toward -Z
  // Row 2: [0, s, c] - Z axis rotates toward +Y
  return [1,0,0, 0,c,-s, 0,s,c];
}
