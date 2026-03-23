/**
 * normalizeToBoundingSphere.js - Normalize model vertices to unit sphere
 *
 * PURPOSE:
 *   Transforms vertices from world-space bounding box into unit sphere space.
 *
 * ARCHITECTURE ROLE:
 *   Called by mesh load pipeline to normalize different model scales and
 *   guarantee consistent coordinate range for rendering and morphing.
 *
 * WHY THIS EXISTS:
 *   Centralizes the bounding sphere normalization sequence and keeps
 *   transformation steps re-usable.
 */

"use strict";

import { computeBoundingBox } from '@engine/init/mesh/initComputeBoundingBox.js';
import { computeSphereCenter } from '@engine/init/mesh/initComputeSphereCenter.js';
import { computeMaxRadius } from '@engine/init/mesh/initComputeMaxRadius.js';
import { initTransformToUnitSphere } from '@engine/init/mesh/initTransformToUnitSphere.js';
import { clampToUnitSphere } from '@engine/init/mesh/initClampToUnitSphere.js';

export function normalizeToBoundingSphere(V) {
  if (V.length === 0) return;

  const bbox = computeBoundingBox(V);
  const center = computeSphereCenter(bbox.min, bbox.max);
  const maxR = computeMaxRadius(V, center);

  initTransformToUnitSphere(V, center, maxR);
  clampToUnitSphere(V);
}
