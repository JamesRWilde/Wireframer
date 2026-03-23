/**
 * processLayer.js - process a single depth slice within a radius shell
 *
 * Architecture:
 *   One function per file.
 */

"use strict";

import { evaluateCell } from '@engine/init/mesh/initEvaluateCell.js';

export function initProcessLayer(dx, dy, radius, context) {
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
