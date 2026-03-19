/**
 * detailLevel.js - LOD Detail Level Control
 *
 * PURPOSE:
 *   Sets the current Level of Detail (LOD) for the active model. Takes a
 *   percentage (0-1) and generates a decimated version of the base model
 *   with the appropriate vertex count.
 *
 * ARCHITECTURE ROLE:
 *   Called by the LOD slider handler and by finalizeModel when loading a new
 *   mesh. Exposed globally as globalThis.detailLevel for UI access.
 *
 * HOW LOD WORKS:
 *   1. The base model (full detail) is stored in modelState.baseModel
 *   2. When detail level changes, we decimate the base model to the target %
 *   3. The decimated model becomes the active model for rendering
 *   4. This ensures LOD always starts from full detail (no quality loss from
 *      repeatedly decimating an already-decimated model)
 */

"use strict";

import { decimateByPercent }from '@engine/init/mesh/decimateByPercent.js';
import { modelState, setActiveModel } from '@engine/state/render/model.js';

/**
 * detailLevel - Sets the LOD detail level for the active model
 *
 * @param {number} percent - Detail level as a percentage (0-1)
 *   1 = full detail (all vertices)
 *   0 = minimum detail (fewest vertices)
 * @param {string} [name='Shape'] - Display name for the model
 *
 * This function:
 * 1. Clamps the percentage to valid range (0-1)
 * 2. Calculates target vertex count from percentage
 * 3. Decimates the base model to the target vertex count
 * 4. Sets the decimated model as active for rendering
 */
export function detailLevel(percent, name = 'Shape') {
  // Use CPU_BASE_MODEL if available (capped), fall back to BASE_MODEL
  const base = modelState.cpuBaseModel || modelState.baseModel;

  // Guard: return if no base model is loaded
  if (!base) return;

  // Clamp percentage to valid range (0-1)
  const clampedPercent = Math.max(0, Math.min(1, percent));

  // Track the LOD percentage so scene.js can mirror it on GPU
  modelState.currentLodPct = clampedPercent;

  // If the user requests full detail, avoid unnecessary decimation and
  // ensure the active LOD model is the full base model (no intermediate copy).
  if (clampedPercent >= 0.999) {
    modelState.currentLodModel = base;

    console.log(
      `[detailLevel] pct=1.00 baseVerts=${base?.V?.length ?? 0} (full detail)
`);

    setActiveModel(modelState.currentLodModel, name);
    return;
  }

  // Decimate the base model to the target detail level
  // Always decimate from CPU_BASE_MODEL to avoid quality loss from repeated decimation
  modelState.currentLodModel = decimateByPercent(base, clampedPercent);

  // Debug: log LOD changes for troubleshooting slider behavior
  console.log(
    `[detailLevel] pct=${clampedPercent.toFixed(2)} baseVerts=${base?.V?.length ?? 0} lodVerts=${modelState.currentLodModel?.V?.length ?? 0}`
  );

  // Set the decimated model as active for rendering
  setActiveModel(modelState.currentLodModel, name);
}

// Expose globally for UI slider handler
globalThis.detailLevel = detailLevel;
