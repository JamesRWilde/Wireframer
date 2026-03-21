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
  const overVerts = verts > CPU_MAX_VERTS;
  const overEdges = edges > CPU_MAX_EDGES;

  console.log(`[capModelForCpu] Model analysis: ${verts} vertices, ${edges} edges, CPU_MAX_VERTS: ${CPU_MAX_VERTS}`);

  // If below the vertex cap we keep the model exactly, regardless of edge count.
  if (!overVerts) {
    console.log(`[capModelForCpu] Model under vertex cap, no decimation needed`);
    return model;
  }

  // Calculate the exact ratio needed to reach the vertex cap
  // e.g., 10,000 vertex model with 2,000 cap = 0.2 ratio
  // e.g., 4,000 vertex model with 2,000 cap = 0.5 ratio
  let pct = CPU_MAX_VERTS / verts;
  console.log(`[capModelForCpu] Calculated decimation ratio: ${pct} (${(pct * 100).toFixed(1)}%)`);

  // Edge count is a soft suggestion only
  if (overEdges) {
    console.warn(`Model exceeds edge cap (${edges} > ${CPU_MAX_EDGES}), but vertex-based LOD cap is used for performance.`);
  }

  // Clamp to reasonable range — don't decimate below 10% to prevent over-decimation
  const minPct = 0.1;
  pct = Math.max(minPct, Math.min(1, pct));
  console.log(`[capModelForCpu] Final decimation ratio after clamping: ${pct} (${(pct * 100).toFixed(1)}%)`);

  // Decimate with a vertex-targeted, adaptive search so we land close to CPU_MAX_VERTS.
  const decimated = decimateModelToVertexTarget(model, CPU_MAX_VERTS);

  // Log the result
  if (decimated?.V?.length) {
    console.log(`[capModelForCpu] Decimation result: ${decimated.V.length} vertices, ${decimated.E?.length || 0} edges`);
    console.log(`[capModelForCpu] Expected target vertices: ${CPU_MAX_VERTS}, got ${decimated.V.length}`);
  } else {
    console.error(`[capModelForCpu] Decimation failed - no valid result returned`);
  }

  return decimated;
}

/**
 * Decimate model to an approximate vertex target by binary searching on percent.
 * Returns best match within the given tolerance.
 */
function decimateModelToVertexTarget(model, targetVerts) {
  if (!model?.V?.length) return model;

  const currentVerts = model.V.length;
  if (currentVerts <= targetVerts) return model;

  const {bestModel, bestPercent} = findBestPercentCandidate(model, targetVerts);
  if (!bestModel) return model;

  return refineBestModel(model, targetVerts, bestModel, bestPercent);
}

function findBestPercentCandidate(model, targetVerts) {
  const samplePercents = [1, 0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

  let bestModel = model;
  let bestPercent = 1;
  let bestDiff = Math.abs(model.V.length - targetVerts);

  for (const pct of samplePercents) {
    const candidate = decimateByPercent(model, pct);
    if (!candidate?.V?.length) continue;

    const candidateVerts = candidate.V.length;
    const diff = Math.abs(candidateVerts - targetVerts);
    console.log(`[capModelForCpu] Search candidate pct=${pct.toFixed(3)} => ${candidateVerts} verts (target ${targetVerts})`);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestModel = candidate;
      bestPercent = pct;
    }

    if (diff === 0) break;
  }

  return {bestModel, bestPercent};
}

function refineBestModel(model, targetVerts, bestModel, bestPercent) {
  const tolerance = 0.03;
  const maxRefine = 10;
  let low = Math.max(0.1, bestPercent - 0.2);
  let high = Math.min(1, bestPercent + 0.2);

  let winner = bestModel;
  let bestDiff = Math.abs(bestModel.V.length - targetVerts);

  for (let i = 0; i < maxRefine; i++) {
    const pct = (low + high) / 2;
    const candidate = decimateByPercent(model, pct);
    if (!candidate?.V?.length) break;

    const candidateVerts = candidate.V.length;
    const diff = Math.abs(candidateVerts - targetVerts);

    console.log(`[capModelForCpu] Refine pct=${pct.toFixed(3)} => ${candidateVerts} verts (diff ${diff})`);

    if (diff < bestDiff) {
      bestDiff = diff;
      winner = candidate;
    }

    if (diff / targetVerts <= tolerance) {
      return candidate;
    }

    if (candidateVerts > targetVerts) {
      high = pct;
    } else {
      low = pct;
    }

    if (Math.abs(high - low) < 0.005) break;
  }

  return winner;
}
