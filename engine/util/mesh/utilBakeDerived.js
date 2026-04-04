/**
 * utilBakeDerived.js - Bake Geometry on a Decimated or Morphed Copy
 *
 * PURPOSE:
 *   Computes render-ready geometry (triFaces, face normals, vertex-to-face
 *   adjacency, corner normals) on a mesh that has had its geometry mutated
 *   by decimation or morphing. This is not a full baker re-run — the V/F/E
 *   are already set by the decimator or morpher. utilBakeDerived only fills
 *   in the derived data that the render loop needs.
 *
 * ARCHITECTURE ROLE:
 *   Called after initGreedyClusterDecimator or morph interpolation produces
 *   a new mesh copy with changed geometry. The decimator/morpher sets V/F/E;
 *   utilBakeDerived computes _faceNormals, _vertexToFaces, _triCornerNormals
 *   so that utilTriCornerNormals and utilFaceNormals return cached data on
 *   subsequent frames instead of recomputing from scratch.
 *
 * WHY THIS EXISTS:
 *   Decimated copies have different vertex counts and face indices than the
 *   original. They cannot reuse the pre-baked geometry from the baker's
 *   shelf. But they should still bake their own normals once (not every
 *   frame), so the render loop gets O(1) access to cached shading data.
 */

"use strict";

// Import vertex-to-face adjacency builder for corner normal blending
import { buildVertexToFaces } from '@engine/init/cpu/initBuildVertexToFaces.js';
// Import corner normal computation — flat/smooth/creased per-triangle corners
import { utilComputeCornerNormals } from '@engine/util/cpu/geometry/utilComputeCornerNormals.js';

/**
 * utilBakeDerived - Bake geometry on a decimated/morphed copy
 *
 * @param {Object} model - Model with V/F/E already set by decimator or morpher
 * @param {number} crease - Crease angle in degrees (for crease shading mode)
 * @param {string} effectiveMode - Shading mode: 'flat', 'smooth', or 'crease'
 * @returns {Object} The same model with geometry fields populated
 *
 * Populates: triFaces, _faceNormals, _vertexToFaces, _triCornerNormals,
 *   _triCornerNormalsKey, _vertCount, _faceCount. Sets _isBaked to false
 *   to distinguish from a full baker model.
 */
export function utilBakeDerived(model, crease, effectiveMode) {
  const V = model.V;

  // Extract bare face index arrays from F — handles both bare [a,b,c] and
  // object format {indices: [a,b,c]}. Normalises F format so the render
  // loop has consistent [a,b,c] triangle indices.
  const triFaces = model.F.map(f => (Array.isArray(f) ? f : f.indices || f));
  model.triFaces = triFaces;

  // Compute face normals — cross product per face, normalised to unit length.
  // Unlike the baker's utilComputeFaceNormals these are NOT oriented outward
  // from centroid — the decimator preserves face winding so the direction is
  // already correct. Saves the O(n) centroid computation.
  const faceNormals = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const a = V[tri[0]], b = V[tri[1]], c = V[tri[2]];
    let ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    let vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    faceNormals[i] = [nx / nl, ny / nl, nz / nl];
  }
  model._faceNormals = faceNormals;

  // Build vertex-to-face adjacency — one-time cost so utilComputeCornerNormals
  // can look up shared-vertex faces without O(n²) rebuild per frame
  model._vertexToFaces = buildVertexToFaces(triFaces, V.length);

  // Corner normals — delegate to the single-purpose util
  // instead of recomputing flat/smooth/crease logic here.
  const smoothData = model.triangleSmoothing || null;
  model._triCornerNormals = utilComputeCornerNormals(
    faceNormals, model._vertexToFaces, effectiveMode, crease, smoothData, triFaces.length, triFaces
  );
  model._triCornerNormalsKey = `${effectiveMode}|${Math.round(crease * 100)}`;
  model._vertCount = V.length;
  model._faceCount = triFaces.length;
  model._isBaked = false;

  return model;
}
