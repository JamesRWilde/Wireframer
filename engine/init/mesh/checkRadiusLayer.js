/**
 * checkRadiusLayer.js - check one radius shell in the grid for a closer point
 *
 * Architecture:
 *   One function per file.
 */

"use strict";

import { evaluateCell } from '@engine/init/mesh/evaluateCell.js';

function processLayer(dx, dy, radius, context) {
  const { cx, cy, cz, grid, verts, point, bestDistSqAndIdx } = context;

  for (let dz = -radius; dz <= radius; dz++) {
    if (radius > 0 && Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== radius) continue;

    const key = `${cx + dx},${cy + dy},${cz + dz}`;
    const cell = grid.get(key);
    if (!cell) continue;

    if (evaluateCell(cell, verts, point, bestDistSqAndIdx)) return true;
  }
  return false;
}

export function checkRadiusLayer(radius, cellContext) {
  let foundBetter = false;

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (processLayer(dx, dy, radius, cellContext)) foundBetter = true;
    }
  }

  return foundBetter;
}
