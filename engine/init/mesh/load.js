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
 *   Registers the loader function in module state via setInitMeshEngineLoad.
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
import { normalizeToBoundingSphere } from '@engine/init/mesh/normalizeToBoundingSphere.js';

import { edgesFromFacesRuntime } from '@engine/init/mesh/build/edgesFromFacesRuntime.js';
import { getMeshEdgesFromFacesRuntime } from '@engine/get/mesh/getEdgesFromFacesRuntime.js';
import { setMeshEdgesFromFacesRuntime } from '@engine/set/mesh/setEdgesFromFacesRuntime.js';
import { clone as cloneMesh } from '@engine/init/mesh/clone.js';
import { getMeshClone } from '@engine/get/mesh/getMeshClone.js';
import { setMeshClone as configureMeshClone } from '@engine/set/mesh/setClone.js';
import { getZoom } from '@engine/get/render/getZoom.js';
import { modelState } from '@engine/state/render/model.js';
import { setActiveModel } from '@engine/set/render/physics/model.js';
import { setInitMeshEngineLoad } from '@engine/set/mesh/setInitMeshEngineLoad.js';

// Register through module state so callers can retrieve the shared builder.
if (!getMeshEdgesFromFacesRuntime()) {
  setMeshEdgesFromFacesRuntime(edgesFromFacesRuntime);
}

// Register clone API in state for safe module-based access (no global object)
if (!getMeshClone()) {
  configureMeshClone(cloneMesh);
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
  const edgeBuilder = getMeshEdgesFromFacesRuntime();
  const E = (function() {
    if (mesh.E && mesh.E.length > 0) {
      return mesh.E;
    }
    return edgeBuilder ? edgeBuilder(F) : [];
  })();

  // Step 4: Normalise to bounding sphere space.
  // Centre at origin, scale to radius 1, then hard-clamp to sphere.
  normalizeToBoundingSphere(V);

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
  const meshCloneFn = getMeshClone();
  const newModelCopy = meshCloneFn ? meshCloneFn(newModel) : newModel;

  // Step 9: Fit camera to model bounds (first load only, not morphs)
  // Zoom is constant for all meshes — only set it on first load
  if (!modelState.model) {
    fitCameraToModel(newModel);
  }
  const targetZoom = getZoom();

  // Step 10: Finalize model (activate, optionally morph)
  finalizeModel(newModelCopy, animateMorph, name, clampedDetail, targetZoom);

  // Step 11: Set as active model for rendering
  try {
    setActiveModel(newModelCopy, name);
  } catch (err) {
    console.warn('[load] setActiveModel failed', err);
  }
  
  return newModelCopy;
}

// Register for modular engine access (replaces legacy load global function)
setInitMeshEngineLoad(load);
