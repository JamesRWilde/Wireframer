/**
 * utilSummedNormals.js - Helper to sum normals within crease threshold
 *
 * PURPOSE:
 *   Sums the normals of adjacent faces for a vertex, including only those
 *   whose dot product with the reference normal is above the crease threshold.
 *   Optionally respects OBJ smoothing groups: faces in different groups
 *   are never blended, regardless of crease angle.
 *
 * ARCHITECTURE ROLE:
 *   Used by mesh normal generation in CPU and init mesh pipelines to compute
 *   smooth normals for shaded rendering.
 *
 * WHY THIS EXISTS:
 *   Encapsulates crease-aware normal blending in one helper to ensure smooth
 *   shading is consistent between models and smoothing-group behavior.
 *
 * @param {Array<number>} nRef - Reference normal [x, y, z] for the current face
 * @param {Array<Array<number>>} faceNormals - Array of all face normals ([x, y, z] per face)
 * @param {Array<number>} adjacent - Indices of adjacent faces for the vertex
 * @param {number} cosThreshold - Cosine of crease angle threshold; only faces with dot >= threshold are included
 * @param {Array<string|null>} [smoothGroups=null] - Per-face smoothing group (from OBJ "s" directive)
 * @param {string|null} [refGroup=null] - Smoothing group of the reference face
 * @returns {Array<number>} Summed normal [nx, ny, nz] (not normalized)
 */
export function utilSummedNormals(nRef, faceNormals, adjacent, cosThreshold, smoothGroups, refGroup) {
  let nx = 0, ny = 0, nz = 0;
  for (const fi of adjacent) {
    // If smoothing groups are defined, only blend faces in the same group
    if (smoothGroups && refGroup !== null && refGroup !== undefined) {
      const adjGroup = smoothGroups[fi];
      if (adjGroup !== refGroup) continue;
    }

    const n = faceNormals[fi];
    const dot = nRef[0] * n[0] + nRef[1] * n[1] + nRef[2] * n[2];
    if (dot >= cosThreshold) {
      nx += n[0];
      ny += n[1];
      nz += n[2];
    }
  }
  return [nx, ny, nz];
}
