/**
 * clusterVertices.js - Vertex Clustering and Merging
 * 
 * PURPOSE:
 *   Merges vertices within each spatial grid cell by computing their average
 *   position. This is the core operation of the greedy cluster decimation
 *   algorithm, reducing vertex count by combining nearby vertices.
 * 
 * ARCHITECTURE ROLE:
 *   Called by greedyClusterDecimator after vertices have been assigned to
 *   spatial cells. Produces the new vertex array and a mapping from old
 *   to new vertex indices.
 *
 * WHY THIS EXISTS:
 *   Encapsulates cluster merge semantics so vertex clustering behavior is
 *   consistent and testable separate from the higher-level decimation flow.
 *
 * HOW IT WORKS:
 *   1. For each cell, compute the average position of all vertices in it
 *   2. Create a new vertex at the average position
 *   3. Map all old vertex indices to the new vertex index
 *   4. Return the new vertex array and the old-to-new mapping
 * 
 * WHY AVERAGE POSITION:
 *   Using the average (centroid) position minimizes the total squared
 *   distance from the original vertices to the merged vertex. This
 *   preserves the mesh's overall shape while reducing complexity.
 */

"use strict";

/**
 * clusterVertices - Merges vertices within spatial cells
 * 
 * @param {Array<Array<number>>} V - Original vertex positions array
 * @param {Map<string, Array<number>>} cellMap - Map from cell keys to vertex indices
 * 
 * @returns {{ newVerts: Array<Array<number>>, oldToNew: Map<number, number> }}
 *   newVerts: Array of merged vertex positions
 *   oldToNew: Map from original vertex indices to new vertex indices
 */
export function clusterVertices(V, cellMap) {
  // Map from old vertex indices to new vertex indices
  const oldToNew = new Map();
  
  // Array of new (merged) vertex positions
  const newVerts = [];

  // Process each cell in the spatial grid
  for (const indices of cellMap.values()) {
    // Skip empty cells
    if (!indices.length) continue;

    // Compute sum of positions for all vertices in this cell
    let sx = 0;
    let sy = 0;
    let sz = 0;
    for (const idx of indices) {
      sx += V[idx][0];
      sy += V[idx][1];
      sz += V[idx][2];
    }

    // Create new vertex at average position (centroid)
    const newIdx = newVerts.length;
    newVerts.push([sx / indices.length, sy / indices.length, sz / indices.length]);
    
    // Map all old vertex indices to the new vertex index
    for (const idx of indices) oldToNew.set(idx, newIdx);
  }

  return { newVerts, oldToNew };
}
