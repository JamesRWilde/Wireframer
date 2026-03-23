/**
 * evaluateCell.js - returns true if any vertex in `cell` is closer than current best
 *
 * PURPOSE:
 *   Compares points in a single cell to the current best nearest-point result.
 *
 * ARCHITECTURE ROLE:
 *   Used by spatial neighborhood search to update nearest vertex references.
 *
 * WHY THIS EXISTS:
 *   Keeps cell-level distance testing in one unit, improving readability of grid search flow.
 *
 * Architecture:
 *   One function per file.
 */

"use strict";

export function evaluateCell(cell, verts, point, bestDistSqAndIdx) {
  for (const idx of cell) {
    const v = verts[idx];
    const dx = v[0] - point[0];
    const dy = v[1] - point[1];
    const dz = v[2] - point[2];
    const d = dx * dx + dy * dy + dz * dz;

    if (d < bestDistSqAndIdx.bestDistSq) {
      bestDistSqAndIdx.bestDistSq = d;
      bestDistSqAndIdx.bestIdx = idx;
      return true;
    }
  }

  return false;
}
