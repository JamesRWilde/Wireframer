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

export function findNearestInGrid(point, grid, verts, min, cellSize, maxRadius) {
  const invCell = 1 / cellSize;
  const cx = Math.floor((point[0] - min[0]) * invCell);
  const cy = Math.floor((point[1] - min[1]) * invCell);
  const cz = Math.floor((point[2] - min[2]) * invCell);

  const bestDistSqAndIdx = {
    bestIdx: 0,
    bestDistSq: Infinity,
  };

  const cellContext = { cx, cy, cz, grid, verts, point, bestDistSqAndIdx };

  for (let radius = 0; radius <= maxRadius; radius++) {
    const foundBetter = checkRadiusLayer(radius, cellContext);
    if (foundBetter && bestDistSqAndIdx.bestDistSq < (cellSize * radius * 2) ** 2) break;
  }

  return bestDistSqAndIdx.bestIdx;
}

