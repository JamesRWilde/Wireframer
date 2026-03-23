/**
 * probeGrid.js - Nearest neighbor search inside spatial grid
 *
 * PURPOSE:
 *   Finds the nearest vertex in the spatial hash grid for a query point.
 *
 * ARCHITECTURE ROLE:
 *   Wrapper that delegates to initFindNearestInGrid, making the API consistent
 *   for grid-based neighbor queries.
 *
 * WHY THIS EXISTS:
 *   Provides a single exported probe API so callers don't need to know about
 *   the underlying step implementation and can stay decoupled.
 */

"use strict";

import { initFindNearestInGrid } from '@engine/init/mesh/initFindNearestInGrid.js';

export function probeGrid(point, grid, verts, min, cellSize, maxRadius = 3) {
  return initFindNearestInGrid(point, grid, verts, min, cellSize, maxRadius);
}
