/**
 * InitMeshEngineGreedyClusterDecimator.js - Greedy Cluster-Based Mesh Decimation
 * 
 * PURPOSE:
 *   Implements a greedy cluster-based mesh decimation algorithm for LOD
 *   (Level of Detail). This algorithm groups nearby vertices into spatial
 *   clusters and merges them, reducing the mesh's vertex and face count
 *   while preserving its overall shape.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineDecimateByPercent to perform the actual mesh simplification.
 *   This is the core LOD algorithm that balances visual quality with
 *   performance.
 * 
 * ALGORITHM OVERVIEW:
 *   1. Check cache for previously computed LOD at this detail level
 *   2. Normalize faces to consistent format
 *   3. Compute bounding box and cluster parameters
 *   4. Assign vertices to spatial grid cells
 *   5. Cluster vertices within each cell (merge nearby vertices)
 *   6. Rebuild faces using new vertex indices
 *   7. Build edges for wireframe rendering
 *   8. Cache result for future use
 *   9. Return deep copy to prevent cache pollution
 */

"use strict";

// Import mesh deep copy utility
import { initMeshEngineDeepCopy } from './initMeshEngineDeepCopy.js';

// Import face normalization (ensures consistent face format)
import { initMeshEngineNormalizeFaces } from './initMeshEngineNormalizeFaces.js';

// Import bounding box computation
import { getMeshEngineComputeBoundingBox } from '../get/getMeshEngineComputeBoundingBox.js';

// Import cluster parameter calculation
import { initMeshEngineComputeClusterParams } from './initMeshEngineComputeClusterParams.js';

// Import vertex-to-cell assignment
import { initMeshEngineAssignVerticesToCells } from './initMeshEngineAssignVerticesToCells.js';

// Import vertex clustering (merging nearby vertices)
import { initMeshEngineClusterVertices } from './initMeshEngineClusterVertices.js';

// Import face rebuilding (updating face indices after clustering)
import { initMeshEngineRebuildFaces } from './initMeshEngineRebuildFaces.js';

// Import LOD cache pruning (removes old cache entries)
import { disposeMeshEnginePruneLodCache } from '../dispose/disposeMeshEnginePruneLodCache.js';

/**
 * InitMeshEngineGreedyClusterDecimator - Decimates a mesh using greedy cluster merging
 * 
 * @param {Object} model - The mesh model to decimate
 * @param {number} targetFaces - Target number of faces after decimation
 * 
 * @returns {Object} The decimated mesh model (deep copy)
 * 
 * The algorithm:
 * 1. Checks cache for existing LOD at this detail level
 * 2. Computes spatial grid parameters based on target face count
 * 3. Assigns vertices to grid cells
 * 4. Merges vertices within each cell
 * 5. Rebuilds faces with new vertex indices
 * 6. Caches result and returns deep copy
 */
export function initMeshEngineGreedyClusterDecimator(model, targetFaces) {
  // Create cache key from vertex count and target faces
  // This allows reusing LOD results for the same model at the same detail level
  const cacheKey = `${model.V.length}:${targetFaces}`;
  
  // Initialize LOD cache if it doesn't exist
  if (!model._lodCache) model._lodCache = new Map();
  
  // Check cache for existing LOD at this detail level
  if (model._lodCache.has(cacheKey)) {
    // Return deep copy to prevent cache pollution
    return InitMeshEngineDeepCopy(model._lodCache.get(cacheKey));
  }

  // Extract vertices and normalize faces
  const V = model.V;
  const F = InitMeshEngineNormalizeFaces(model.F);

  // Compute bounding box for spatial grid setup
  const { minX, minY, minZ, extent } = GetMeshEngineComputeBoundingBox(V);
  
  // Compute cluster parameters (cell size) based on target face count
  const { cellSize } = InitMeshEngineComputeClusterParams(targetFaces, extent);

  // Assign vertices to spatial grid cells
  // This groups nearby vertices for merging
  const cellMap = InitMeshEngineAssignVerticesToCells(V, minX, minY, minZ, cellSize);
  
  // Cluster vertices within each cell (merge nearby vertices)
  const { newVerts, oldToNew } = InitMeshEngineClusterVertices(V, cellMap);
  
  // Rebuild faces using new vertex indices
  const newFaces = InitMeshEngineRebuildFaces(F, oldToNew);

  // Build edges for wireframe rendering
  const newEdges = globalThis.InitMeshEngineBuildEdgesFromFacesRuntime?.(newFaces) ?? [];
  
  // Create decimated mesh object
  const decimated = {
    V: newVerts,
    F: newFaces,
    E: newEdges,
    _meshFormat: model._meshFormat,
    _shadingMode: model._shadingMode,
    _creaseAngleDeg: model._creaseAngleDeg,
  };

  // Cache the decimated mesh for future use
  model._lodCache.set(cacheKey, decimated);
  
  // Prune cache to prevent memory bloat (keep max 12 entries)
  DisposeMeshEnginePruneLodCache(model._lodCache, 12);

  // Return deep copy to prevent cache pollution
  return InitMeshEngineDeepCopy(decimated);
}
