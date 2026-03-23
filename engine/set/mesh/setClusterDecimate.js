/**
 * setClusterDecimate.js - Decimate a model by clustering vertices into cells
 *
 * One function per file module.
 */

"use strict";

import { assignVerticesToCells } from '@engine/init/mesh/assignVerticesToCells.js';
import { clusterVertices } from '@engine/init/mesh/clusterVertices.js';
import { rebuildFaces } from '@engine/init/mesh/rebuildFaces.js';
import { getMeshEdgesFromFacesRuntime } from '@engine/get/mesh/getMeshEdgesFromFacesRuntime.js';

/**
 * setClusterDecimate - Decimates a model by clustering vertices into a spatial grid
 *
 * @param {Object} model - The model with V, F, E arrays
 * @param {number} minX - Bounding box minimum X
 * @param {number} minY - Bounding box minimum Y
 * @param {number} minZ - Bounding box minimum Z
 * @param {number} extent - Bounding box extent (max dimension)
 * @param {number} cellSize - Grid cell size for clustering
 * @returns {Object|null} Decimated model or null if no reduction possible
 */
export function setClusterDecimate(model, minX, minY, minZ, extent, cellSize) {
  const cellMap = assignVerticesToCells(model.V, minX, minY, minZ, cellSize);
  const { newVerts, oldToNew } = clusterVertices(model.V, cellMap);
  if (!newVerts?.length) return null;

  const newFaces = model.F?.length ? rebuildFaces(model.F, oldToNew) : [];
  const edgeBuilder = getMeshEdgesFromFacesRuntime();
  const newEdges = edgeBuilder ? edgeBuilder(newFaces) : [];

  return {
    ...model,
    V: newVerts,
    F: newFaces,
    E: newEdges,
    _meshFormat: model._meshFormat,
    _shadingMode: model._shadingMode,
    _creaseAngleDeg: model._creaseAngleDeg,
    _oldToNew: Array.from({ length: model.V.length }, (_, i) => oldToNew.get(i) ?? 0),
  };
}
