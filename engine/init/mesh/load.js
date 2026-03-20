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
import { edgesFromFacesRuntime } from '@engine/init/mesh/build/edgesFromFacesRuntime.js';
import { getMeshEdgesFromFacesRuntime } from '@engine/get/mesh/getEdgesFromFacesRuntime.js';
import { setMeshEdgesFromFacesRuntime } from '@engine/set/mesh/setEdgesFromFacesRuntime.js';
import { clone as cloneMesh } from '@engine/init/mesh/clone.js';
import { getMeshClone } from '@engine/get/mesh/getClone.js';
import { setMeshClone as configureMeshClone } from '@engine/set/mesh/setClone.js';
import { getZoom } from '@engine/state/render/zoomState.js';
import { modelState, setActiveModel } from '@engine/state/render/model.js';
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
 * computeBoundingBox - Computes axis-aligned bounding box for vertices
 *
 * @param {Array<Array<number>>} V - Vertex array where each vertex is [x, y, z]
 * @returns {{min: Array<number>, max: Array<number>}} Bounding box min and max corners
 */
function computeBoundingBox(V) {
  let bx = Infinity, by = Infinity, bz = Infinity;
  let Bx = -Infinity, By = -Infinity, Bz = -Infinity;
  for (const v of V) {
    if (v[0] < bx) bx = v[0];
    if (v[0] > Bx) Bx = v[0];
    if (v[1] < by) by = v[1];
    if (v[1] > By) By = v[1];
    if (v[2] < bz) bz = v[2];
    if (v[2] > Bz) Bz = v[2];
  }
  return { min: [bx, by, bz], max: [Bx, By, Bz] };
}

/**
 * computeSphereCenter - Computes sphere center from bounding box
 *
 * @param {Array<number>} bboxMin - Minimum corner of bounding box
 * @param {Array<number>} bboxMax - Maximum corner of bounding box
 * @returns {Array<number>} Sphere center coordinates [cx, cy, cz]
 */
function computeSphereCenter(bboxMin, bboxMax) {
  return [
    (bboxMin[0] + bboxMax[0]) * 0.5,
    (bboxMin[1] + bboxMax[1]) * 0.5,
    (bboxMin[2] + bboxMax[2]) * 0.5
  ];
}

/**
 * computeMaxRadius - Finds maximum distance from center to any vertex
 *
 * @param {Array<Array<number>>} V - Vertex array
 * @param {Array<number>} center - Sphere center [cx, cy, cz]
 * @returns {number} Maximum radius
 */
function computeMaxRadius(V, center) {
  let maxR = 0;
  const [cx, cy, cz] = center;
  for (const v of V) {
    const r = Math.hypot(v[0] - cx, v[1] - cy, v[2] - cz);
    if (r > maxR) maxR = r;
  }
  return maxR < 1e-10 ? 1 : maxR;
}

/**
 * transformToUnitSphere - Transforms vertices to unit sphere centered at origin
 *
 * @param {Array<Array<number>>} V - Vertex array
 * @param {Array<number>} center - Sphere center
 * @param {number} maxR - Sphere radius
 */
function transformToUnitSphere(V, center, maxR) {
  const [cx, cy, cz] = center;
  for (const v of V) {
    v[0] = (v[0] - cx) / maxR;
    v[1] = (v[1] - cy) / maxR;
    v[2] = (v[2] - cz) / maxR;
  }
}

/**
 * clampToUnitSphere - Clamps vertices to unit sphere surface if they exceed radius 1
 *
 * @param {Array<Array<number>>} V - Vertex array
 */
function clampToUnitSphere(V) {
  for (const v of V) {
    const r2 = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
    if (r2 > 1) {
      const r = Math.hypot(v[0], v[1], v[2]);
      v[0] /= r;
      v[1] /= r;
      v[2] /= r;
    }
  }
}

/**
 * normalizeToBoundingSphere - Normalizes vertices to a unit bounding sphere
 *
 * Transforms the vertex array so that:
 * - The bounding sphere is centered at the origin (0,0,0)
 * - The sphere radius is exactly 1
 * - All vertices are clamped to the sphere surface if they exceed radius 1
 *
 * @param {Array<Array<number>>} V - Vertex array where each vertex is [x, y, z]
 */
function normalizeToBoundingSphere(V) {
  if (V.length === 0) return;

  const bbox = computeBoundingBox(V);
  const center = computeSphereCenter(bbox.min, bbox.max);
  const maxR = computeMaxRadius(V, center);

  transformToUnitSphere(V, center, maxR);
  clampToUnitSphere(V);
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
