/**
 * transformToUnitSphere.js - Transforms points from center/radius to unit sphere
 *
 * One function per file module.
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
