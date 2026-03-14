/**
 * computeFaceNormals.js - Compute Face Normals for Wireframe Rendering
 *
 * PURPOSE:
 *   Computes a normalized outward-facing normal for each triangle face in
 *   view space. These normals are used to determine edge orientation (front/back)
 *   during wireframe rendering.
 *
 * ARCHITECTURE ROLE:
 *   Used by classifyEdges when building edge classification data. It converts
 *   transformed triangle vertices into a per-face normal array.
 *
 * DATA FORMAT:
 *   - T: Array of transformed vertex positions [[x,y,z], ...]
 *   - triFaces: Array of face index triplets [[a,b,c], ...]
 *   - meshCenter: [cx, cy, cz] for normal orientation correction
 */

"use strict";

import { computeFaceNormalViewSpace } from './computeFaceNormalViewSpace.js';

/**
 * computeFaceNormals - Compute normals for each triangle face
 *
 * @param {Array<Array<number>>} T - Transformed vertex positions in view space
 * @param {Array<Array<number>>} triFaces - Triangle faces as vertex index triplets
 * @param {Array<number>} meshCenter - Mesh centroid [cx, cy, cz]
 *
 * @returns {Array<Array<number>>} Array of normalized face normals
 */
export function computeFaceNormals(T, triFaces, meshCenter) {
  return triFaces.map((tri) =>
    computeFaceNormalViewSpace(
      T,
      tri[0],
      tri[1],
      tri[2],
      meshCenter[0],
      meshCenter[1],
      meshCenter[2],
    ),
  );
}
