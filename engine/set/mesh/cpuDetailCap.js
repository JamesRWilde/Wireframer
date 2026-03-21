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

import { decimateByPercent } from '@engine/init/mesh/decimateByPercent.js';
import { computeBoundingBox } from '@engine/get/mesh/computeBoundingBox.js';
import { assignVerticesToCells } from '@engine/init/mesh/assignVerticesToCells.js';
import { clusterVertices } from '@engine/init/mesh/clusterVertices.js';
import { rebuildFaces } from '@engine/init/mesh/rebuildFaces.js';
import { getMeshEdgesFromFacesRuntime } from '@engine/get/mesh/getEdgesFromFacesRuntime.js';

/** @type {number} Maximum vertices for CPU mode before auto-decimation */
export const CPU_MAX_VERTS = 2000;

/** @type {number} Maximum edges for CPU mode before auto-decimation */
export const CPU_MAX_EDGES = 7000;

/**
 * capModelForCpu - Pre-decimates a model to CPU-safe limits
 *
 * Checks if the model exceeds CPU caps and, if so, decimates it
 * to bring both vertices and edges under the limits. Returns the
 * original model if already within limits.
 *
 * @param {Object} model - The base model (with V, F, E arrays)
 * @returns {Object} Either the original model or a decimated copy
 */
export function capModelForCpu(model) {
  if (!model?.V?.length) return model;

  const verts = model.V.length;
  const edges = model.E?.length ?? 0;

  // If already under both caps, keep model as-is
  if (verts <= CPU_MAX_VERTS && edges <= CPU_MAX_EDGES) {
    return model;
  }

  // If completely over, find the best cell-cluster decimation result under caps.
  const best = decimateToCap(model, CPU_MAX_VERTS, CPU_MAX_EDGES);

  return best || model;
}

function decimateToCap(model, maxVerts, maxEdges) {
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

    // If under both caps, attempt finer detail (smaller cells) to maximize verts.
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

  // fallback to 0.1 if nothing found.
  return decimateByPercent(model, 0.1);
}

function clusterDecimate(model, minX, minY, minZ, extent, cellSize) {
  const cellMap = assignVerticesToCells(model.V, minX, minY, minZ, cellSize);
  const { newVerts, oldToNew } = clusterVertices(model.V, cellMap);
  if (!newVerts?.length) return null;

  const newFaces = model.F?.length ? rebuildFaces(model.F, oldToNew) : [];
  const edgeBuilder = getMeshEdgesFromFacesRuntime();
  const newEdges = edgeBuilder ? edgeBuilder(newFaces) : [];

  return {
    ...model,
    V: newVerts,
    F: newFaces,
    E: newEdges,
    _meshFormat: model._meshFormat,
    _shadingMode: model._shadingMode,
    _creaseAngleDeg: model._creaseAngleDeg,
    _oldToNew: Array.from({ length: model.V.length }, (_, i) => oldToNew.get(i) ?? 0),
  };
}

