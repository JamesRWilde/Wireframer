/**
 * faceNormal.js - Compute Face Normal via Cross Product
 *
 * PURPOSE:
 *   Computes the unnormalised face normal from three vertex positions
 *   using the cross product of edge vectors.
 *
 * ARCHITECTURE ROLE:
 *   Used by winding detection (fixWinding) and any mesh analysis that
 *   needs face orientation without requiring precomputed normals.
 *
 * WHY THIS EXISTS:
 *   Provides a single source of truth for face normal calculations
 *   enabling consistent orientation tests and geometric checks
 *   without duplication.
 */

"use strict";

/**
 * faceNormal - Computes the unnormalised normal vector of a triangle face.
 *
 * Calculates the cross product of edge vectors (b-a) × (c-a).
 * The result is not normalised — divide by its length if a unit vector is needed.
 *
 * @param {number[]} a - First vertex [x, y, z]
 * @param {number[]} b - Second vertex [x, y, z]
 * @param {number[]} c - Third vertex [x, y, z]
 * @returns {number[]} Unnormalised normal vector [nx, ny, nz]
 */
export function utilFaceNormal(a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  return [
    uy * vz - uz * vy,
    uz * vx - ux * vz,
    ux * vy - uy * vx
  ];
}
