/**
 * finalizeModel.js - Model Finalization and Activation
 * 
 * PURPOSE:
 *   Finalizes a loaded mesh model by setting it as the base model for LOD
 *   control and optionally triggering a morph animation from the previous
 *   model. This is the last step in the mesh loading pipeline.
 * 
 * ARCHITECTURE ROLE:
 *   Called by load after the model has been validated, processed, and
 *   the camera has been fitted. Handles the transition from the old model
 *   to the new one, either instantly or via morph animation.
 * 
 * WHY SEPARATE:
 *   The finalization logic is complex (morph vs instant, LOD setup, callback
 *   handling) and benefits from being isolated for maintainability.
 */

// Import the detail level setter for LOD control
import { setDetailLevel }from '@engine/set/mesh/setDetailLevel.js';

import { modelState } from '@engine/state/render/stateModel.js';
import { getMorph } from '@engine/get/mesh/getMorph.js';
import { getMorphDuration } from '@engine/get/mesh/getMorphDuration.js';
import { setCapModelForCpu } from '@engine/set/mesh/setCapModelForCpu.js';
import { isGpuMode as getIsGpuMode } from '@engine/get/render/getIsGpuMode.js';
import { setLodRangeForModel } from '@engine/set/mesh/setLodRangeForModel.js';

/**
 * finalizeModel - Finalizes and activates a mesh model
 * 
 * @param {Object} newModelCopy - The processed mesh model to activate
 * @param {boolean} animateMorph - Whether to animate the transition
 * @param {string} name - Display name for the model
 * @param {number} detailLevelPct - LOD detail level (0-1)
 * 
 * This function:
 * 1. Stores the new model as BASE_MODEL for LOD control
 * 2. If animateMorph is true and there's an old model, starts a morph animation
 * 3. Otherwise, directly sets the detail level (instant transition)
 */
export function finalizeModel(newModelCopy, animateMorph, name, detailLevelPct, targetZoom) {
  // Get the current model (if any) for morph source
  const oldModel = modelState.model;
  
  // Always set BASE_MODEL so LOD slider works after morph completes
  modelState.baseModel = newModelCopy;

  // In CPU mode, create CPU_BASE_MODEL by applying the cap
  // GPU mode uses the full base model directly
  if (!getIsGpuMode()) {
    modelState.cpuBaseModel = setCapModelForCpu(newModelCopy);
    // Update LOD range to reflect the capped model's vertex count
    // This ensures the slider's 100% corresponds to the actual maximum available in CPU mode
    setLodRangeForModel(modelState.cpuBaseModel);
  } else {
    // In GPU mode, LOD range uses the full model's vertex count
    setLodRangeForModel(newModelCopy);
  }

  // Reset LOD to full detail on new model load
  modelState.currentLodPct = 1;
  
  // Decide between morph animation and instant transition
  const morphApi = getMorph();
  const morphDuration = getMorphDuration();

  if (animateMorph && oldModel?.V?.length && morphApi?.startMorph) {
    // Morph animation: smooth transition from old to new model
    // Pass targetZoom so the morph interpolates zoom as well as vertices
    morphApi.startMorph(oldModel, newModelCopy, morphDuration, () => {
      setDetailLevel(detailLevelPct, name);
    }, targetZoom);
  } else {
    // Instant transition: directly set the detail level
    // This immediately activates the new model at the specified LOD
    setDetailLevel(detailLevelPct, name);
  }
}
