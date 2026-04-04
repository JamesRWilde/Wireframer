/**
 * utilComputeSmoothCorners.js - Compute Three Corner Normals for One Triangle
 *
 * PURPOSE:
 *   Computes the three per-corner normals for a single triangle in smooth
 *   or crease shading mode. For each corner, it sums the normals of all
 *   adjacent faces (filtered by crease angle and smoothing groups), then
 *   normalises the result back to a unit vector.
 *
 * ARCHITECTURE ROLE:
 *   Called by utilComputeCornerNormals once per triangle during the baker's
 *   one-time bake, and by utilBakeDerived when baking geometry on derived
 *   (decimated/morphed) copies. Extracted to its own file to eliminate
 *   duplicated inner loops and reduce cognitive complexity across both
 *   corner-normal computation entry points.
 *
 * WHY THIS EXISTS:
 *   The per-corner smoothing logic (crease check + smoothing group filter
 *   + vector summation + normalisation) was duplicated in two files with
 *   5+ levels of nesting extracted here to a single shared helper.
 */

"use strict";

// Import vertex corner-summation helper — sums adjacent normals for one vertex
import { utilSumCornerNormals } from '@engine/util/cpu/geometry/utilSumCornerNormals.js';

/**
 * utilComputeSmoothCorners - Compute three corner normals for one triangle
 *
 * @param {Array<number>} tri - Vertex indices [a, b, c] of the triangle
 * @param {Array<number>} nRef - Face normal [nx, ny, nz] for crease dot-product check
 * @param {Array<Array<number>>} vertexToFaces - Vertex-to-face adjacency list
 * @param {Array<Array<number>>} faceNormals - Pre-computed face normals [[nx,ny,nz], ...]
 * @param {number} cosThresh - Cosine crease threshold (-1 for smooth mode, cos(angle) for crease)
 * @param {Array|null} smoothData - Per-face OBJ smoothing groups, or null
 * @param {string|null} refGrp - Smoothing group of this face (from OBJ "s" directive), or null
 *
 * @returns {Array<Array<number>>} Three corner normals [[nx,ny,nz], ...]
 */
export function utilComputeSmoothCorners(tri, nRef, vertexToFaces, faceNormals, cosThresh, smoothData, refGrp) {
  const corner = new Array(3);

  for (let c = 0; c < 3; c++) {
    const [sx, sy, sz] = utilSumCornerNormals(tri[c], vertexToFaces, faceNormals, nRef, cosThresh, smoothData, refGrp);

    const sl = sx * sx + sy * sy + sz * sz;
    corner[c] = sl < 1e-18
      ? [nRef[0], nRef[1], nRef[2]]
      : [sx / Math.sqrt(sl), sy / Math.sqrt(sl), sz / Math.sqrt(sl)];
  }

  return corner;
}
