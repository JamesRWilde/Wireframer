/**
 * evaluateCell.js - returns true if any vertex in `cell` is closer than current best
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
