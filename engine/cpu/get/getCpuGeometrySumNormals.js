/**
 * geometrySumNormals.js - Helper to sum normals within crease threshold
 *
 * PURPOSE:
 *   Sums the normals of adjacent faces for a vertex, including only those
 *   whose dot product with the reference normal is above the crease threshold.
 *   Used for smoothing normals at a vertex, respecting a crease angle.
 *
 * @param {Array<number>} nRef - Reference normal [x, y, z] for the current face
 * @param {Array<Array<number>>} faceNormals - Array of all face normals ([x, y, z] per face)
 * @param {Array<number>} adjacent - Indices of adjacent faces for the vertex
 * @param {number} cosThreshold - Cosine of crease angle threshold; only faces with dot >= threshold are included
 * @returns {Array<number>} Summed normal [nx, ny, nz] (not normalized)
 *
 * HOW IT WORKS:
 *   - Iterates over all adjacent face indices for the vertex.
 *   - For each, computes the dot product with the reference normal.
 *   - If the dot is above the threshold, adds the normal to the sum.
 *   - Returns the summed vector (not normalized; caller should normalize if needed).
 *
 * EXAMPLE USAGE:
 *   const [nx, ny, nz] = sumSimilarNormals(nRef, faceNormals, adjacent, cosThreshold);
 *   // Normalize if needed: const len = Math.hypot(nx, ny, nz);
 */
export function getCpuGeometrySumNormals(nRef, faceNormals, adjacent, cosThreshold) {
  // Initialize sum vector
  let nx = 0, ny = 0, nz = 0;
  // For each adjacent face, check if its normal is within the crease threshold
  for (const fi of adjacent) {
    const n = faceNormals[fi];
    // Compute dot product with reference normal
    const dot = nRef[0] * n[0] + nRef[1] * n[1] + nRef[2] * n[2];
    if (dot >= cosThreshold) {
      // Add normal to sum if within threshold
      nx += n[0];
      ny += n[1];
      nz += n[2];
    }
  }
  // Return summed (not normalized) normal
  return [nx, ny, nz];
}
