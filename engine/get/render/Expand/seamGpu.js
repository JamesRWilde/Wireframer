/**
 * expandTriangleForSeam.js - Seam Expansion for Triangles
 *
 * PURPOSE:
 *   Expands triangle vertices outward to prevent visible seams between adjacent triangles.
 *   Used in fill rendering to improve visual quality at triangle edges.
 *
 * ARCHITECTURE ROLE:
 *   Provides a small amount of overdraw so that adjacent triangles do not leave
 *   pixel-sized gaps due to rasterization rounding.
 *
 * DATA FORMAT:
 *   - tri2d: [[x0,y0], [x1,y1], [x2,y2]] triangle vertices in screen space.
 *   - expandPx: expansion factor in pixels.
 *
 * @param {Array<[number,number]>} tri2d - Triangle 2D vertices
 * @param {number} expandPx - Expansion amount in pixels
 * @returns {Array<[number,number]>} Expanded triangle vertices
 */

"use strict";

export function seamGpu(tri2d, expandPx) {
  if (expandPx <= 0) return tri2d;
  const [a, b, c] = tri2d;
  // Compute triangle centroid in screen space.
  const cx = (a[0] + b[0] + c[0]) / 3;
  const cy = (a[1] + b[1] + c[1]) / 3;

  // Move each vertex slightly away from the centroid, scaled by expandPx.
  // The 0.01 factor maps pixel expansion to a normalized offset.
  return [
    [a[0] + (a[0] - cx) * expandPx * 0.01, a[1] + (a[1] - cy) * expandPx * 0.01],
    [b[0] + (b[0] - cx) * expandPx * 0.01, b[1] + (b[1] - cy) * expandPx * 0.01],
    [c[0] + (c[0] - cx) * expandPx * 0.01, c[1] + (c[1] - cy) * expandPx * 0.01]
  ];
}
