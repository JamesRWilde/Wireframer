/**
 * mvec.js - Matrix-Vector Multiplication
 * 
 * PURPOSE:
 *   Multiplies a 3x3 matrix by a 3D vector, producing a transformed 3D vector.
 *   This is the fundamental operation for applying rotations to vertices.
 * 
 * ARCHITECTURE ROLE:
 *   Used throughout the rendering pipeline to transform vertices from model
 *   space to world space using the rotation matrix.
 * 
 * MATHEMATICAL BASIS:
 *   For matrix M and vector p, the result is:
 *   result[i] = Σ(M[i][j] * p[j]) for j = 0..2
 *   
 *   This is equivalent to: result = M * p
 */

/**
 * mvec - Multiplies a 3x3 matrix by a 3D vector
 * 
 * @param {Array<number>} M - 3x3 matrix as flat 9-element array
 *   Layout: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 * @param {Array<number>} p - 3D vector [x, y, z]
 * 
 * @returns {Array<number>} Transformed 3D vector [x', y', z']
 *   Each component is the dot product of a matrix row with the input vector
 */
export function mvec(M, p) {
  // Compute each component of the result vector
  // Each is the dot product of a matrix row with the input vector
  return [
    M[0]*p[0]+M[1]*p[1]+M[2]*p[2],  // X' = row0 · p
    M[3]*p[0]+M[4]*p[1]+M[5]*p[2],  // Y' = row1 · p
    M[6]*p[0]+M[7]*p[1]+M[8]*p[2],  // Z' = row2 · p
  ];
}
