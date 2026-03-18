/**
 * load.js - Mesh Loading and Processing Pipeline
 *
 * PURPOSE:
 *   Orchestrates the complete mesh loading pipeline from raw mesh data to
 *   a ready-to-render model. Validates, normalises to bounding sphere space,
 *   and finalises the model for rendering.
 *
 * ARCHITECTURE ROLE:
 *   Primary entry point for loading new 3D objects. Called by loader.js
 *   for OBJ files and by other modules that need to process mesh data.
 *   Exposed globally as globalThis.load for flexible access.
 *
 * PIPELINE STEPS:
 *   1. Validate mesh data structure
 *   2. Build edges from faces (if not provided)
 *   3. Filter invalid edges (zero-length, duplicate)
 *   4. Normalise to bounding sphere space (centre at origin, radius 1)
 *   5. Set LOD range for the model
 *   6. Clone the mesh (for caching)
 *   7. Fit camera to model bounds (first load only)
 *   8. Finalize model (activate, optionally morph)
 *   9. Set as active model
 *
 * SPHERE LAW:
 *   Every mesh is normalised to a unit bounding sphere (radius 1, centre at
 *   origin). This means size = zoom (constant across all meshes), centre =
 *   origin (always centre of screen), and rotation pivots around sphere centre.
 */

"use strict";

import { filterValidEdges }from '@engine/get/mesh/filterValidEdges.js';
import { validationResult }from '@engine/get/mesh/validate/validationResult.js';
import { lodRangeForModel }from '@engine/set/mesh/lodRangeForModel.js';
import { fitCameraToModel }from '@engine/init/mesh/fitCameraToModel.js';
import { finalizeModel }from '@engine/init/mesh/finalizeModel.js';
import { edgesFromFacesRuntime }from '@engine/init/mesh/build/edgesFromFacesRuntime.js';
import { toRuntime } from '@engine/init/mesh/toRuntime.js';

// Register globally so any consumer can invoke it without circular imports
if (!globalThis.edgesFromFacesRuntime) {
  globalThis.edgesFromFacesRuntime = edgesFromFacesRuntime;
}

/**
 * load - Loads and processes a mesh for rendering.
 *
 * Runs the full pipeline: validation, edge extraction, bounding sphere
 * normalisation, LOD setup, camera fitting, finalisation, and activation.
 *
 * @param {Object} mesh - Raw mesh data with V (vertices) and F (faces)
 * @param {string} [name='Shape'] - Display name for the mesh
 * @param {Object} [options={}] - Loading options
 * @param {boolean} [options.animateMorph=false] - Whether to animate transition from current mesh
 * @param {number} [options.detailPercent=1] - LOD detail level (0-1, where 1 = full detail)
 * @param {string} [options.meshFileName] - Source filename for error messages
 * @param {string} [options.meshType='OBJ'] - Mesh format type
 * @returns {Object} The processed model ready for rendering
 */
export function load(mesh, name = 'Shape', options = {}) {
  
  // Extract options with defaults
  const {
    animateMorph = false,
    detailPercent = 1,
    meshFileName,
    meshType = 'OBJ',
  } = options || {};

  // Step 1: Validate mesh structure
  validationResult(mesh, name, meshFileName, meshType);

  // Step 2: Extract vertices and faces
  const V = mesh.V;
  const F = mesh.F;
  
  // Step 3: Use edges from mesh if already present (OBJ parser merges
  // explicit OBJ edges with face-derived edges), otherwise derive from faces.
  const E = mesh.E && mesh.E.length > 0
    ? mesh.E
    : (globalThis.edgesFromFacesRuntime ? globalThis.edgesFromFacesRuntime(F) : []);

  // Step 4: Normalise to bounding sphere space.
  // Centre at origin, scale to radius 1, then hard-clamp to sphere.
  const vLen = V.length;
  let bx = Infinity, by = Infinity, bz = Infinity;
  let Bx = -Infinity, By = -Infinity, Bz = -Infinity;
  for (let i = 0; i < vLen; i++) {
    const v = V[i];
    if (v[0] < bx) bx = v[0]; if (v[0] > Bx) Bx = v[0];
    if (v[1] < by) by = v[1]; if (v[1] > By) By = v[1];
    if (v[2] < bz) bz = v[2]; if (v[2] > Bz) Bz = v[2];
  }
  const sphereCX = (bx + Bx) * 0.5;
  const sphereCY = (by + By) * 0.5;
  const sphereCZ = (bz + Bz) * 0.5;
  let maxR = 0;
  for (let i = 0; i < vLen; i++) {
    const v = V[i];
    const dx = v[0] - sphereCX, dy = v[1] - sphereCY, dz = v[2] - sphereCZ;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (r > maxR) maxR = r;
  }
  if (maxR < 1e-10) maxR = 1;
  // Transform: centre at origin, scale to radius 1
  for (let i = 0; i < vLen; i++) {
    V[i][0] = (V[i][0] - sphereCX) / maxR;
    V[i][1] = (V[i][1] - sphereCY) / maxR;
    V[i][2] = (V[i][2] - sphereCZ) / maxR;
  }
  // Sphere clamp: hard guarantee no vertex exceeds radius 1
  for (let i = 0; i < vLen; i++) {
    const r2 = V[i][0]*V[i][0] + V[i][1]*V[i][1] + V[i][2]*V[i][2];
    if (r2 > 1) {
      const r = Math.sqrt(r2);
      V[i][0] /= r; V[i][1] /= r; V[i][2] /= r;
    }
  }

  // Step 5: Create the model object with filtered edges
  const newModel = {
    V,
    F,
    E: filterValidEdges(E, V),
    _meshFormat: 'obj-style',
    _shadingMode: 'auto',
    _creaseAngleDeg: undefined,
  };

  // Step 6: Set LOD range for detail level control
  lodRangeForModel(newModel);

  // Step 7: Clamp detail percent to valid range
  const clampedDetail = Math.max(0, Math.min(1, Number(detailPercent) || 1));

  // Step 8: Clone the mesh for caching
  const newModelCopy = globalThis.clone ? globalThis.clone(newModel) : newModel;

  // Step 9: Fit camera to model bounds (first load only, not morphs)
  // Zoom is constant for all meshes — only set it on first load
  if (!globalThis.MODEL) {
    fitCameraToModel(newModel);
  }
  const targetZoom = globalThis.ZOOM;

  // Step 10: Finalize model (activate, optionally morph)
  finalizeModel(newModelCopy, animateMorph, name, clampedDetail, targetZoom);

  // Step 11: Set as active model for rendering
  if (typeof globalThis.setActiveModel === 'function') {
    try {
      globalThis.setActiveModel(newModelCopy, name);
    } catch (err) {
      console.warn('[load] setActiveModel failed', err);
    }
  }

  return newModelCopy;
}

// Expose for engine modules
globalThis.load = load;
