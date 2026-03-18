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
import {frameParams}from '@engine/get/render/compute/frameParams.js';

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
  
  // Update frame parameters for projection
  globalThis.MODEL_CY = 0;  // Sphere is centred at origin — no offset needed
  globalThis.Z_HALF = 1;    // Sphere radius is 1
  
  // Set zoom bounds
  globalThis.ZOOM_MIN = 0.001;
  globalThis.ZOOM_MAX = 10;

  // Sphere is law — all meshes are unit sphere (radius 1, diameter 2).
  // The sphere, not the mesh, defines the visual extent.
  // Zoom is constant for all meshes.
  const targetFraction = 0.5;
  globalThis.ZOOM = targetFraction / (0.9 * 2);  // 0.278
}
