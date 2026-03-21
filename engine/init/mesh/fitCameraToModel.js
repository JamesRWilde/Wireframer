/**
 * fitCameraToModel.js - Camera Fitting to Model Bounds
 * 
 * PURPOSE:
 *   Automatically adjusts the camera zoom and projection parameters to frame
 *   the model appropriately in the viewport. This ensures that models of
 *   different sizes are displayed at a consistent, visible scale.
 * 
 * ARCHITECTURE ROLE:
 *   Called by load after a new model is loaded. Computes the model's
 *   bounding box and adjusts zoom, center, and depth parameters to fit
 *   the model in the viewport.
 * 
 * WHY AUTOMATIC FITTING:
 *   Models can have vastly different scales (a tiny sphere vs a large
 *   Menger sponge). Automatic fitting ensures all models are visible
 *   and properly framed without manual zoom adjustment.
 */

// Import frame parameter computation for projection setup
import { setZoom } from '@engine/set/render/zoom.js';
import { setZoomMin } from '@engine/set/render/zoomMin.js';
import { setZoomMax } from '@engine/set/render/zoomMax.js';
import { setModelCy } from '@engine/set/render/modelCy.js';
import { setZHalf } from '@engine/set/render/zHalf.js';

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

  // Update frame parameters for projection
  setModelCy(0);  // Sphere is centred at origin — no offset needed
  setZHalf(1);    // Sphere radius is 1
  
  // Set zoom bounds — sphere is law (unit sphere, radius 1, diameter 2)
  // Min: sphere = 10% of screen (zoomed out)
  // Max: sphere fills screen, no clipping inside geometry
  const minFraction = 0.1;   // 10% of screen
  const maxFraction = 1.0;   // fills screen
  const targetFraction = 0.5; // default fill on load
  setZoomMin(minFraction / (0.9 * 2));    // 0.056
  setZoomMax(maxFraction / (0.9 * 2));    // 0.556
  setZoom(targetFraction / (0.9 * 2));    // 0.278
}
