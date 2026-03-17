/**
 * InitMeshEngineNormalizeFaces.js - Face Format Normalization
 * 
 * PURPOSE:
 *   Normalizes face data to a consistent format for processing. Some mesh
 *   formats store faces as simple index arrays, while others use objects
 *   with an 'indices' property. This function ensures all faces are in
 *   the simple array format.
 * 
 * ARCHITECTURE ROLE:
 *   Called by LOD algorithms to ensure consistent face format before
 *   processing. This prevents errors from format mismatches.
 * 
 * WHY NORMALIZE:
 *   Different mesh parsers may produce different face formats. By
 *   normalizing to a single format, we simplify downstream processing
 *   and avoid format-specific code paths.
 */

"use strict";

/**
 * InitMeshEngineNormalizeFaces - Normalizes face data to consistent array format
 * 
 * @param {Array} F - Face data (either arrays or objects with indices)
 * 
 * @returns {Array<Array<number>>} Normalized faces as arrays of vertex indices
 * 
 * Handles two formats:
 * 1. Simple arrays: [[0,1,2], [1,2,3], ...]
 * 2. Objects with indices: [{indices: [0,1,2]}, {indices: [1,2,3]}, ...]
 */
export function meshEngineNormalizeFaces(F) {
  // Guard: return empty array if input is invalid
  if (!Array.isArray(F) || F.length === 0) return [];
  
  // Check format by examining first face
  const first = F[0];
  
  // If faces are objects with 'indices' property, extract indices
  if (first && typeof first === 'object' && 'indices' in first) {
    return F.map(f => f.indices);
  }
  
  // Otherwise, faces are already in array format
  return F;
}
