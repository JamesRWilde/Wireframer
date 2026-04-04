/**
 * utilComputeCornerNormals.js - Compute Per-Corner Triangle Normals
 *
 * PURPOSE:
 *   Computes per-corner normals for every triangle, supporting flat,
 *   smooth, and crease shading modes. These normals are used by the fill
 *   renderer (setDrawSolidFillModel and the fill worker) to produce Phong-like
 *   smooth shading without requiring per-vertex normal attributes in the mesh.
 *
 * ARCHITECTURE ROLE:
 *   Called by initBakeMesh during the one-time bake phase to pre-compute
 *   corner normals for the pristine model. The result is stored in
 *   _triCornerNormals and returned instantly by utilTriCornerNormals on
 *   every subsequent frame. Decimated or morphed copies use utilBakeDerived
 *   which performs its own corner-normal computation.
 *
 * WHY THIS EXISTS:
 *   Computing corner normals requires vertex-to-face adjacency lookups,
 *   crease angle checks, smoothing group validation, and normal blending —
 *   an O(n) operation per frame if not cached. Pre-computing during baking
 *   reduces per-frame work to O(1) cache lookups.
 */

"use strict";

// Import smooth corner computation for one triangle (single function, single file)
import { utilComputeSmoothCorners } from '@engine/util/cpu/geometry/utilComputeSmoothCorners.js';

/**
 * utilComputeCornerNormals - Compute per-corner per-face normals for ALL triangles
 *
 * @param {Array<Array<number>>} faceNormals - Pre-computed face normals [[nx,ny,nz], ...]
 * @param {Array<Array<number>>} vertexToFaces - Vertex-to-face adjacency list
 * @param {string} effectiveMode - Shading mode: 'flat', 'smooth', or 'crease'
 * @param {number} crease - Crease angle in degrees (used when mode is 'crease')
 * @param {Array|null} smoothData - Per-face OBJ smoothing groups, or null
 * @param {number} triCount - Number of triangles
 * @param {Array<Array<number>>} triFaces - Triangle vertex indices for corner lookups
 *
 * @returns {Array<Array<Array<number>>>} Per-triangle, per-corner normals
 *   Structure: result[triIndex][cornerIndex] = [nx, ny, nz]
 *
 * Flat mode:  Each corner gets the face normal — faceted look, fastest path.
 * Smooth mode: Corners blend all adjacent face normals — continuous surface.
 * Crease mode: Corners only blend within crease angle — sharp edges preserved.
 */
export function utilComputeCornerNormals(faceNormals, vertexToFaces, effectiveMode, crease, smoothData, triCount, triFaces) {
  const cn = new Array(triCount);

  // Flat shading — every corner gets the face normal (no blending).
  // Each triangle renders as a distinct flat surface with sharp boundaries.
  if (effectiveMode === 'flat') {
    for (let i = 0; i < triCount; i++) {
      const n = faceNormals[i];
      cn[i] = [[n[0], n[1], n[2]], [n[0], n[1], n[2]], [n[0], n[1], n[2]]];
    }
    return cn;
  }

  // Smooth/crease shading — blend adjacent face normals at each corner.
  // Cosine threshold: -1 for smooth mode (include all faces),
  // cos(crease) for crease mode (exclude faces meeting at sharp angles).
  const cosThresh = effectiveMode === 'smooth'
    ? -1
    : Math.cos(crease * Math.PI / 180);

  for (let i = 0; i < triCount; i++) {
    const tri = triFaces[i];
    const nRef = faceNormals[i];
    // Smoothing group of this face from OBJ "s" directive, or null if none
    const refGrp = smoothData ? smoothData[i] : null;

    // Delegate per-triangle corner computation to the single-function helper
    cn[i] = utilComputeSmoothCorners(tri, nRef, vertexToFaces, faceNormals, cosThresh, smoothData, refGrp);
  }

  return cn;
}
