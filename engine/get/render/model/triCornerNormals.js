/**
 * triCornerNormals.js - Per-Corner Triangle Normal Computer
 *
 * PURPOSE:
 *   Computes per-corner normals for each triangle in a model, supporting
 *   flat, smooth, and crease shading modes. Used for lighting calculations
 *   in the fill renderer.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawSolidFillModel when smooth shading is active. Provides
 *   the per-corner normal data needed for smooth Phong-like shading
 *   without per-vertex normal attributes.
 *
 * SHADING MODES:
 *   - Flat: All corners get the face normal (faceted look)
 *   - Smooth: Corners average normals from all adjacent faces
 *   - Crease: Like smooth, but only blends faces within a crease angle threshold
 */

"use strict";

// Import shading mode detector
import { shadingMode as getShadingMode }from '@engine/get/cpu/model/shadingMode.js';

// Import face normal computation
import { faceNormals as computeFaceNormals }from '@engine/get/cpu/model/faceNormals.js';

// Import normal summing helper for adjacent face blending
import {sumNormals}from '@engine/get/cpu/geometry/sumNormals.js';

// Import vertex-to-face adjacency builder
import { buildVertexToFaces }from '@engine/init/cpu/buildVertexToFaces.js';

// Import flat normal assignment helper
import {flatNormals}from '@engine/get/cpu/geometry/flatNormals.js';

// Import precomputed triangle normals getter
import { triNormals as computeTriNormals }from '@engine/get/cpu/geometry/triNormals.js';

/**
 * triCornerNormals - Computes per-corner normals for triangle shading
 *
 * @param {Object} model - Model object with geometry data
 * @param {Array<Array<number>>} triFaces - Array of triangle vertex indices
 * @returns {Array<Array<Array<number>>>} Per-triangle, per-corner normal vectors
 *
 * Returns cached normals if available and valid. Falls back through
 * precomputed normals, flat shading, and smooth/crease computation.
 */
export function triCornerNormals(model, triFaces) {
  // Determine shading mode ('flat', 'smooth', or 'auto')
  const shadingMode = getShadingMode(model, triFaces);

  // Use crease angle if present, otherwise default to 62 degrees
  const crease = Number.isFinite(model._creaseAngleDeg) ? model._creaseAngleDeg : 62;

  // Build a cache key for the current normal computation
  const key = `${shadingMode}|${Math.round(crease * 100)}`;

  // 1. Return cached normals if available and valid
  if (model._triCornerNormals && model._triCornerNormalsKey === key && model._triCornerNormals.length === triFaces.length) {
    return model._triCornerNormals;
  }

  // 2. Compute face normals for all triangles
  const faceNormals = computeFaceNormals(model, triFaces);

  // 3. Use precomputed triangleNormals if available on the model
  const triNormals = computeTriNormals(model, triFaces.length);
  if (triNormals) return triNormals;

  // 4. Flat shading: assign face normal to all corners
  if (shadingMode === 'flat') {
    return flatNormals(faceNormals);
  }

  // 5. Build vertex-to-face adjacency list for smoothing
  const vertexToFaces = buildVertexToFaces(triFaces, model.V.length);

  // 6. Set crease threshold: -1 for full smooth, cos(angle) for crease mode
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
      const [nx, ny, nz] = sumNormals(nRef, faceNormals, adjacent, cosThreshold);
      const nl = Math.hypot(nx, ny, nz);

      if (nl < 1e-9) {
        // Fallback: use face normal if sum is degenerate
        triCorner[c] = [nRef[0], nRef[1], nRef[2]];
      } else {
        // Normalize summed normal to unit length
        triCorner[c] = [nx / nl, ny / nl, nz / nl];
      }
    }
    cornerNormals[i++] = triCorner;
  }

  return cornerNormals;
}
