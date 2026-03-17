/**
 * GetMeshEngineComputeBoundingBox.js - 3D Bounding Box Computation
 * 
 * PURPOSE:
 *   Computes the axis-aligned bounding box (AABB) of a set of 3D vertices.
 *   The bounding box defines the minimum and maximum coordinates along each
 *   axis, and the overall extent (largest dimension).
 * 
 * ARCHITECTURE ROLE:
 *   Used by LOD algorithms to determine the spatial extent of the mesh,
 *   which is needed to compute appropriate cluster cell sizes.
 * 
 * WHY BOUNDING BOX:
 *   The bounding box provides a quick approximation of the mesh's size
 *   and position in 3D space. It's used to:
 *   - Set up spatial grids for clustering
 *   - Fit the camera to the model
 *   - Compute normalization scales
 */

"use strict";

/**
 * GetMeshEngineComputeBoundingBox - Computes axis-aligned bounding box of vertices
 * 
 * @param {Array<Array<number>>} V - Vertex positions array [[x,y,z], ...]
 * 
 * @returns {Object} Bounding box parameters
 *   @returns {number} minX - Minimum X coordinate
 *   @returns {number} maxX - Maximum X coordinate
 *   @returns {number} minY - Minimum Y coordinate
 *   @returns {number} maxY - Maximum Y coordinate
 *   @returns {number} minZ - Minimum Z coordinate
 *   @returns {number} maxZ - Maximum Z coordinate
 *   @returns {number} extent - Largest dimension (max of width/height/depth)
 *     Defaults to 1 if all dimensions are zero (degenerate case)
 */
export function meshEngineComputeBoundingBox(V) {
  // Initialize min/max to opposite extremes
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  // Find min/max along each axis
  for (const [x, y, z] of V) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  // Compute extent (largest dimension)
  // Default to 1 if all dimensions are zero (degenerate case)
  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  
  return { minX, maxX, minY, maxY, minZ, maxZ, extent };
}
