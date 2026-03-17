/**
 * geometryConvex.js - Convexity Check for Polygon Vertices
 * 
 * PURPOSE:
 *   Determines whether a vertex in a polygon forms a convex angle. This is used
 *   by the ear clipping triangulation algorithm to identify "ears" (triangles
 *   that can be safely removed without affecting the polygon's shape).
 * 
 * ARCHITECTURE ROLE:
 *   Called by triangulateFaceEarClipping to test if a potential ear is valid.
 *   A vertex is convex if the interior angle is less than 180 degrees.
 * 
 * MATHEMATICAL BASIS:
 *   Uses the cross product of two edge vectors to determine orientation.
 *   The sign of the cross product indicates whether the angle is convex
 *   (positive) or reflex (negative), relative to the polygon's winding order.
 */

"use strict";

/**
 * geometryConvex - Checks if a vertex forms a convex angle in a polygon
 * 
 * @param {Array<Array<number>>} proj - Projected 2D vertex coordinates
 *   Each element is [x, y] representing a vertex position
 * @param {number} i0 - Index of the previous vertex
 * @param {number} i1 - Index of the current vertex (the one being tested)
 * @param {number} i2 - Index of the next vertex
 * @param {number} area2 - Signed area of the polygon (determines winding order)
 *   Positive for counter-clockwise, negative for clockwise
 * 
 * @returns {boolean} True if the vertex forms a convex angle, false otherwise
 * 
 * The function works by:
 * 1. Computing the cross product of vectors (i0->i1) and (i1->i2)
 * 2. Multiplying by the polygon's signed area to account for winding order
 * 3. If the result is positive, the angle is convex
 */
export function getCpuEngineGeometryConvex(proj, i0, i1, i2, area2) {
  // Get the three vertices
  const a = proj[i0], b = proj[i1], c = proj[i2];
  
  // Compute cross product of edge vectors (b-a) and (c-a)
  // This gives the signed area of the triangle formed by the three points
  // Positive = counter-clockwise, negative = clockwise
  const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  
  // Multiply by polygon area to normalize for winding order
  // If both have the same sign, the vertex is convex
  return cross * area2 > 0;
}
