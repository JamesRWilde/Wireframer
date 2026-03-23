/**
 * getRowMajorRotation.js - Rotation Matrix Format Validator
 *
 * PURPOSE:
 *   Validates that a rotation matrix is a proper 9-element array and
 *   returns it as-is, or returns a 3x3 identity matrix if the input
 *   is invalid or not an array.
 *
 * ARCHITECTURE ROLE:
 *   Called by sceneModel.js before uploading rotation uniforms to
 *   the GPU. Ensures a valid rotation matrix is always used, even
 *   if the physics state hasn't been initialized yet.
 *
 * DETAILS:
 *   Uses a shared identity matrix constant to avoid per-call allocation.
 */

"use strict";

/** 3x3 identity matrix (row-major) used as fallback */
const IDENTITY3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

/**
 * getRowMajorRotation - Returns a valid row-major rotation matrix
 *
 * @param {Array<number>|null|undefined} m - Potential 3x3 rotation matrix
 * @returns {Array<number>} The input matrix if valid (length 9), or identity matrix
 */
export function getRowMajorRotation(m) {
  return Array.isArray(m) && m.length === 9 ? m : IDENTITY3;
}
