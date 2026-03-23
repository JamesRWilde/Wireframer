/**
 * setDecimateByCluster.js - Cluster-Based Model Decimation
 *
 * PURPOSE:
 *   Decimates a 3D model by clustering nearby vertices into spatial grid cells,
 *   then rebuilding faces from the cluster centroids. This reduces vertex count
 *   while preserving the overall mesh shape.
 *
 * ARCHITECTURE ROLE:
 *   Called by setDecimateToCap to perform the actual decimation at a given
 *   cell size. The binary search in setDecimateToCap iterates over cell sizes
 *   to find the optimal decimation under vertex/edge caps.
 *
 * WHY THIS EXISTS:
 *   Cell-cluster decimation is simpler and faster than quadric error metric
 *   decimation. It preserves mesh topology better than simple percentage
 *   reduction because vertices are grouped by spatial proximity.
 */

"use strict";

// Import vertex-to-cell assignment — maps each vertex to a spatial grid cell
import { initAssignVerticesToCells } from '@engine/init/mesh/initAssignVerticesToCells.js';
// Import vertex clustering — merges vertices sharing the same cell
import { clusterVertices } from '@engine/init/mesh/initClusterVertices.js';
// Import face rebuild — reconstructs face indices from the new vertex set
import { rebuildFaces } from '@engine/init/mesh/initRebuildFaces.js';
// Import edge builder — runtime edge computation from faces
import { getMeshEdgesFromFacesRuntime } from '@engine/get/mesh/getMeshEdgesFromFacesRuntime.js';

/**
 * setDecimateByCluster - Decimates a model by clustering vertices into a spatial grid
 * @param {Object} model - The model with V, F, E arrays
 * @param {number} minX - Bounding box minimum X
 * @param {number} minY - Bounding box minimum Y
 * @param {number} minZ - Bounding box minimum Z
 * @param {number} extent - Bounding box extent (max dimension)
 * @param {number} cellSize - Grid cell size for clustering
 * @returns {Object|null} Decimated model or null if no reduction possible
 */
export function setDecimateByCluster(model, minX, minY, minZ, extent, cellSize) {
  // Assign each vertex to a spatial grid cell
  const cellMap = initAssignVerticesToCells(model.V, minX, minY, minZ, cellSize);
  // Merge vertices within each cell, producing a remapping table
  const { newVerts, oldToNew } = clusterVertices(model.V, cellMap);
  if (!newVerts?.length) return null;

  // Rebuild faces using the new vertex indices (degenerate faces are dropped)
  const newFaces = model.F?.length ? rebuildFaces(model.F, oldToNew) : [];
  // Compute edges from the new faces
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
