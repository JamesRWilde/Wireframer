/**
 * utilModelTriangles.js - Triangle Face Accessor
 * 
 * PURPOSE:
 *   Extracts triangle face data from a model object.
 *   Handles multiple model formats and provides consistent triangle array.
 * 
 * ARCHITECTURE ROLE:
 *   Called by fill and wireframe renderers to get triangle faces.
 *   Normalizes different model formats to consistent triangle array.
 * 
 * WHY THIS EXISTS:
 *   Centralizes triangle access logic so renderers can rely on a
 *   single, stable representation regardless of model source format.
 * 
 * SUPPORTED FORMATS:
 *   - model.triangles: Direct triangle array
 *   - model.F: Face array (may have .indices property or be raw arrays)
 */

/**
 * utilModelTriangles - Gets triangle faces from model
 * 
 * @param {Object} model - Model object with triangle/face data
 * 
 * @returns {Array<Array<number>>} Array of triangle faces, each as [v0, v1, v2]
 * 
 * The function:
 * 1. Returns empty array if model is null/undefined
 * 2. Returns model.triangles if available (preferred format)
 * 3. Maps model.F faces, extracting .indices if present
 * 4. Returns empty array if no triangle data found
 */
export function utilModelTriangles(model) {
  // Return empty array if no model
  if (!model) return [];
  
  // Prefer direct triangles property
  if (model.triangles) return model.triangles;
  
  // Fall back to F property, extracting indices if needed
  if (model.F) return model.F.map(f => f.indices || f);
  
  // No triangle data found
  return [];
}
