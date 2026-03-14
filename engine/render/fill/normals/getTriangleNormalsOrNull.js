/**
 * getTriangleNormalsOrNull.js - Helper to return triangleNormals if present
 *
 * PURPOSE:
 *   Returns a copy of model.triangleNormals if present, or null otherwise.
 *   Used to provide precomputed per-corner normals for each triangle, if available.
 *
 * @param {Object} model - Model object, may contain triangleNormals property
 * @param {number} triCount - Number of triangles expected in the output
 * @returns {Array<Array<Array<number>>>|null} Array of per-triangle, per-corner normals, or null if not present
 *
 * HOW IT WORKS:
 *   - If model.triangleNormals exists, creates and returns a shallow copy of the array
 *     (to avoid mutating the original array elsewhere in the code).
 *   - If not present, returns null so the caller can fall back to other normal computation methods.
 *
 * EXAMPLE USAGE:
 *   const triNormals = getTriangleNormalsOrNull(model, triFaces.length);
 *   if (triNormals) return triNormals;
 *   // ...fallback to other normal computation...
 */
export function getTriangleNormalsOrNull(model, triCount) {
  // Check if precomputed triangleNormals are present
  if (model.triangleNormals) {
    // Create a shallow copy to avoid mutating the original array
    const out = new Array(triCount);
    let i = 0;
    for (const triNorm of model.triangleNormals) {
      out[i++] = triNorm;
    }
    return out;
  }
  // Return null if not present, so caller can compute normals another way
  return null;
}
