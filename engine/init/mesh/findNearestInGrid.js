/**
 * findNearestInGrid.js - helper for nearest neighbor search in spatial grid
 *
 * Architecture:
 *   Internal helper (one function) for managing nested loops and candidate
 *   cell checks. This keeps `probeGrid.js` lightweight and reduces its
 *   Cognitive Complexity.
 */

"use strict";

export function findNearestInGrid(point, grid, verts, min, cellSize, maxRadius) {
  const invCell = 1 / cellSize;
  const cx = Math.floor((point[0] - min[0]) * invCell);
  const cy = Math.floor((point[1] - min[1]) * invCell);
  const cz = Math.floor((point[2] - min[2]) * invCell);

  let bestIdx = 0;
  let bestDistSq = Infinity;

  const evaluateCell = (cell) => {
    for (const idx of cell) {
      const v = verts[idx];
      const dx = v[0] - point[0];
      const dy = v[1] - point[1];
      const dz = v[2] - point[2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestDistSq) {
        bestDistSq = d;
        bestIdx = idx;
        return true;
      }
    }
    return false;
  };

  const checkRadiusLayer = (radius) => {
    let foundBetter = false;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (radius > 0 && Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== radius) continue;
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const cell = grid.get(key);
          if (!cell) continue;
          if (evaluateCell(cell)) foundBetter = true;
        }
      }
    }
    return foundBetter;
  };

  for (let radius = 0; radius <= maxRadius; radius++) {
    const foundBetter = checkRadiusLayer(radius);
    if (foundBetter && bestDistSq < (cellSize * radius * 2) ** 2) break;
  }

  return bestIdx;
}

