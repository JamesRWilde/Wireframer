/**
 * clampToUnitSphere.js - Clamp vertices to unit sphere surface
 *
 * PURPOSE:
 *   Ensures vertex positions do not exceed unit sphere radius after normalization.
 *
 * ARCHITECTURE ROLE:
 *   Called by normalization routines to keep mesh data inside valid bounds.
 *
 * WHY THIS EXISTS:
 *   Provides safe bounding sphere enforcement so mesh coordinates never drift
 *   outside [-1,1] range in GPU/cpu projections.
 */

"use strict";

export function clampToUnitSphere(V) {
  for (const v of V) {
    const r2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    if (r2 > 1) {
      const r = Math.hypot(v[0], v[1], v[2]);
      v[0] /= r;
      v[1] /= r;
      v[2] /= r;
    }
  }
}
