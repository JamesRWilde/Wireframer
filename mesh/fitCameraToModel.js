/**
 * fitCameraToModel.js - Camera Fitting to Model Bounds
 * 
 * PURPOSE:
 *   Automatically adjusts the camera zoom and projection parameters to frame
 *   the model appropriately in the viewport. This ensures that models of
 *   different sizes are displayed at a consistent, visible scale.
 * 
 * ARCHITECTURE ROLE:
 *   Called by loadMesh after a new model is loaded. Computes the model's
 *   bounding box and adjusts zoom, center, and depth parameters to fit
 *   the model in the viewport.
 * 
 * WHY AUTOMATIC FITTING:
 *   Models can have vastly different scales (a tiny sphere vs a large
 *   Menger sponge). Automatic fitting ensures all models are visible
 *   and properly framed without manual zoom adjustment.
 */

// Import frame parameter computation for projection setup
import { computeFrameParams } from '../engine/render/computeFrameParams.js';

/**
 * fitCameraToModel - Adjusts camera to frame the model
 * 
 * @param {Object} model - The mesh model with V (vertices) array
 * 
 * This function:
 * 1. Computes the model's bounding box in X and Y
 * 2. Calculates the maximum extent (largest dimension)
 * 3. Updates projection parameters (MODEL_CY, Z_HALF)
 * 4. Sets zoom bounds and calculates optimal zoom level
 * 
 * The zoom calculation uses the projection formula:
 *   screenPos = dim/2 + coord * (minDim * 0.9 * ZOOM) / (z + 3)
 * 
 * We solve for ZOOM to make the model fill a target fraction of the screen.
 */
export function fitCameraToModel(model) {
  // Guard: return if model has no vertices
  if (!model?.V?.length) return;

  // Compute bounding box by iterating all vertices
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const v of model.V) {
    if (v[0] < minX) minX = v[0];
    if (v[0] > maxX) maxX = v[0];
    if (v[1] < minY) minY = v[1];
    if (v[1] > maxY) maxY = v[1];
  }

  // Calculate model dimensions
  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const maxExtent = Math.max(sizeX, sizeY);

  // Update frame parameters for projection
  // These control the vertical center and depth range
  const params = computeFrameParams(model.V);
  if (typeof params.cy === 'number') globalThis.MODEL_CY = params.cy;
  if (typeof params.zHalf === 'number') globalThis.Z_HALF = params.zHalf;

  // Set expanded zoom bounds to allow wide range of zoom levels
  globalThis.ZOOM_MIN = 0.1;
  globalThis.ZOOM_MAX = 10;

  // Calculate optimal zoom to fit model in viewport
  if (maxExtent > 0) {
    // Projection formula: screenPos = dim/2 + coord * (minDim * 0.9 * ZOOM) / (z + 3)
    // For object at z=0 (center), distance factor d = 3
    // To fit maxExtent to targetScreenFraction of minDim:
    //   maxExtent * (minDim * 0.9 * ZOOM) / 3 = minDim * targetFraction
    //   ZOOM = 3 * targetFraction / (0.9 * maxExtent)
    
    const targetFraction = 0.5;  // Model should fill 50% of viewport
    const fitZoom = (3 * targetFraction) / (0.9 * maxExtent);
    
    // Clamp zoom to valid range
    globalThis.ZOOM = Math.max(globalThis.ZOOM_MIN, Math.min(globalThis.ZOOM_MAX, fitZoom));
  }
}
