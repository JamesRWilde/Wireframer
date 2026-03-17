
/**
 * getModelTriCornerNormals - Computes per-corner normals for each triangle in a model
 *
 * PURPOSE:
 *   Returns an array of per-corner normals for each triangle, supporting flat, smooth, and crease shading.
 *   Used for mesh rendering where per-corner normals are needed for lighting.
 *
 * HOW IT WORKS:
 *   1. Returns cached normals if available and valid (model._triCornerNormals)
 *   2. Uses model.triangleNormals if present (precomputed per-corner normals)
 *   3. For flat shading, assigns face normal to all corners
 *   4. For smooth/crease, averages normals of adjacent faces within crease threshold
 *
 * @param {Object} model - Model object with geometry and optional shading/crease info
 *   @property {Array<Array<number>>} V - Vertex array
 *   @property {Array<Array<number>>} [triangleNormals] - Optional precomputed per-corner normals
 *   @property {number} [_creaseAngleDeg] - Optional crease angle in degrees
 *   @property {Array} [_triCornerNormals] - Optional cached per-corner normals
 *   @property {string} [_triCornerNormalsKey] - Optional cache key
 * @param {Array<Array<number>>} triFaces - Array of triangle vertex indices
 * @returns {Array<Array<Array<number>>>} Per-triangle, per-corner normal vectors ([[[x,y,z],[x,y,z],[x,y,z]], ...])
 *
 * EXAMPLE USAGE:
 *   const cornerNormals = getModelTriCornerNormals(model, triFaces);
 *   // cornerNormals[i][c] gives the normal for corner c of triangle i
 */

import { getModelShadingMode } from '../../../cpu/getModelShadingMode.js';
import { getModelFaceNormals } from '../../../cpu/getModelFaceNormals.js';
import { geometrySumNormals } from '../../../cpu/geometry/geometrySumNormals.js';
import { buildVertexToFaces } from '../../../cpu/buildVertexToFaces.js';
import { geometryGetFlatNormals } from '../../../cpu/geometry/geometryGetFlatNormals.js';
import { geometryGetTriNormals } from '../../../cpu/geometry/geometryGetTriNormals.js';

export function getModelTriCornerNormals(model, triFaces) {
  // Determine shading mode ('flat', 'smooth', or 'auto')
  const shadingMode = getModelShadingMode(model, triFaces);
  // Use crease angle if present, otherwise default to 62 degrees
  const crease = Number.isFinite(model._creaseAngleDeg) ? model._creaseAngleDeg : 62;
  // Build a cache key for the current normal computation
  const key = `${shadingMode}|${Math.round(crease * 100)}`;

  // 1. Return cached normals if available and valid
  if (model._triCornerNormals && model._triCornerNormalsKey === key && model._triCornerNormals.length === triFaces.length) {
    return model._triCornerNormals;
  }

  // 2. Compute face normals for all triangles
  const faceNormals = getModelFaceNormals(model, triFaces);

  // 3. Use precomputed triangleNormals if available
  const triNormals = geometryGetTriNormals(model, triFaces.length);
  if (triNormals) return triNormals;

  // 4. Flat shading: assign face normal to all corners
  if (shadingMode === 'flat') {
    return geometryGetFlatNormals(faceNormals);
  }

  // 5. Build vertex-to-face adjacency list for smoothing
  const vertexToFaces = buildVertexToFaces(triFaces, model.V.length);

  // 6. Set crease threshold for normal blending
  const cosThreshold = shadingMode === 'smooth' ? -1 : Math.cos((crease * Math.PI) / 180);

  // 7. Compute per-corner normals for each triangle
  const cornerNormals = new Array(triFaces.length);
  let i = 0;
  for (const tri of triFaces) {
    const nRef = faceNormals[i]; // Reference normal for this triangle
    const triCorner = new Array(3);
    for (let c = 0; c < 3; c++) {
      const vi = tri[c]; // Vertex index for this corner
      const adjacent = vertexToFaces[vi]; // All faces sharing this vertex
      // Sum normals of adjacent faces within crease threshold
      const [nx, ny, nz] = geometrySumNormals(nRef, faceNormals, adjacent, cosThreshold);
      const nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-9) {
        // Fallback: use face normal if sum is degenerate
        triCorner[c] = [nRef[0], nRef[1], nRef[2]];
      } else {
        // Normalize summed normal
        triCorner[c] = [nx / nl, ny / nl, nz / nl];
      }
    }
    cornerNormals[i++] = triCorner;
  }

  return cornerNormals;
}
