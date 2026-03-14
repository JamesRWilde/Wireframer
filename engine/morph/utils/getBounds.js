/**
 * getBounds.js - Compute Bounding Box and Scale Factors
 *
 * PURPOSE:
 *   Computes the axis-aligned bounding box for a set of 3D vertices and
 *   returns the min/max coordinates and scale factors for each axis.
 *   Used for normalization and scale-invariant geometry processing.
 *
 * ARCHITECTURE ROLE:
 *   Utility for morphing, mesh mapping, and normalization. Provides
 *   bounding box data for mapping points to a unit cube or for spatial queries.
 *
 * HOW IT WORKS:
 *   1. Iterates through all vertices to find min/max for x, y, z
 *   2. Computes scale factors (max-min) for each axis
 *   3. Clamps scale factors to a minimum of 1e-6 to avoid division by zero
 *   4. Returns an object with minX, minY, minZ, sx, sy, sz
 *
 * @param {Array<Array<number>>} vertices - Vertex positions
 *   Array of 3D points [[x, y, z], ...] to compute bounds for.
 * @returns {Object} Bounding box and scale factors
 *   Object with properties:
 *     - minX, minY, minZ: minimum coordinates
 *     - sx, sy, sz: scale factors (max-min, clamped to 1e-6)
 *   Example: { minX, minY, minZ, sx, sy, sz }
 */

"use strict";
export function getBounds(vertices) {
  // Initialize min/max to extreme values
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  // Find min/max for each axis
  for (const [x, y, z] of vertices) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }
  // Compute scale factors, clamped to avoid division by zero
  return {
    minX, minY, minZ,
    sx: Math.max(1e-6, maxX - minX), // X scale (avoid zero)
    sy: Math.max(1e-6, maxY - minY), // Y scale
    sz: Math.max(1e-6, maxZ - minZ), // Z scale
  };
}
