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
import { detailLevel }from '@engine/set/mesh/detailLevel.js';

/**
 * finalizeModel - Finalizes and activates a mesh model
 * 
 * @param {Object} newModelCopy - The processed mesh model to activate
 * @param {boolean} animateMorph - Whether to animate the transition
 * @param {string} name - Display name for the model
 * @param {number} detailLevel - LOD detail level (0-1)
 * 
 * This function:
 * 1. Stores the new model as BASE_MODEL for LOD control
 * 2. If animateMorph is true and there's an old model, starts a morph animation
 * 3. Otherwise, directly sets the detail level (instant transition)
 */
export function finalizeModel(newModelCopy, animateMorph, name, detailLevel) {
  // Get the current model (if any) for morph source
  const oldModel = globalThis.MODEL;
  
  // Always set BASE_MODEL so LOD slider works after morph completes
  // This is the "full detail" version that LOD scales down from
  globalThis.BASE_MODEL = newModelCopy;
  
  // Decide between morph animation and instant transition
  if (animateMorph && oldModel?.V?.length && globalThis.morph?.startMorph) {
    // Morph animation: smooth transition from old to new model
    // The callback sets the detail level after morph completes
    globalThis.morph.startMorph(oldModel, newModelCopy, globalThis.MORPH_DURATION_MS, () => {
      detailLevel(detailLevel, name);
    });
  } else {
    // Instant transition: directly set the detail level
    // This immediately activates the new model at the specified LOD
    detailLevel(detailLevel, name);
  }
}
