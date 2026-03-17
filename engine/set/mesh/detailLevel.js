/**
 * SetMeshEngineDetailLevel.js - LOD Detail Level Control
 * 
 * PURPOSE:
 *   Sets the current Level of Detail (LOD) for the active model. This function
 *   takes a percentage (0-1) and generates a decimated version of the base model
 *   with the appropriate vertex count. Lower percentages produce simpler models
 *   with fewer vertices, improving performance at the cost of visual fidelity.
 * 
 * ARCHITECTURE ROLE:
 *   Called by the LOD slider handler and by InitMeshEngineFinalizeModel when loading a new
 *   mesh. Exposed globally as globalThis.SetMeshEngineDetailLevel for UI access.
 * 
 * HOW LOD WORKS:
 *   1. The base model (full detail) is stored in globalThis.BASE_MODEL
 *   2. When detail level changes, we decimate the base model to the target %
 *   3. The decimated model becomes the active model for rendering
 *   4. This ensures LOD always starts from full detail (no quality loss from
 *      repeatedly decimating an already-decimated model)
 */

// Import the mesh decimation algorithm
// This reduces vertex count while preserving the model's overall shape
import { decimateByPercent }from '@engine/init/mesh/decimateByPercent.js';

/**
 * SetMeshEngineDetailLevel - Sets the LOD detail level for the active model
 * 
 * @param {number} percent - Detail level as a percentage (0-1)
 *   1 = full detail (all vertices)
 *   0 = minimum detail (fewest vertices)
 * @param {string} [name='Shape'] - Display name for the model
 *   Passed through to setActiveModel for the UI label
 * 
 * This function:
 * 1. Clamps the percentage to valid range (0-1)
 * 2. Calculates target vertex count from percentage
 * 3. Decimates the base model to the target vertex count
 * 4. Sets the decimated model as active for rendering
 */
export function detailLevel(percent, name = 'Shape') {
  // Guard: return if no base model is loaded
  if (!globalThis.BASE_MODEL) return;
  
  // Clamp percentage to valid range (0-1)
  const clampedPercent = Math.max(0, Math.min(1, percent));
  
  // Calculate target vertex count
  // This is used by the UI to display current LOD vertex count
  globalThis.CURRENT_LOD_VERTS = Math.round(clampedPercent * globalThis.BASE_MODEL.V.length);
  
  // Decimate the base model to the target detail level
  // Always decimate from BASE_MODEL to avoid quality loss from repeated decimation
  globalThis.CURRENT_LOD_MODEL = InitMeshEngineDecimateByPercent(globalThis.BASE_MODEL, clampedPercent);

  // Set the decimated model as active for rendering
  if (typeof globalThis.setActiveModel === 'function') {
    globalThis.setActiveModel(globalThis.CURRENT_LOD_MODEL, name);
  }
}

// Expose globally for UI slider handler
// The LOD slider calls this when the user adjusts the detail level
globalThis.SetMeshEngineDetailLevel = SetMeshEngineDetailLevel;
