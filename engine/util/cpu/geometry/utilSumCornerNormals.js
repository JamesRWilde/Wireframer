/**
 * utilSumCornerNormals.js - Sum Adjacent Face Normals for a Single Vertex
 *
 * PURPOSE:
 *   Sums the face normals of all adjacent faces sharing a vertex, filtering
 *   by crease angle threshold and OBJ smoothing groups. Returns the summed
 *   (unnormalised) normal vector. The caller normalises it.
 *
 * ARCHITECTURE ROLE:
 *   Extracted from the deeply nested corner normal computation loops in
 *   utilComputeCornerNormals and utilBakeDerived. Reduces cognitive
 *   complexity of both functions by encapsulating the crease + smoothing
 *   group filtering logic in one place.
 *
 * WHY THIS EXISTS:
 *   The crease angle check and smoothing group validation logic was
 *   duplicated in two files with 4+ levels of nesting. Extracting it here
 *   reduces cognitive complexity, removes duplication, and ensures
 *   consistent filtering behaviour across baker and derived copies.
 */

"use strict";

/**
 * utilSumCornerNormals - Sum adjacent face normals for a vertex
 *
 * @param {number} vertexIdx - The vertex index to look up adjacent faces for
 * @param {Array<Array<number>>} vertexToFaces - Adjacency: vertex → [face indices]
 * @param {Array<Array<number>>} faceNormals - Pre-computed face normals [[nx,ny,nz], ...]
 * @param {Array<number>} nRef - Reference face normal [nx,ny,nz] for crease dot-product check
 * @param {number} cosThresh - Cosine of crease angle threshold (-1 for smooth, cos(angle) for crease)
 * @param {Array|null} smoothData - Per-face OBJ smoothing groups, or null
 * @param {string|null} refGrp - Smoothing group of the reference face, or null
 *
 * @returns {Array<number>} Summed (unnormalised) normal [sx, sy, sz].
 *   Returns [0,0,0] if no faces passed the filters (caller falls back to nRef).
 */
export function utilSumCornerNormals(vertexIdx, vertexToFaces, faceNormals, nRef, cosThresh, smoothData, refGrp) {
  let sx = 0, sy = 0, sz = 0;

  for (const fi of vertexToFaces[vertexIdx]) {
    const fn = faceNormals[fi];

    // Exclude faces outside the crease angle threshold.
    // Dot product of two unit vectors = cos(angle between them).
    // If cos < cosThresh, the angle is too large — hard edge, don't blend.
    if (cosThresh > -1 && nRef[0] * fn[0] + nRef[1] * fn[1] + nRef[2] * fn[2] < cosThresh) {
      continue;
    }

    // Exclude faces in different OBJ smoothing groups if groups are defined.
    if (smoothData) {
      const fg = smoothData[fi];
      if (refGrp !== null && fg !== null && refGrp !== fg) {
        continue;
      }
    }

    sx += fn[0];
    sy += fn[1];
    sz += fn[2];
  }

  return [sx, sy, sz];
}
