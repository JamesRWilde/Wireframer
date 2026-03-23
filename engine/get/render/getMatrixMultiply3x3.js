/**
 * mmul.js - 3x3 Matrix Multiplication
 * 
 * PURPOSE:
 *   Multiplies two 3x3 matrices represented as flat 9-element arrays.
 *   This is the fundamental operation for combining rotations in 3D space.
 * 
 * ARCHITECTURE ROLE:
 *   Used by rotationInitialize() to combine rotation matrices, and available
 *   for any other matrix composition needs.
 * 
 * MATRIX LAYOUT:
 *   Matrices are stored as flat arrays in row-major order:
 *   [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 *   
 *   Where m[row][col] = array[row * 3 + col]
 */

"use strict";

/**
 * mmul - Multiplies two 3x3 matrices
 * 
 * @param {Array<number>} A - First 3x3 matrix as flat 9-element array
 * @param {Array<number>} B - Second 3x3 matrix as flat 9-element array
 * 
 * @returns {Array<number>} Result matrix C = A * B (new 9-element array)
 * 
 * The multiplication follows standard matrix multiplication rules:
 * C[i][j] = Σ(A[i][k] * B[k][j]) for k = 0..2
 */
export function getMatrixMultiply3x3(A, B) {
  // Compute each element of the result matrix
  // Row 0: dot products of row 0 of A with columns of B
  return [
    A[0]*B[0]+A[1]*B[3]+A[2]*B[6], A[0]*B[1]+A[1]*B[4]+A[2]*B[7], A[0]*B[2]+A[1]*B[5]+A[2]*B[8],
    // Row 1: dot products of row 1 of A with columns of B
    A[3]*B[0]+A[4]*B[3]+A[5]*B[6], A[3]*B[1]+A[4]*B[4]+A[5]*B[7], A[3]*B[2]+A[4]*B[5]+A[5]*B[8],
    // Row 2: dot products of row 2 of A with columns of B
    A[6]*B[0]+A[7]*B[3]+A[8]*B[6], A[6]*B[1]+A[7]*B[4]+A[8]*B[7], A[6]*B[2]+A[7]*B[5]+A[8]*B[8],
  ];
}
