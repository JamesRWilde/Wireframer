/**
 * InitMeshEngineLoad.js - Mesh Loading and Processing Pipeline
 * 
 * PURPOSE:
 *   Orchestrates the complete mesh loading pipeline from raw mesh data to
 *   a ready-to-render model. This is the primary entry point for loading
 *   new 3D objects into the application.
 * 
 * ARCHITECTURE ROLE:
 *   Called by loader.js when loading OBJ files, and by other modules that
 *   need to process mesh data. Exposed globally as globalThis.InitMeshEngineLoad for
 *   flexible access without circular imports.
 * 
 * PIPELINE STEPS:
 *   1. Validate mesh data structure
 *   2. Build edges from faces (if not provided)
 *   3. Filter invalid edges (zero-length, duplicate)
 *   4. Set LOD range for the model
 *   5. Clone the mesh (for caching)
 *   6. Fit camera to model bounds
 *   7. Finalize model (activate, optionally morph)
 *   8. Set as active model
 */

"use strict";

// Import edge filtering to remove degenerate edges
import { filterValidEdges }from '@engine/get/mesh/filterValidEdges.js';

// Import mesh validation to ensure data integrity
import { validationResult }from '@engine/get/mesh/Validate/validationResult.js';

// Import LOD range setup for detail level control
import { lodRangeForModel }from '@engine/set/mesh/lodRangeForModel.js';

// Import camera fitting to frame the model properly
import { fitCameraToModel }from '@engine/init/mesh/fitCameraToModel.js';

// Import model finalization (activation, morph setup)
import { finalizeModel }from '@engine/init/mesh/finalizeModel.js';

// Import edge building utility
// Register globally so any consumer can invoke it without circular imports
import { edgesFromFacesRuntime }from '@engine/init/mesh/Build/edgesFromFacesRuntime.js';
if (!globalThis.InitMeshEngineBuildEdgesFromFacesRuntime) {
  globalThis.InitMeshEngineBuildEdgesFromFacesRuntime = InitMeshEngineBuildEdgesFromFacesRuntime;
}

/**
 * InitMeshEngineLoad - Loads and processes a mesh for rendering
 * 
 * @param {Object} mesh - Raw mesh data with V (vertices) and F (faces)
 * @param {string} [name='Shape'] - Display name for the mesh
 * @param {Object} [options={}] - Loading options
 * @param {boolean} [options.animateMorph=false] - Whether to animate transition
 * @param {number} [options.detailPercent=1] - LOD detail level (0-1)
 * @param {string} [options.meshFileName] - Source filename for error messages
 * @param {string} [options.meshType='OBJ'] - Mesh format type
 * 
 * @returns {Object} The processed model ready for rendering
 */
export function load(mesh, name = 'Shape', options = {}) {
  console.debug('[InitMeshEngineLoad] called', name, 'mesh', mesh?.V?.length, 'vertices');
  
  // Extract options with defaults
  const {
    animateMorph = false,
    detailPercent = 1,
    meshFileName,
    meshType = 'OBJ',
  } = options || {};

  // Step 1: Validate mesh structure
  GetMeshEngineValidate(mesh, name, meshFileName, meshType);

  // Step 2: Extract vertices and faces
  const V = mesh.V;
  const F = mesh.F;
  
  // Step 3: Build edges from faces (if edge builder is available)
  const E = globalThis.InitMeshEngineBuildEdgesFromFacesRuntime ? globalThis.InitMeshEngineBuildEdgesFromFacesRuntime(F) : [];

  // Step 4: Create the model object with filtered edges
  const newModel = {
    V,
    F,
    E: GetMeshEngineFilterValidEdges(E, V),  // Remove degenerate edges
    _meshFormat: 'obj-style',
    _shadingMode: 'auto',
    _creaseAngleDeg: undefined,
  };
  console.debug('[InitMeshEngineLoad] built model', name, 'V=', V.length, 'F=', F.length, 'E=', newModel.E.length);

  // Step 5: Set LOD range for detail level control
  SetMeshEngineLodRangeForModel(newModel);

  // Step 6: Clamp detail percent to valid range
  const clampedDetail = Math.max(0, Math.min(1, Number(detailPercent) || 1));

  // Step 7: Clone the mesh for caching (if cloner is available)
  const newModelCopy = globalThis.InitMeshEngineClone ? globalThis.InitMeshEngineClone(newModel) : newModel;

  // Step 8: Fit camera to model bounds
  InitMeshEngineFitCameraToModel(newModel);

  // Step 9: Finalize model (activate, optionally morph)
  InitMeshEngineFinalizeModel(newModelCopy, animateMorph, name, clampedDetail);

  // Step 10: Set as active model for rendering
  if (typeof globalThis.setActiveModel === 'function') {
    try {
      globalThis.setActiveModel(newModelCopy, name);
    } catch (err) {
      console.warn('[InitMeshEngineLoad] setActiveModel failed', err);
    }
  }

  return newModelCopy;
}

// Expose for engine modules
globalThis.InitMeshEngineLoad = InitMeshEngineLoad;
