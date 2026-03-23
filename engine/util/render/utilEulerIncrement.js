/**
 * applyEulerIncrementInPlace.js - Euler Angle Rotation Application
 * 
 * PURPOSE:
 *   Applies incremental Euler angle rotations to a 3x3 rotation matrix in-place.
 *   This is the core rotation update function called each frame by the physics
 *   system to rotate the model based on angular velocities.
 * 
 * ARCHITECTURE ROLE:
 *   Called by physics() each frame to apply angular velocity increments
 *   to the rotation matrix. Modifies the matrix in-place for performance.
 * 
 * WHY THIS EXISTS:
 *   Modifying the matrix in-place avoids allocating new arrays each frame,
 *   which reduces garbage collection pressure and improves performance.
 *
 * MATHEMATICAL BASIS:
 *   Constructs a combined rotation matrix M = Ry * Rx * Rz from the Euler angles,
 *   then multiplies it with the existing rotation matrix: R = M * R
 *   This applies the incremental rotation in the model's local coordinate space.
 */

"use strict";

/**
 * applyEulerIncrementInPlace - Applies Euler angle rotation to a matrix in-place
 * 
 * @param {Array<number>} R - 3x3 rotation matrix as flat array [m00,m01,m02,m10,m11,m12,m20,m21,m22]
 *   This matrix is modified in-place (not copied)
 * @param {number} ax - Rotation angle around X axis (radians)
 * @param {number} ay - Rotation angle around Y axis (radians)
 * @param {number} az - Rotation angle around Z axis (radians)
 * 
 * @returns {Array<number>} The same R matrix (for chaining)
 * 
 * Early returns:
 * - If R is not a 9-element array, returns R unchanged
 * - If all angles are zero or non-finite, returns R unchanged (optimization)
 */
export function utilEulerIncrement(R, ax, ay, az) {
  // Guard: ensure R is a valid 3x3 matrix (9 elements)
  if (R?.length !== 9) return R;
  
  // Optimization: skip computation if all angles are zero or invalid
  // This avoids unnecessary trigonometry when the model isn't rotating
  if ((ax === 0 || !Number.isFinite(ax)) && (ay === 0 || !Number.isFinite(ay)) && (az === 0 || !Number.isFinite(az))) {
    return R;
  }

  // Precompute cosines and sines for all three angles
  // This avoids redundant trig calls in the matrix construction
  const cx = Math.cos(ax), sx = Math.sin(ax);
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const cz = Math.cos(az), sz = Math.sin(az);

  // Construct the combined rotation matrix M = Ry * Rx * Rz
  // This is the standard Euler angle rotation matrix for YXZ order
  // The order matters: YXZ gives intuitive "look around" rotation
  const m00 = cy * cz + sy * sx * sz;
  const m01 = -cy * sz + sy * sx * cz;
  const m02 = sy * cx;

  const m10 = cx * sz;
  const m11 = cx * cz;
  const m12 = -sx;

  const m20 = -sy * cz + cy * sx * sz;
  const m21 = sy * sz + cy * sx * cz;
  const m22 = cy * cx;

  // Cache current matrix values before overwriting
  // We need these for the multiplication but will overwrite R in-place
  const r00 = R[0], r01 = R[1], r02 = R[2];
  const r10 = R[3], r11 = R[4], r12 = R[5];
  const r20 = R[6], r21 = R[7], r22 = R[8];

  // Compute R = M * R (matrix multiplication)
  // Each element is the dot product of a row of M with a column of R
  // Row 0 of result
  R[0] = m00 * r00 + m01 * r10 + m02 * r20;
  R[1] = m00 * r01 + m01 * r11 + m02 * r21;
  R[2] = m00 * r02 + m01 * r12 + m02 * r22;

  // Row 1 of result
  R[3] = m10 * r00 + m11 * r10 + m12 * r20;
  R[4] = m10 * r01 + m11 * r11 + m12 * r21;
  R[5] = m10 * r02 + m11 * r12 + m12 * r22;

  // Row 2 of result
  R[6] = m20 * r00 + m21 * r10 + m22 * r20;
  R[7] = m20 * r01 + m21 * r11 + m22 * r21;
  R[8] = m20 * r02 + m21 * r12 + m22 * r22;

  return R;
}
