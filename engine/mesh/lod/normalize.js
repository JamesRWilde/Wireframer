/**
 * normalize.js - 3D Vector Normalization
 * 
 * PURPOSE:
 *   Normalizes a 3D vector to unit length (magnitude of 1). This is a
 *   fundamental operation in 3D graphics, used for direction vectors,
 *   normals, and other quantities where only direction matters.
 * 
 * ARCHITECTURE ROLE:
 *   Used by mesh processing algorithms that need unit-length vectors,
 *   particularly for normal calculations in the LOD system.
 * 
 * MATHEMATICAL BASIS:
 *   For vector v = [x, y, z] with magnitude |v| = sqrt(x² + y² + z²):
 *   normalized(v) = v / |v| = [x/|v|, y/|v|, z/|v|]
 *   
 *   The result has the same direction as v but magnitude 1.
 */

"use strict";

/**
 * normalize - Normalizes a 3D vector to unit length
 * 
 * @param {Array<number>} v - Input vector [x, y, z]
 * 
 * @returns {Array<number>} Normalized vector [x, y, z] with magnitude 1
 *   Returns [0, 0, 0] if input is zero vector (with fallback to 1 to avoid division by zero)
 */
export function normalize(v) {
  // Compute vector magnitude
  // Use || 1 fallback to avoid division by zero for zero vectors
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  
  // Divide each component by magnitude to get unit vector
  return [v[0]/len, v[1]/len, v[2]/len];
}
