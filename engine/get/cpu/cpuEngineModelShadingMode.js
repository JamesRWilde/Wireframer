/**
 * getModelShadingMode.js - Shading Mode Resolution
 * 
 * PURPOSE:
 *   Determines the shading mode (flat or smooth) for a model.
 *   Supports explicit mode setting or automatic selection based on complexity.
 * 
 * ARCHITECTURE ROLE:
 *   Called by fill renderer to determine shading approach.
 *   Used by getModelTriCornerNormals to decide normal computation strategy.
 * 
 * MODES:
 *   - 'flat': Each face has uniform color (faster, good for low-poly)
 *   - 'smooth': Interpolated normals for smooth appearance (better for high-poly)
 *   - 'auto': Automatically selects based on face count threshold (80)
 */

/**
 * getModelShadingMode - Gets shading mode for a model
 * 
 * @param {Object} model - Model object with optional _shadingMode property
 * @param {Array} triFaces - Array of triangle faces (used for auto mode)
 * 
 * @returns {string} Shading mode: 'flat' or 'smooth'
 * 
 * The function:
 * 1. Returns explicit mode if set to 'flat' or 'smooth'
 * 2. In auto mode, uses 'smooth' for models with >80 faces
 * 3. Otherwise uses 'flat' for simpler models
 */
export function cpuEngineModelShadingMode(model, triFaces) {
  // Get explicit mode or default to 'auto'
  // Use optional chaining for conciseness per SonarQube S6582
  const mode = model?.__shadingMode || 'auto';
  
  // Return explicit mode if set
  if (mode === 'flat' || mode === 'smooth') return mode;
  
  // Auto mode: use smooth for complex models (>80 faces), flat for simple ones
  return triFaces.length > 80 ? 'smooth' : 'flat';
}
