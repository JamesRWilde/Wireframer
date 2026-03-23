/**
 * getBoundingBox.js - Axis-aligned bounding box calculator
 *
 * One function per file module.
 */

"use strict";

export function computeBoundingBox(V) {
  let bx = Infinity, by = Infinity, bz = Infinity;
  let Bx = -Infinity, By = -Infinity, Bz = -Infinity;

  for (const v of V) {
    if (v[0] < bx) bx = v[0];
    if (v[0] > Bx) Bx = v[0];
    if (v[1] < by) by = v[1];
    if (v[1] > By) By = v[1];
    if (v[2] < bz) bz = v[2];
    if (v[2] > Bz) Bz = v[2];
  }

  return { min: [bx, by, bz], max: [Bx, By, Bz] };
}
