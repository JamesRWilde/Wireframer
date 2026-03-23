/**
 * setDecimateToCap.js - Binary Search Decimation for Vertex/Edge Caps
 *
 * PURPOSE:
 *   Uses binary search over spatial cell sizes to find the optimal decimation
 *   that keeps both vertex count and edge count under specified maximums.
 *
 * ARCHITECTURE ROLE:
 *   Called by setCapModelForCpu to find the best decimation that fits
 *   within CPU performance limits. Delegates the actual decimation to
 *   setClusterDecimate at each binary search step.
 *
 * WHY THIS EXISTS:
 *   Simple percentage decimation doesn't guarantee a result under both
 *   vertex and edge caps simultaneously. Binary search finds the finest
 *   cell size that satisfies both constraints while preserving maximum detail.
 */

"use strict";

// Import decimation by percentage — used as fallback if no cap-fitting result found
import { decimateByPercent } from '@engine/init/mesh/initDecimateByPercent.js';
// Import bounding box computation — needed to determine spatial extent for cell sizing
import { getBoundingBox } from '@engine/get/mesh/getBoundingBox.js';
// Import cluster decimator — performs the actual vertex merging at a given cell size
import { setClusterDecimate } from '@engine/set/mesh/setClusterDecimate.js';

/**
 * setDecimateToCap - Binary searches for the smallest cell size that fits under caps
 * @param {Object} model - The model with V, F, E arrays
 * @param {number} maxVerts - Maximum vertex count
 * @param {number} maxEdges - Maximum edge count
 * @returns {Object|null} The best decimated model, or null if nothing found
 */
export function setDecimateToCap(model, maxVerts, maxEdges) {
  if (!model?.V?.length) return model;

  // Compute spatial bounding box for cell size calculation
  const { minX, minY, minZ, extent } = getBoundingBox(model.V);
  const best = { model: null, verts: 0 };

  // Binary search range: fine cells (0.05%) to coarse cells (50%) of bounding extent
  let low = extent * 0.0005;
  let high = extent * 0.5;

  for (let iter = 0; iter < 20; iter++) {
    const mid = (low + high) / 2;
    const candidate = setClusterDecimate(model, minX, minY, minZ, extent, mid);
    if (!candidate) break;

    const v = candidate.V.length;
    const e = candidate.E.length;

    if (v <= maxVerts && e <= maxEdges) {
      // Candidate fits under caps — record it and try finer detail
      if (v > best.verts) {
        best.model = candidate;
        best.verts = v;
      }
      high = mid;
    } else {
      // Too many vertices/edges — try coarser cells
      low = mid;
    }

    // Stop if search range has converged
    if (Math.abs(high - low) < 1e-5) break;
  }

  // Return best result under caps, or fall back to 10% decimation
  if (best.model) return best.model;

  return decimateByPercent(model, 0.1);
}
