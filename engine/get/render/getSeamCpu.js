/**
 * seamCpu.js - Triangle Seam Expansion
 *
 * PURPOSE:
 *   Expands triangle vertices outward from centroid to prevent visible seams
 *   between adjacent triangles in smooth-shaded meshes.
 *
 * ARCHITECTURE ROLE:
 *   Called by fill renderer before rasterizing triangles.
 *   Eliminates thin gaps that can appear between triangles due to rounding.
 *
 * WHY EXPANSION IS NEEDED:
 *   When triangles share edges, sub-pixel rounding can leave tiny gaps.
 *   Expanding each triangle slightly ensures edges overlap, eliminating gaps.
 */

"use strict";

// Import point expansion helper to move vertices away from centroid
import { expandGeometryPoint }from '@engine/set/cpu/expandGeometryPoint.js';

/**
 * expandTriangleForSeam - Expands triangle vertices outward from centroid
 *
 * @param {Array<Array<number>>} tri2d - Triangle vertices [[x1,y1], [x2,y2], [x3,y3]]
 * @param {number} seamExpandPx - Expansion distance in pixels (0 = no expansion)
 *
 * @returns {Array<Array<number>>} Expanded triangle vertices
 *
 * The function:
 * 1. Returns original vertices if expansion is disabled
 * 2. Computes triangle centroid
 * 3. Moves each vertex outward from centroid by seamExpandPx pixels
 */
export function getSeamCpu(tri2d, seamExpandPx) {
  // Extract vertex coordinates
  const ax = tri2d[0][0];
  const ay = tri2d[0][1];
  const bx = tri2d[1][0];
  const by = tri2d[1][1];
  const cx = tri2d[2][0];
  const cy = tri2d[2][1];

  // Return original vertices if expansion is disabled
  if (seamExpandPx <= 0) {
    return [[ax, ay], [bx, by], [cx, cy]];
  }

  // Compute triangle centroid (average of all three vertices)
  const mx = (ax + bx + cx) / 3;
  const my = (ay + by + cy) / 3;

  // Expand all three vertices outward from centroid
  return [
    expandGeometryPoint(ax, ay, mx, my, seamExpandPx),
    expandGeometryPoint(bx, by, mx, my, seamExpandPx),
    expandGeometryPoint(cx, cy, mx, my, seamExpandPx)
  ];
}
