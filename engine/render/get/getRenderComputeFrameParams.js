/**
 * computeFrameParams.js - Model Frame Parameter Calculation
 * 
 * PURPOSE:
 *   Computes framing parameters for model projection.
 *   Calculates vertical center (cy) and depth extent (zHalf) for proper framing.
 * 
 * ARCHITECTURE ROLE:
 *   Called when model changes to compute projection parameters.
 *   These parameters are used by projection and zoom calculations.
 * 
 * PARAMETERS EXPLAINED:
 *   - cy: Vertical center of model (used to center model in viewport)
 *   - zHalf: Half-depth of bounding sphere (used for zoom and depth scaling)
 */

/**
 * computeFrameParams - Computes framing parameters from vertex array
 * 
 * @param {Array<Array<number>>} vertices - Array of 3D vertex positions [x, y, z]
 * 
 * @returns {{ cy: number, zHalf: number }}
 *   cy: Vertical center of model
 *   zHalf: Half-depth of bounding sphere (with 5% padding)
 * 
 * The function:
 * 1. Returns defaults if vertices array is empty
 * 2. Finds Y bounds for vertical center calculation
 * 3. Finds maximum distance from origin for bounding sphere
 * 4. Adds 5% padding to zHalf for comfortable framing
 */
export function getRenderComputeFrameParams(vertices) {
  // Return defaults if no vertices
  if (!Array.isArray(vertices) || vertices.length === 0) {
    return { cy: 0, zHalf: 1 };
  }
  
  // Track Y bounds and maximum squared distance
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let maxD2 = 0;
  
  // Single pass through vertices to compute all bounds
  for (const v of vertices) {
    // Track Y bounds for vertical center
    if (v[1] < minY) minY = v[1];
    if (v[1] > maxY) maxY = v[1];
    
    // Track Z bounds (not directly used, but computed for completeness)
    if (v[2] < minZ) minZ = v[2];
    if (v[2] > maxZ) maxZ = v[2];
    
    // Track maximum squared distance from origin
    const d2 = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
    if (d2 > maxD2) maxD2 = d2;
  }
  
  // Calculate vertical center (midpoint of Y range)
  const cy = (minY + maxY) * 0.5;
  
  // Calculate half-depth with 5% padding for comfortable framing
  const zHalf = Math.sqrt(maxD2) * 1.05;
  
  return { cy, zHalf };
}