/**
 * computeMeshCenter.js - Mesh Center Calculation
 * 
 * PURPOSE:
 *   Computes the centroid (average position) of all vertices in a mesh.
 *   Used for normal orientation in face normal computation.
 * 
 * ARCHITECTURE ROLE:
 *   Called by classifyEdges to get mesh center for normal orientation.
 *   Provides reference point for determining normal direction.
 */

"use strict";

/**
 * computeMeshCenter - Computes centroid of mesh vertices
 * 
 * @param {Array<Array<number>>} T - Transformed vertex positions in view space
 * 
 * @returns {Array<number>} Mesh center [cx, cy, cz]
 * 
 * The function:
 * 1. Sums all vertex positions
 * 2. Divides by vertex count to get average
 * 3. Returns centroid position
 */
export function computeMeshCenter(T) {
  const center = [0, 0, 0];
  
  // Sum all vertex positions
  for (const v of T) {
    center[0] += v[0];
    center[1] += v[1];
    center[2] += v[2];
  }
  
  // Divide by count to get average (centroid)
  const inv = 1 / T.length;
  center[0] *= inv;
  center[1] *= inv;
  center[2] *= inv;
  
  return center;
}
