/**
 * rebuildFaces.js - Face Reconstruction After Vertex Clustering
 * 
 * PURPOSE:
 *   Rebuilds mesh faces after vertex clustering has merged vertices. This
 *   updates face vertex indices to point to the new merged vertices and
 *   removes degenerate faces (faces with duplicate vertices).
 * 
 * ARCHITECTURE ROLE:
 *   Called by greedyClusterDecimator after vertices have been clustered.
 *   This is the final step that produces the simplified mesh's face list.
 * 
 * HOW IT WORKS:
 *   1. For each face, map old vertex indices to new indices
 *   2. Skip faces that reference removed vertices (undefined mapping)
 *   3. Skip degenerate faces (faces with duplicate vertices)
 *   4. Keep only valid triangles (3 unique vertices)
 * 
 * WHY REMOVE DEGENERATE FACES:
 *   When vertices are merged, some faces may collapse to degenerate
 *   triangles (all vertices the same, or two vertices the same).
 *   These would cause rendering artifacts and should be removed.
 */

"use strict";

import { normalizeFaces } from '@engine/init/mesh/initNormalizeFaces.js';

/**
 * rebuildFaces - Rebuilds faces after vertex clustering
 * 
 * @param {Array<Array<number>>} F - Original face array (triangles)
 * @param {Map<number, number>} oldToNew - Map from old to new vertex indices
 * 
 * @returns {Array<Array<number>>} New face array with updated indices
 *   Degenerate faces are removed
 */
export function rebuildFaces(F, oldToNew) {
  const newFaces = [];
  const normalizedF = normalizeFaces(F);
  if (!Array.isArray(normalizedF) || normalizedF.length === 0) return newFaces;

  // Process each face
  for (const face of normalizedF) {
    // Support face entries as arrays only
    if (!Array.isArray(face)) continue;

    // Map old vertex indices to new indices
    const tri = face.map(idx => oldToNew.get(idx));

    // Skip faces with undefined mappings (vertex was removed)
    if (tri.includes(undefined)) continue;

    // Skip degenerate faces (duplicate vertices)
    // A valid triangle needs 3 unique vertices
    if (new Set(tri).size === 3) newFaces.push(tri);
  }

  return newFaces;
}
