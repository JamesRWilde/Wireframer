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
 *   mesh. Uses module state directly; no global object dependency.
 *
 * HOW LOD WORKS:
 *   1. The base model (full detail) is stored in modelState.baseModel
 *   2. When detail level changes, we decimate the base model to the target %
 *   3. The decimated model becomes the active model for rendering
 *   4. This ensures LOD always starts from full detail (no quality loss from
 *      repeatedly decimating an already-decimated model)
 */

"use strict";

// Import decimation helper — reduces model complexity by percentage
import { decimateByPercent }from '@engine/init/mesh/initDecimateByPercent.js';
// Import model state — holds base model, cpuBaseModel, and current LOD model
import { modelState } from '@engine/state/render/stateModel.js';
// Import active model setter — swaps the rendered model in shared state
import { setActiveModel } from '@engine/set/render/physics/setActiveModel.js';
// Import GPU mode check — determines which base model to decimate from
import { isGpuMode as getIsGpuMode } from '@engine/get/render/getIsGpuMode.js';
// Import CPU vertex cap — used to decide whether to use uncapped base for small models
import { CPU_MAX_VERTS } from '@engine/set/mesh/setCapModelForCpu.js';

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
export function setDetailLevel(percent, name) {
  // Choose the appropriate base model based on render mode:
  // - GPU mode: use baseModel (full detail, no CPU cap)
  // - CPU mode: use cpuBaseModel (capped for performance)
  let base;
  if (getIsGpuMode()) {
    base = modelState.baseModel;
  } else {
    base = modelState.cpuBaseModel || modelState.baseModel;
  }
  // Legacy fallback: if neither exists, use currently active model
  if (!base) base = modelState.model;

  // Guard: return if no base model is loaded
  if (!base) return;

  // Clamp percentage to valid range (0-1)
  const clampedPercent = Math.max(0, Math.min(1, percent));

  // Track the LOD percentage so scene.js can mirror it on GPU
  modelState.currentLodPct = clampedPercent;

  // If the user requests full detail, avoid unnecessary decimation and
  // ensure the active LOD model is the full base model (no intermediate copy).
  if (clampedPercent >= 0.999) {
    if (!getIsGpuMode() && modelState.baseModel?.V?.length <= CPU_MAX_VERTS) {
      // For small models in CPU mode, use the uncapped base model to prevent
      // undesired downsampling due to prior cap state.
      modelState.currentLodModel = modelState.baseModel;
    } else {
      modelState.currentLodModel = base;
    }
    setActiveModel(modelState.currentLodModel, name);
    return;
  }

  // Decimate the base model to the target detail level
  // Always decimate from CPU_BASE_MODEL to avoid quality loss from repeated decimation
  modelState.currentLodModel = decimateByPercent(base, clampedPercent);

  // Set the decimated model as active for rendering
  setActiveModel(modelState.currentLodModel, name);
}


