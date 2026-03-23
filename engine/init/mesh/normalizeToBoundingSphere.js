/**
 * normalizeToBoundingSphere.js - Normalize model vertices to unit sphere
 *
 * One function per file module.
 */

"use strict";

import { computeBoundingBox } from '@engine/init/mesh/computeBoundingBox.js';
import { computeSphereCenter } from '@engine/init/mesh/computeSphereCenter.js';
import { computeMaxRadius } from '@engine/init/mesh/computeMaxRadius.js';
import { initTransformToUnitSphere } from '@engine/init/mesh/initTransformToUnitSphere.js';
import { clampToUnitSphere } from '@engine/init/mesh/clampToUnitSphere.js';

export function normalizeToBoundingSphere(V) {
  if (V.length === 0) return;

  const bbox = computeBoundingBox(V);
  const center = computeSphereCenter(bbox.min, bbox.max);
  const maxR = computeMaxRadius(V, center);

  initTransformToUnitSphere(V, center, maxR);
  clampToUnitSphere(V);
}
