/**
 * computeMaxRadius.js - Per-vertex maximum radius from center
 *
 * One function per file module.
 */

"use strict";

export function computeMaxRadius(V, center) {
  let maxR = 0;
  const [cx, cy, cz] = center;

  for (const v of V) {
    const r = Math.hypot(v[0] - cx, v[1] - cy, v[2] - cz);
    if (r > maxR) maxR = r;
  }

  return maxR < 1e-10 ? 1 : maxR;
}
