/**
 * reorthogonalize.js - Rotation Matrix Gram-Schmidt Reorthogonalization
 * 
 * PURPOSE:
 *   Corrects numerical drift in a rotation matrix by re-orthogonalizing it
 *   using the Gram-Schmidt process. Over time, floating-point errors accumulate
 *   causing the matrix to deviate from being a pure rotation (introducing
 *   skewing and scaling). This function restores the matrix to a proper
 *   orthonormal rotation matrix.
 * 
 * ARCHITECTURE ROLE:
 *   Called periodically by SetEnginePhysics() (every 120 frames) to prevent
 *   visual artifacts from accumulated numerical errors.
 * 
 * MATHEMATICAL BASIS:
 *   Uses Gram-Schmidt orthogonalization:
 *   1. Normalize the first row (X axis)
 *   2. Make the second row (Y axis) perpendicular to X, then normalize
 *   3. Compute the third row (Z axis) as the cross product of X and Y
 *   
 *   This ensures the matrix is orthonormal (all rows are unit vectors
 *   and perpendicular to each other).
 */

"use strict";

/**
 * reorthogonalize - Restores a rotation matrix to orthonormal form
 * 
 * @param {Array<number>} R - 3x3 rotation matrix as flat array (may have drifted)
 *   Expected layout: [x0,x1,x2, y0,y1,y2, z0,z1,z2] (rows of the matrix)
 * 
 * @returns {Array<number>} Orthonormal 3x3 rotation matrix (new array)
 *   Returns identity matrix if input is invalid
 * 
 * The function:
 * 1. Validates input (returns identity if invalid)
 * 2. Extracts and normalizes the X axis (first row)
 * 3. Makes Y axis perpendicular to X, then normalizes
 * 4. Computes Z axis as cross product of X and Y (already unit length)
 */
export function GetRenderEngineReorthogonalize(R) {
  // Guard: return identity matrix if input is invalid
  if (!R || !Array.isArray(R) || R.length < 6) {
    return [1,0,0,0,1,0,0,0,1];
  }
  
  // Extract the X and Y axes (first two rows of the matrix)
  let x = [R[0],R[1],R[2]], y = [R[3],R[4],R[5]];
  
  // Step 1: Normalize the X axis
  // Compute length and divide each component
  const nx = Math.hypot(...x);
  x = x.map(v => v / nx);
  
  // Step 2: Make Y axis perpendicular to X (Gram-Schmidt)
  // Compute the projection of Y onto X
  const d = x[0]*y[0] + x[1]*y[1] + x[2]*y[2];
  // Subtract the projection to get the perpendicular component
  y = y.map((v, i) => v - d * x[i]);
  
  // Normalize the perpendicular Y axis
  const ny = Math.hypot(...y);
  y = y.map(v => v / ny);
  
  // Step 3: Compute Z axis as cross product of X and Y
  // This is already unit length if X and Y are orthonormal
  const z = [
    x[1]*y[2]-x[2]*y[1],  // Z.x = X.y * Y.z - X.z * Y.y
    x[2]*y[0]-x[0]*y[2],  // Z.y = X.z * Y.x - X.x * Y.z
    x[0]*y[1]-x[1]*y[0]   // Z.z = X.x * Y.y - X.y * Y.x
  ];
  
  // Return the reorthogonalized matrix
  return [...x, ...y, ...z];
}
