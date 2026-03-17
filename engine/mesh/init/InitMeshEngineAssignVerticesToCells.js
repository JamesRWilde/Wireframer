/**
 * InitMeshEngineAssignVerticesToCells.js - Spatial Grid Vertex Assignment
 * 
 * PURPOSE:
 *   Assigns mesh vertices to a 3D spatial grid for clustering. This is the
 *   first step in the greedy cluster decimation algorithm, grouping nearby
 *   vertices together for potential merging.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineGreedyClusterDecimator to partition vertices into spatial cells.
 *   The cell size is computed based on the target face count to achieve the
 *   desired level of decimation.
 * 
 * HOW IT WORKS:
 *   1. Creates a 3D grid covering the mesh's bounding box
 *   2. Assigns each vertex to a cell based on its position
 *   3. Returns a map from cell keys to lists of vertex indices
 * 
 * WHY SPATIAL GRID:
 *   A spatial grid provides O(1) vertex lookup by location and naturally
 *   groups nearby vertices. This is much faster than comparing all pairs
 *   of vertices (O(n²)).
 */

"use strict";

/**
 * InitMeshEngineAssignVerticesToCells - Assigns vertices to a 3D spatial grid
 * 
 * @param {Array<Array<number>>} V - Vertex positions array [[x,y,z], ...]
 * @param {number} minX - Minimum X coordinate (bounding box)
 * @param {number} minY - Minimum Y coordinate (bounding box)
 * @param {number} minZ - Minimum Z coordinate (bounding box)
 * @param {number} cellSize - Size of each grid cell
 * 
 * @returns {Map<string, Array<number>>} Map from cell keys to vertex indices
 *   Cell keys are strings like "gx,gy,gz" where gx/gy/gz are grid coordinates
 */
export function InitMeshEngineAssignVerticesToCells(V, minX, minY, minZ, cellSize) {
  // Create map to store cell assignments
  const cellMap = new Map();

  /**
   * cellKey - Computes the grid cell key for a vertex position
   * 
   * @param {number} x - Vertex X coordinate
   * @param {number} y - Vertex Y coordinate
   * @param {number} z - Vertex Z coordinate
   * @returns {string} Cell key in format "gx,gy,gz"
   */
  const cellKey = (x, y, z) => {
    // Compute grid coordinates by dividing offset from min by cell size
    const gx = Math.floor((x - minX) / cellSize);
    const gy = Math.floor((y - minY) / cellSize);
    const gz = Math.floor((z - minZ) / cellSize);
    return `${gx},${gy},${gz}`;
  };

  // Assign each vertex to its grid cell
  for (let i = 0; i < V.length; i++) {
    const [x, y, z] = V[i];
    const key = cellKey(x, y, z);
    
    // Create cell list if it doesn't exist
    if (!cellMap.has(key)) cellMap.set(key, []);
    
    // Add vertex index to cell
    cellMap.get(key).push(i);
  }

  return cellMap;
}
