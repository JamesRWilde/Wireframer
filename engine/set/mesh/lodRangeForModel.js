/**
 * lodRangeForModel.js - LOD Range Configuration for Model
 * 
 * PURPOSE:
 *   Sets the LOD (Level of Detail) range for a specific model. This defines
 *   the minimum and maximum vertex counts available for the detail slider
 *   when this model is active.
 * 
 * ARCHITECTURE ROLE:
 *   Called by load when a new model is loaded. Updates the shared LOD range
 *   state so the UI slider can be configured appropriately for the model.
 * 
 * WHY PER-MODEL RANGE:
 *   Different models have vastly different vertex counts. A small cube might
 *   have 8 vertices while a Menger sponge has thousands. The LOD slider
 *   range should reflect the current model's complexity.
 */

/**
 * lodRangeForModel - Sets the LOD range for a model
 * 
 * @param {Object} model - The mesh model with V (vertices) array
 * 
 * Updates shared LOD range state with:
 * - min: Minimum vertex count (from LODManager or default 3)
 * - max: Maximum vertex count (model's full vertex count)
 * 
 * This range is used by the UI to configure the LOD slider.
 */
import { setLodRange } from '@engine/set/mesh/setLodRange.js';

export function lodRangeForModel(model) {
  // Set LOD range based on model's vertex count
  // Minimum comes from LODManager config or defaults to 3 (smallest valid mesh)
  // Maximum is the model's full vertex count (100% detail)
  const minVal = 'window' in globalThis && globalThis.window.LODManager?.MIN_VERTS ? globalThis.window.LODManager.MIN_VERTS : 3;
  setLodRange({
    min: minVal,
    max: model.V.length,
  });
}
