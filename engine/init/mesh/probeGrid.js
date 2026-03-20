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

import { findNearestInGrid } from '@engine/init/mesh/findNearestInGrid.js';

export function probeGrid(point, grid, verts, min, cellSize, maxRadius = 3) {
  return findNearestInGrid(point, grid, verts, min, cellSize, maxRadius);
}
