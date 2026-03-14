/**
 * normalizePoint.js - Normalize 3D Point to Unit Cube
 *
 * PURPOSE:
 *   Converts a 3D point to normalized coordinates within a unit cube [0,1]^3
 *   based on the bounding box of a set of points. Used for scale-invariant
 *   comparison and matching of mesh vertices in morphing and geometry code.
 *
 * ARCHITECTURE ROLE:
 *   Utility for morphing and mesh mapping. Ensures that points from different
 *   meshes/scales can be compared meaningfully by mapping all coordinates to
 *   the [0,1] range along each axis.
 *
 * HOW IT WORKS:
 *   1. Subtracts the minimum bounding box coordinate from each axis
 *   2. Divides by the bounding box scale (max-min, clamped to avoid zero)
 *   3. Returns the normalized [x, y, z] in [0,1]^3
 *
 * @param {Array<number>} v - Point [x, y, z]
 *   The 3D point to normalize.
 * @param {Object} b - Bounding box (from getBounds)
 *   Bounding box object with minX, minY, minZ, sx, sy, sz properties.
 * @returns {Array<number>} Normalized point [0-1, 0-1, 0-1]
 *   The normalized coordinates of v within the bounding box b.
 */

"use strict";
export function normalizePoint(v, b) {
  // Subtract min and divide by scale for each axis to map to [0,1]
  return [
    (v[0] - b.minX) / b.sx,
    (v[1] - b.minY) / b.sy,
    (v[2] - b.minZ) / b.sz,
  ];
}
