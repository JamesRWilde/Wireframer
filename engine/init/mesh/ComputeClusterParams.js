/**
 * InitMeshEngineComputeClusterParams.js - Cluster Parameter Calculation
 * 
 * PURPOSE:
 *   Computes the spatial grid parameters for the cluster-based decimation
 *   algorithm. Determines how many clusters (grid cells) to use and the
 *   size of each cell based on the target face count and mesh extent.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineGreedyClusterDecimator to set up the spatial grid for vertex
 *   clustering. The cluster count directly affects the decimation ratio.
 * 
 * HOW IT WORKS:
 *   1. Compute cluster count from target face count using cube root
 *   2. Divide mesh extent by cluster count to get cell size
 *   3. Return both values for grid setup
 * 
 * WHY CUBE ROOT:
 *   The mesh is 3D, so the number of clusters scales with the cube root
 *   of the target face count. This ensures the grid density is appropriate
 *   for the desired level of detail.
 */

"use strict";

/**
 * InitMeshEngineComputeClusterParams - Computes spatial grid parameters for clustering
 * 
 * @param {number} targetFaces - Target number of faces after decimation
 * @param {number} extent - Mesh bounding box extent (largest dimension)
 * 
 * @returns {{ clusterCount: number, cellSize: number }}
 *   clusterCount: Number of clusters along each axis
 *   cellSize: Size of each grid cell in world units
 */
export function meshEngineComputeClusterParams(targetFaces, extent) {
  // Compute cluster count from target face count
  // Cube root because we're in 3D space
  // Multiply by 2 to get more clusters than faces (finer granularity)
  // Minimum of 2 to ensure at least some clustering
  const clusterCount = Math.max(2, Math.cbrt(targetFaces * 2));
  
  // Compute cell size by dividing extent by cluster count
  // This ensures the grid covers the entire mesh
  const cellSize = extent / clusterCount;
  
  return { clusterCount, cellSize };
}
