'use strict';

let sortZ = null;    // Float32Array of z-depths per triangle
let sortIdx = null;  // Uint32Array of triangle indices

/**
 * setSortTrianglesByDepth - Sorts triangle indices by average z-depth (back-to-front)
 *
 * @param {Array<Array<number>>} triFaces - Array of triangle face index arrays [a, b, c]
 * @param {Array<Array<number>>} T - Transformed vertex positions
 * @param {number} triCount - Number of triangles
 * @returns {Uint32Array} sorted index array
 */
export function setSortTrianglesByDepth(triFaces, T, triCount) {
  if (!sortZ || sortZ.length < triCount) {
    sortZ = new Float32Array(triCount);
    sortIdx = new Uint32Array(triCount);
  }

  for (let i = 0; i < triCount; i++) {
    const tri = triFaces[i];
    sortZ[i] = (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3;
    sortIdx[i] = i;
  }

  sortIdx.subarray(0, triCount).sort((a, b) => sortZ[b] - sortZ[a]);

  return sortIdx;
}
