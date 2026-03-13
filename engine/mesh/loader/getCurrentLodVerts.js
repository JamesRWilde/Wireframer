/**
 * getCurrentLodVerts.js - Current LOD Vertex Count
 * 
 * PURPOSE:
 *   Returns the number of vertices in the current LOD (Level of Detail) model.
 *   This is used by the UI to display the current vertex count and by the
 *   rendering pipeline to understand the model's complexity.
 * 
 * ARCHITECTURE ROLE:
 *   Called by UI stat displays and rendering code that needs to know the
 *   current model's vertex count. Provides a fallback to the base model
 *   if LOD hasn't been applied yet.
 * 
 * WHY SEPARATE:
 *   The LOD vertex count is stored globally but may not be initialized.
 *   This function provides a safe accessor with fallback logic.
 */

/**
 * getCurrentLodVerts - Gets the current LOD model's vertex count
 * 
 * @returns {number} Number of vertices in the current LOD model
 *   Falls back to base model vertex count if LOD not set
 *   Returns 0 if no model is loaded
 */
export function getCurrentLodVerts() {
  // Return LOD vertex count if available, otherwise base model count, or 0
  return globalThis.CURRENT_LOD_VERTS || (globalThis.BASE_MODEL ? globalThis.BASE_MODEL.V.length : 0);
}
