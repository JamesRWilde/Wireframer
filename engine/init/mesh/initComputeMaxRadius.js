/**
 * computeMaxRadius.js - Per-vertex maximum radius from center
 *
 * PURPOSE:
 *   Computes maximum distance from the center to any vertex in the mesh.
 *
 * ARCHITECTURE ROLE:
 *   Used by normalization utilities to determine scaling for unit sphere conversion.
 *
 * WHY THIS EXISTS:
 *   Ensures all meshes are scaled consistently based on their own extents.
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
