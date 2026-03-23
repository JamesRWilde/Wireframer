/**
 * geometryPointInTriangle.js - Point-in-Triangle Test
 * 
 * PURPOSE:
 *   Determines whether a 2D point lies inside a triangle. This is used by the
 *   ear clipping triangulation algorithm to check if a potential ear contains
 *   any other vertices (which would make it invalid for removal).
 * 
 * ARCHITECTURE ROLE:
 *   Called by triangulateFaceEarClipping to validate potential ears.
 *   Uses barycentric coordinates for an efficient and robust test.
 * 
 * MATHEMATICAL BASIS:
 *   Uses barycentric coordinates to express the point as a weighted combination
 *   of the triangle's vertices. If all weights are non-negative and sum to ≤ 1,
 *   the point is inside the triangle.
 */

"use strict";

/**
 * geometryPointInTriangle - Tests if a point lies inside a triangle
 * 
 * @param {Array<number>} p - The point to test [x, y]
 * @param {Array<number>} a - First triangle vertex [x, y]
 * @param {Array<number>} b - Second triangle vertex [x, y]
 * @param {Array<number>} c - Third triangle vertex [x, y]
 * 
 * @returns {boolean} True if the point is inside or on the triangle boundary
 * 
 * Uses barycentric coordinates with a small epsilon (1e-8) for floating-point
 * tolerance. This prevents false negatives due to numerical precision issues.
 */
export function utilPointTriangle(p, a, b, c) {
  // Compute edge vectors from vertex a
  const v0 = [c[0] - a[0], c[1] - a[1]];  // Vector a->c
  const v1 = [b[0] - a[0], b[1] - a[1]];  // Vector a->b
  const v2 = [p[0] - a[0], p[1] - a[1]];  // Vector a->p
  
  // Compute dot products for barycentric coordinate calculation
  const dot00 = v0[0] * v0[0] + v0[1] * v0[1];  // |v0|²
  const dot01 = v0[0] * v1[0] + v0[1] * v1[1];  // v0·v1
  const dot02 = v0[0] * v2[0] + v0[1] * v2[1];  // v0·v2
  const dot11 = v1[0] * v1[0] + v1[1] * v1[1];  // |v1|²
  const dot12 = v1[0] * v2[0] + v1[1] * v2[1];  // v1·v2
  
  // Compute barycentric coordinates (u, v)
  // invDenom is the inverse of the determinant of the matrix [v0, v1]
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  
  // Point is inside if u ≥ 0, v ≥ 0, and u + v ≤ 1
  // We use a small epsilon (1e-8) for floating-point tolerance
  return u >= -1e-8 && v >= -1e-8 && (u + v) <= 1 + 1e-8;
}
