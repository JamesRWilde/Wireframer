/**
 * buildSpatialGrid.js - Build spatial hash grid for morph map
 *
 * PURPOSE:
 *   Create a sparse 3D grid of target points that enables fast nearest-neighbor search.
 *
 * ARCHITECTURE ROLE:
 *   Used by morph map computation to accelerate nearest-vertex queries.
 *
 * WHY THIS EXISTS:
 *   Centralizes the spatial grid construction so all morph and proximity logic uses the same indexing behavior.
 *
 * Architecture:
 *   One function per file.
 */

"use strict";

export function buildSpatialGrid(verts, min, cellSize) {
  const grid = new Map();
  const invCell = 1 / cellSize;

  for (let i = 0; i < verts.length; i++) {
    const v = verts[i];
    const cx = Math.floor((v[0] - min[0]) * invCell);
    const cy = Math.floor((v[1] - min[1]) * invCell);
    const cz = Math.floor((v[2] - min[2]) * invCell);
    const key = `${cx},${cy},${cz}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(i);
  }

  return grid;
}
