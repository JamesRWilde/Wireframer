/**
 * load.js - Mesh Loading and Processing Pipeline
 * 
 * PURPOSE:
 *   Orchestrates the complete mesh loading pipeline from raw mesh data to
 *   a ready-to-render model. This is the primary entry point for loading
 *   new 3D objects into the application.
 * 
 * ARCHITECTURE ROLE:
 *   Called by loader.js when loading OBJ files, and by other modules that
 *   need to process mesh data. Exposed globally as globalThis.load for
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
import { validationResult }from '@engine/get/mesh/validate/validationResult.js';

// Import LOD range setup for detail level control
import { lodRangeForModel }from '@engine/set/mesh/lodRangeForModel.js';

// Import camera fitting to frame the model properly
import { fitCameraToModel }from '@engine/init/mesh/fitCameraToModel.js';

// Import model finalization (activation, morph setup)
import { finalizeModel }from '@engine/init/mesh/finalizeModel.js';

// Import edge building utility
// Register globally so any consumer can invoke it without circular imports
import { edgesFromFacesRuntime }from '@engine/init/mesh/build/edgesFromFacesRuntime.js';
if (!globalThis.edgesFromFacesRuntime) {
  globalThis.edgesFromFacesRuntime = edgesFromFacesRuntime;
}

/**
 * load - Loads and processes a mesh for rendering
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
  // This preserves author-defined edges from "e" and "l" directives.
  const E = mesh.E && mesh.E.length > 0
    ? mesh.E
    : (globalThis.edgesFromFacesRuntime ? globalThis.edgesFromFacesRuntime(F) : []);

  // Step 4b: Normalize to bounding sphere space.
  // The bounding sphere IS the shape — mesh lives inside it.
  // All meshes become radius-1 sphere at origin, so:
  //   - Size = zoom (constant across all meshes)
  //   - Centre = sphere centre = origin (always centre of screen)
  //   - Rotation pivots around sphere centre (always spins in place)
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
  // Max radius from sphere centre to any vertex
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

  // Step 4b.5: No Z-shift needed. Orthographic projection has no
  // perspective distortion and no behind-camera issues.
  // The OBJ shape is preserved exactly as-is.

  // Step 4c: Create the model object with filtered edges
  const newModel = {
    V,
    F,
    E: filterValidEdges(E, V),  // Remove degenerate edges
    _meshFormat: 'obj-style',
    _shadingMode: 'auto',
    _creaseAngleDeg: undefined,
  };

  // Step 5: Set LOD range for detail level control
  lodRangeForModel(newModel);

  // Step 6: Clamp detail percent to valid range
  const clampedDetail = Math.max(0, Math.min(1, Number(detailPercent) || 1));

  // Step 7: Clone the mesh for caching (if cloner is available)
  const newModelCopy = globalThis.clone ? globalThis.clone(newModel) : newModel;

  // Step 8: Fit camera to model bounds (only on first load, not morphs)
  // Sphere is law — zoom is constant for all meshes. Only set it on first
  // load; during morphs, zoom stays whatever the user set it to.
  if (!globalThis.MODEL) {
    fitCameraToModel(newModel);
  }
  const targetZoom = globalThis.ZOOM;

  // Step 9: Finalize model (activate, optionally morph)
  finalizeModel(newModelCopy, animateMorph, name, clampedDetail, targetZoom);

  // Step 10: Set as active model for rendering
  if (typeof globalThis.setActiveModel === 'function') {
    try {
      globalThis.setActiveModel(newModelCopy, name);
    } catch (err) {
      console.warn('[load] setActiveModel failed', err);
    }
  }

  return newModelCopy;
}

// Import toRuntime for OBJ text parsing (used by loadObjMesh)
import { toRuntime } from '@engine/init/mesh/toRuntime.js';

/**
 * loadObjMesh - Fetches an OBJ file and loads it through the pipeline
 *
 * @param {string} objPath - Path to the OBJ file
 * @param {string} [name='Shape'] - Display name for the mesh
 * @returns {Promise<Object>} The processed model ready for rendering
 */
export async function loadObjMesh(objPath, name = 'Shape') {
  const resp = await fetch(objPath);
  if (!resp.ok) throw new Error('Failed to fetch OBJ: ' + objPath);
  const objText = await resp.text();
  const mesh = toRuntime(objText, { meshFileName: objPath, meshType: 'OBJ' });
  return load(mesh, name, { animateMorph: true });
}

// Expose for engine modules
globalThis.load = load;
globalThis.loadObjMesh = loadObjMesh;
