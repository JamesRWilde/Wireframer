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

import { initFindNearestInGrid } from '@engine/init/mesh/initFindNearestInGrid.js';

export function probeGrid(point, grid, verts, min, cellSize, maxRadius = 3) {
  return initFindNearestInGrid(point, grid, verts, min, cellSize, maxRadius);
}
