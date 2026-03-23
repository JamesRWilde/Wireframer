'use strict';

// Module-level typed arrays for the sort — reused across frames to avoid allocation
// sortZ holds the average z-depth of each triangle (for comparison)
// sortIdx holds the triangle indices that get sorted
let sortZ = null;    // Float32Array of z-depths per triangle
let sortIdx = null;  // Uint32Array of triangle indices

/**
 * setSortTrianglesByDepth - Sorts triangle indices by average z-depth (back-to-front)
 *
 * PURPOSE:
 *   Implements painter's algorithm — back-to-front rendering order ensures
 *   closer triangles overwrite farther ones. Returns a sorted index array
 *   so the original triFaces array is not mutated.
 *
 * ARCHITECTURE ROLE:
 *   Called by setDrawSolidFillModel and setRenderMeshUnified to determine
 *   triangle rendering order.
 *
 * @param {Array<Array<number>>} triFaces - Array of triangle face index arrays [a, b, c]
 * @param {Array<Array<number>>} T - Transformed vertex positions [[x,y,z], ...]
 * @param {number} triCount - Number of triangles
 * @returns {Uint32Array} sorted index array (back-to-front by average Z)
 */
export function setSortTrianglesByDepth(triFaces, T, triCount) {
  // Lazily allocate typed arrays, reuse them across frames to avoid GC pressure
  if (!sortZ || sortZ.length < triCount) {
    sortZ = new Float32Array(triCount);
    sortIdx = new Uint32Array(triCount);
  }

  // Compute average Z depth for each triangle
  for (let i = 0; i < triCount; i++) {
    const tri = triFaces[i];
    sortZ[i] = (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3;
    sortIdx[i] = i;
  }

  // Sort indices by descending Z (farthest first for painter's algorithm)
  sortIdx.subarray(0, triCount).sort((a, b) => sortZ[b] - sortZ[a]);

  return sortIdx;
}
