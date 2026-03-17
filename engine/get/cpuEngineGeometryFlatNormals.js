/**
 * geometryGetFlatNormals.js - Helper for flat shading corner normals
 *
 * PURPOSE:
 *   Returns an array of per-corner normals for each triangle, where all corners use the face normal.
 *   Used for flat shading, where each triangle's corners share the same normal (no smoothing).
 *
 * @param {Array<Array<number>>} faceNormals - Array of face normals, one per triangle ([x, y, z])
 * @returns {Array<Array<Array<number>>>} Per-triangle, per-corner normal vectors ([[[x,y,z],[x,y,z],[x,y,z]], ...])
 *
 * HOW IT WORKS:
 *   - For each face normal, creates an array of three identical normals (one for each corner).
 *   - Returns an array of these per-corner arrays, matching the triangle order.
 *
 * EXAMPLE USAGE:
 *   const flatNormals = getFlatCornerNormals(faceNormals);
 *   // flatNormals[i][c] gives the normal for corner c of triangle i
 */
export function cpuEngineGeometryFlatNormals(faceNormals) {
  // Allocate output array for per-triangle, per-corner normals
  const cornerNormals = new Array(faceNormals.length);
  let i = 0;
  // For each face normal, assign it to all three corners
  for (const n of faceNormals) {
    cornerNormals[i++] = [[n[0], n[1], n[2]], [n[0], n[1], n[2]], [n[0], n[1], n[2]]];
  }
  return cornerNormals;
}
