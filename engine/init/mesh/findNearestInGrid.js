/**
 * findNearestInGrid.js - helper for nearest neighbor search in spatial grid
 *
 * Architecture:
 *   Internal helper (one function) for managing nested loops and candidate
 *   cell checks. This keeps `probeGrid.js` lightweight and reduces its
 *   Cognitive Complexity.
 */

"use strict";

import { checkRadiusLayer } from '@engine/init/mesh/checkRadiusLayer.js';

/**
 * findNearestInGrid - Find index of the closest vertex in `verts` to `point`
 *   by probing spatial grid neighbors until a close match is found.
 *
 * @param {Array<number>} point - [x, y, z] query point.
 * @param {Map<string, number[]>} grid - Spatial hash grid mapping cell keys to vertex index arrays.
 * @param {Array<Array<number>>} verts - List of vertex coordinate triplets.
 * @param {Array<number>} min - Minimum bounds [minX, minY, minZ] for grid.
 * @param {number} cellSize - Spatial grid cell size (world units).
 * @param {number} maxRadius - Max search ring radius in cell units.
 * @returns {number} Index of closest vertex in `verts`.
 */
export function findNearestInGrid(point, grid, verts, min, cellSize, maxRadius) {
  // Convert point to cell coordinates in grid space
  const invCell = 1 / cellSize;
  const cx = Math.floor((point[0] - min[0]) * invCell);
  const cy = Math.floor((point[1] - min[1]) * invCell);
  const cz = Math.floor((point[2] - min[2]) * invCell);

  // Track best best distance squared and vertex index found so far
  const bestDistSqAndIdx = {
    bestIdx: 0,
    bestDistSq: Infinity,
  };

  // Assembly object for repeated function calls (fewer args to pass around)
  const cellContext = { cx, cy, cz, grid, verts, point, bestDistSqAndIdx };

  // Expand radius layer by layer until no potential improvement persists
  for (let radius = 0; radius <= maxRadius; radius++) {
    // Check ring at current radius; sets bestDistSqAndIdx if closer vertex found
    const foundBetter = checkRadiusLayer(radius, cellContext);

    // Break early if a close enough vertex was found relative to current radius
    if (foundBetter && bestDistSqAndIdx.bestDistSq < (cellSize * radius * 2) ** 2) break;
  }

  // Return the best index (defaults to 0 if none found)
  return bestDistSqAndIdx.bestIdx;
}

