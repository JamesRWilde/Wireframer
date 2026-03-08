/**
 * clampToUnitSphere.js - Clamp vertices to unit sphere surface
 *
 * One function per file module.
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
