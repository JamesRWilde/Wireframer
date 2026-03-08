/**
 * decimateToCap.js - Binary search decimation to find optimal detail under caps
 *
 * One function per file module.
 */

"use strict";

import { decimateByPercent } from '@engine/init/mesh/decimateByPercent.js';
import { computeBoundingBox } from '@engine/get/mesh/computeBoundingBox.js';
import { clusterDecimate } from '@engine/set/mesh/clusterDecimate.js';

/**
 * decimateToCap - Binary searches for the smallest cell size that fits under vertex/edge caps
 *
 * Uses a binary search over cell sizes to find the finest decimation that keeps
 * both vertex count and edge count under the specified maximums.
 *
 * @param {Object} model - The model with V, F, E arrays
 * @param {number} maxVerts - Maximum vertex count
 * @param {number} maxEdges - Maximum edge count
 * @returns {Object|null} The best decimated model, or null if nothing found
 */
export function decimateToCap(model, maxVerts, maxEdges) {
  if (!model?.V?.length) return model;

  const { minX, minY, minZ, extent } = computeBoundingBox(model.V);
  const best = { model: null, verts: 0 };

  let low = extent * 0.0005;
  let high = extent * 0.5;

  for (let iter = 0; iter < 20; iter++) {
    const mid = (low + high) / 2;
    const candidate = clusterDecimate(model, minX, minY, minZ, extent, mid);
    if (!candidate) break;

    const v = candidate.V.length;
    const e = candidate.E.length;

    if (v <= maxVerts && e <= maxEdges) {
      if (v > best.verts) {
        best.model = candidate;
        best.verts = v;
      }
      high = mid;
    } else {
      low = mid;
    }

    if (Math.abs(high - low) < 1e-5) break;
  }

  if (best.model) return best.model;

  return decimateByPercent(model, 0.1);
}
