/**
 * computeFitZoom.js - Auto-fit Zoom Calculation
 * 
 * PURPOSE:
 *   Calculates the optimal zoom level to fit the model within the viewport.
 *   Uses model depth (zHalf) to determine appropriate scaling.
 * 
 * ARCHITECTURE ROLE:
 *   Called when model changes or window resizes to auto-fit the view.
 *   Returns zoom value clamped to valid range [ZOOM_MIN, ZOOM_MAX].
 * 
 * MATHEMATICAL BASIS:
 *   The projection formula is: screenPos = (worldPos * ZOOM * minDim * 0.9) / (z + 3)
 *   To fit model: (minDim * 0.9 * ZOOM) * zHalf / (zHalf + 3) = minDim * 0.45
 *   Solving: ZOOM = 0.5 * (zHalf + 3) / zHalf
 */

/**
 * computeFitZoom - Calculates zoom to fit model in viewport
 * 
 * @param {Object} params - Frame parameters from computeFrameParams
 * @param {number} params.zHalf - Half-depth of model bounding sphere
 * 
 * @returns {number} Zoom level clamped to [ZOOM_MIN, ZOOM_MAX]
 * 
 * The function:
 * 1. Validates params and checks for browser environment
 * 2. Returns default zoom (1.0) if params invalid
 * 3. Calculates fit zoom using derived formula
 * 4. Clamps result to valid zoom range
 */
export function computeFitZoom(params) {
  // Validate params and check for browser environment
  if (!params || !params.zHalf || params.zHalf <= 0 || typeof window === 'undefined') {
    return 1.0;
  }
  
  // Get minimum viewport dimension
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  
  // Calculate fit zoom using derived formula:
  // ZOOM = 0.5 * (zHalf + 3) / zHalf
  // This ensures model fills ~45% of viewport height
  const fitZoom = 0.5 * (params.zHalf + 3) / params.zHalf;
  
  // Clamp to valid zoom range
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitZoom));
}
