/**
 * probeGrid.js - Nearest neighbor search inside spatial grid
 *
 * Purpose:
 *   Finds the nearest vertex in the spatial hash grid for a query point.
 *
 * Architecture:
 *   One function per file.
 */

"use strict";

export function probeGrid(point, grid, verts, min, cellSize, maxRadius = 3) {
  const invCell = 1 / cellSize;
  const cx = Math.floor((point[0] - min[0]) * invCell);
  const cy = Math.floor((point[1] - min[1]) * invCell);
  const cz = Math.floor((point[2] - min[2]) * invCell);

  let bestIdx = 0;
  let bestDistSq = Infinity;

  for (let radius = 0; radius <= maxRadius; radius++) {
    let foundBetter = false;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (radius > 0 && Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== radius) continue;
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const cell = grid.get(key);
          if (!cell) continue;
          for (const idx of cell) {
            const v = verts[idx];
            const d = (v[0] - point[0]) ** 2 + (v[1] - point[1]) ** 2 + (v[2] - point[2]) ** 2;
            if (d < bestDistSq) {
              bestDistSq = d;
              bestIdx = idx;
              foundBetter = true;
            }
          }
        }
      }
    }
    if (foundBetter && bestDistSq < (cellSize * radius * 2) ** 2) break;
  }

  return bestIdx;
}
