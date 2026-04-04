/**
 * setDecimateToCap.js - Binary Search Decimation for Vertex/Edge Caps
 *
 * PURPOSE:
 *   Uses binary search over spatial cell sizes to find the optimal decimation
 *   that keeps both vertex count and edge count under specified maximums.
 *   Always clones from the baker's pristine shelf before decimating so that
 *   increasing the detail slider always has the full original model to work
 *   from — not a degraded copy of an already-decimated mesh.
 *
 * ARCHITECTURE ROLE:
 *   Called by utilCpuDetailCap to find the best decimation that fits
 *   within CPU performance limits. Delegates the actual decimation to
 *   utilDecimateByCluster at each binary search step.
 *
 * WHY THIS EXISTS:
 *   Simple percentage decimation doesn't guarantee a result under both
 *   vertex and edge caps simultaneously. Binary search finds the finest
 *   cell size that satisfies both constraints while preserving maximum detail.
 *   Cloning from the baker's shelf ensures nobody ever re-parses the OBJ.
 */

"use strict";

// Import bake state — direct access to the baker's shelf (no getter wrapper)
import { bakeState } from '@engine/state/mesh/stateBakeState.js';
// Import mesh clone — creates a working copy without copying baked geometry
import { cloneMesh } from '@engine/init/mesh/initCloneMesh.js';
// Import derived geometry baker — computes normals on decimated copies
import { utilBakeDerived } from '@engine/util/mesh/utilBakeDerived.js';
// Import percentage decimator — binary searches detail level under CPU caps
import { decimateByPercent } from '@engine/init/mesh/initDecimateByPercent.js';

/** @type {number} Maximum vertices for CPU mode before auto-decimation */
export const CPU_MAX_VERTS = 2000;

/** @type {number} Maximum edges for CPU mode before auto-decimation */
export const CPU_MAX_EDGES = 7000;

/**
 * setDecimateToCap - Binary searches for the smallest cell size that fits under caps
 * @param {Object} currentModel - The model needing decimation (provides shelf reference)
 * @returns {Object} Decimated model with baked geometry and shelf reference wired
 */
export function setDecimateToCap(currentModel) {
  // Guard: nothing to decimate
  if (!currentModel?.V?.length) return currentModel;

  // Get the baker's shelf model — prefer the current model's reference
  // (set during load), fall back to global bakeState. The shelf is the
  // pristine baked model that nobody ever modifies.
  const shelf = currentModel._bakedShelfModel || bakeState._bakedShelfModel;

  // Clone from the shelf so we always decimate from full detail.
  // Passing shelf as second arg wires the clone's _bakedShelfModel back to shelf.
  const baseForDecimation = shelf ? cloneMesh(shelf, shelf) : cloneMesh(currentModel);

  // Check if the full (cloned) model is already under both CPU caps.
  // If so, return it directly — no decimation needed.
  const verts = baseForDecimation.V.length;
  const edges = baseForDecimation.E?.length ?? 0;
  if (verts <= CPU_MAX_VERTS && edges <= CPU_MAX_EDGES) return baseForDecimation;

  // Binary search for the best detail percentage under caps.
  // 20 iterations gives sufficient precision for visual quality.
  let lo = 0, hi = 1, best = null;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const candidate = decimateByPercent(baseForDecimation, mid);
    const cVerts = candidate.V.length;
    const cEdges = candidate.E?.length ?? 0;
    if (cVerts <= CPU_MAX_VERTS && cEdges <= CPU_MAX_EDGES) {
      best = candidate;
      lo = mid; // try to keep more detail
    } else {
      hi = mid;
    }
  }

  // Get shading parameters from the current model for matching normals
  const crease = currentModel._creaseAngleDeg ?? 62;
  const mode = currentModel._shadingMode ?? 'smooth';

  if (best) {
    // Wire the shelf reference so the decimated copy can also find
    // the baker's pristine model for future upgrades or resets
    best._bakedShelfModel = shelf || currentModel;
    // Bake geometry on the decimated copy so the render loop gets
    // cached normals instead of computing from scratch every frame
    utilBakeDerived(best, crease, mode);
    return best;
  }

  // Last resort: aggressive decimation
  const fallback = decimateByPercent(baseForDecimation, 0.1);
  fallback._bakedShelfModel = shelf || currentModel;
  utilBakeDerived(fallback, crease, mode);
  return fallback;
}
