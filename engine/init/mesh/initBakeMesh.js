/**
 * initBakeMesh.js - Bake Raw OBJ-Informed Mesh into Clean Internal Format
 *
 * PURPOSE:
 *   Takes validated, filtered mesh data (V, F, E) from the load pipeline,
 *   collapses vertices to clean [x,y,z], faces to bare [a,b,c], and
 *   pre-computes face normals, vertex-to-face adjacency, and corner normals
 *   ONCE. This is the baker's cake — the single source of truth that all
 *   downstream operations (decimation, morphing, rotation, shading) work from.
 *
 * ARCHITECTURE ROLE:
 *   Called once by initLoad.js after validation, edge building, and
 *   normalisation. The output is stored in bakeState._bakedShelfModel and
 *   serves as the pristine shelf model. Nobody ever re-parses the OBJ.
 *
 * WHY THIS EXISTS:
 *   Without the baker, face normals would be computed every frame in the
 *   render loop, and every decimation clone would recompute its own normals
 *   from OBJ. The baker bakes once, stores the cake on the shelf, and
 *   everyone works from the shelf.
 *
 * HOW IT WORKS:
 *   1. Collapse OBJ-specific vertex format to clean [x,y,z] arrays
 *   2. Collapse face objects to bare [a,b,c] index arrays
 *   3. Compute face normals oriented outward from mesh centroid
 *   4. Build vertex-to-face adjacency map for smoothing lookups
 *   5. Compute per-corner triangle normals for smooth/crease shading
 */

"use strict";

// Import edge validation utility — filters zero-length and duplicate edges
// Import vertex-to-face adjacency builder — maps each vertex to shared faces
import { buildVertexToFaces } from '@engine/init/cpu/initBuildVertexToFaces.js';
// Import face normal computation — computes outward-facing normals from geometry
import { utilComputeFaceNormals } from '@engine/util/cpu/utilComputeFaceNormals.js';
// Import corner normal computation — computes per-corner normals for shading
import { utilComputeCornerNormals } from '@engine/util/cpu/geometry/utilComputeCornerNormals.js';

/**
 * initBakeMesh - Transforms OBJ-informed mesh into clean internal format
 *
 * @param {Object} meshObj - Mesh with V (raw vertices), F (raw faces), E (edges),
 *   triangleSmoothing, triangleMaterials. V may still carry UV/normals at
 *   indices [3]–[7]; F may be objects with {indices: [...]} or bare arrays.
 * @param {string} detailMode - Current detail mode string
 * @param {number} detailPercent - Current detail percent (0-1)
 * @returns {Object} Baked model — canonical internal representation
 *
 * The returned model has:
 *   V                     — Clean [x,y,z] vertices (UVs/normals stripped)
 *   F                     — Bare [a,b,c] face index arrays
 *   E                     — Validated edges (filtered if rawE provided)
 *   triFaces              — Independent [a,b,c] copy matching V exactly
 *   _faceNormals          — Per-face outward normals (unit vectors)
 *   _vertexToFaces        — Adjacency list: vertexIdx → [face1, face2, …]
 *   _triCornerNormals     — Per-corner normals for Phong-like rendering
 *   _triCornerNormalsKey  — Cache key "<mode>|<crease>" for validation
 *   _isBaked              — true, signals pre-computed data is valid
 */
export function initBakeMesh(meshObj, detailMode, detailPercent) {
  // Extract arrays from the validated mesh object
  const rawV = meshObj.V;
  const rawF = meshObj.F;

  // Collapse vertices to clean [x, y, z] — strip UVs [3][4] and normals [5][6][7].
  // The renderer doesn't use UVs (no texturing) and doesn't trust OBJ normals
  // (vertex normals may not match face geometry). Having fixed-size [x,y,z]
  // arrays eliminates per-frame branching to check vertex array lengths.
  const V = new Array(rawV.length);
  for (let i = 0; i < rawV.length; i++) {
    const rv = rawV[i];
    V[i] = [rv[0], rv[1], rv[2]];
  }

  // Collapse faces to bare [a, b, c] arrays.
  // OBJ faces can be objects {indices, material, group} or bare arrays.
  // The baker strips all metadata — only vertex indices matter for rendering.
  // Degenerate faces (<3 vertices) get [0,0,0] — invisible, no crash.
  const F = new Array(rawF.length);
  for (let i = 0; i < rawF.length; i++) {
    const f = rawF[i];
    const idx = f.indices || (Array.isArray(f) ? f : null);
    F[i] = (!idx || idx.length < 3) ? [0, 0, 0] : [idx[0], idx[1], idx[2]];
  }

  // Use edges as provided by the load pipeline — they already passed through
  // utilFilteredValidEdges in initLoad.js, so no re-filtering needed here.
  const E = meshObj.E || [];

  // Independent triFaces copy — decoupled from F so utilModelTriangles
  // can return this directly for baked models without per-frame .map().
  // This is a true copy, not a reference, so downstream mutations won't
  // invalidate it. utilModelTriangles verifies triFaces.length === F.length
  // before returning it — clones with different geometry fall back to F.
  const triFaces = F.map(f => [f[0], f[1], f[2]]);

  // Face normals — computed ONCE from geometry, oriented outward from centroid.
  // utilFaceNormals checks for model._faceNormals on subsequent frames and
  // returns it instantly (O(1)) if face counts match.
  const faceNormals = utilComputeFaceNormals(V, triFaces);

  // Vertex-to-face adjacency — pre-built lookup for corner normal blending.
  // Without this, every frame would iterate all faces to find shared vertices
  // — O(n²) on large meshes.
  const vertexToFaces = buildVertexToFaces(triFaces, V.length);

  // Corner normals — per-corner per-face normals for Phong-like rendering.
  // Computed once based on shading mode: flat, smooth, or crease.
  // Defaults to 62° crease angle if not specified.
  const crease = 62;
  const smoothData = meshObj.triangleSmoothing || null;
  const effectiveMode = smoothData ? 'smooth' : 'flat';
  const cornerNormals = utilComputeCornerNormals(
    faceNormals, vertexToFaces, effectiveMode, crease, smoothData, F.length, triFaces
  );

  return {
    V, F, E, triFaces,
    _faceNormals: faceNormals,
    _vertexToFaces: vertexToFaces,
    _triCornerNormals: cornerNormals,
    _triCornerNormalsKey: `${effectiveMode}|${Math.round(crease * 100)}`,
    _vertCount: V.length,
    _faceCount: F.length,
    _shadingMode: effectiveMode,
    _creaseAngleDeg: crease,
    _detailMode: detailMode,
    _detailPercent: detailPercent,
    triangleSmoothing: smoothData,
    triangleMaterials: meshObj.triangleMaterials || null,
    _isBaked: true,
  };
}
