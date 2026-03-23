/**
 * cpuDetailCap.js - CPU Mode Detail Caps for Performance Safety
 *
 * PURPOSE:
 *   Defines maximum vertex/edge counts for CPU rendering and provides
 *   a function to cap a model to those limits via decimation.
 *   GPU mode is unaffected — only CPU mode is capped.
 *
 * ARCHITECTURE ROLE:
 *   Called by finalizeModel after BASE_MODEL is set. Creates
 *   modelState.cpuBaseModel as either the original or a pre-decimated
 *   version. detailLevel() then decimates from CPU_BASE_MODEL for the
 *   detail slider, ensuring CPU mode never exceeds the caps.
 *
 * RATIONALE:
 *   Complex meshes (e.g. pinecone: 40000+ verts) bring CPU rendering to
 *   single-digit FPS. By capping at a safe maximum, CPU mode stays usable
 *   regardless of mesh complexity. The detail slider still works from 100%
 *   (at the cap) down to 0%.
 */

"use strict";

import { decimateByPercent } from '@engine/init/mesh/initDecimateByPercent.js';
import { setDecimateToCap } from '@engine/set/mesh/setDecimateToCap.js';

/** @type {number} Maximum vertices for CPU mode before auto-decimation */
export const CPU_MAX_VERTS = 2000;

/** @type {number} Maximum edges for CPU mode before auto-decimation */
export const CPU_MAX_EDGES = 7000;

/**
 * setCapModelForCpu - Pre-decimates a model to CPU-safe limits
 *
 * Checks if the model exceeds CPU caps and, if so, decimates it
 * to bring both vertices and edges under the limits. Returns the
 * original model if already within limits.
 *
 * @param {Object} model - The base model (with V, F, E arrays)
 * @returns {Object} Either the original model or a decimated copy
 */
export function setCapModelForCpu(model) {
  if (!model?.V?.length) return model;

  const verts = model.V.length;
  const edges = model.E?.length ?? 0;

  // If already under both caps, keep model as-is
  if (verts <= CPU_MAX_VERTS && edges <= CPU_MAX_EDGES) {
    return model;
  }

  // If completely over, find the best cell-cluster decimation result under caps.
  const best = setDecimateToCap(model, CPU_MAX_VERTS, CPU_MAX_EDGES);

  return best || model;
}

