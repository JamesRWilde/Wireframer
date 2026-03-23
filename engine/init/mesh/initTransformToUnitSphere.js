/**
 * transformToUnitSphere.js - Transforms points from center/radius to unit sphere
 *
 * PURPOSE:
 *   Normalizes mesh vertices to unit sphere coordinates given center/radius.
 *
 * ARCHITECTURE ROLE:
 *   Used during mesh normalization to map bounding sphere geometry to [-1,1]
 *   coordinate space for consistent rendering behavior.
 *
 * WHY THIS EXISTS:
 *   Provides a central normalization step so transformations are identical
 *   for all meshes and avoids repeated manual coordinate math.
 */

"use strict";

export function initTransformToUnitSphere(V, center, maxR) {
  const [cx, cy, cz] = center;
  for (const v of V) {
    v[0] = (v[0] - cx) / maxR;
    v[1] = (v[1] - cy) / maxR;
    v[2] = (v[2] - cz) / maxR;
  }
}
