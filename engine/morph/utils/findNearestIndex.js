/**
 * findNearestIndex.js - Nearest Neighbor Index Finder
 *
 * PURPOSE:
 *   Finds the index of the closest point in an array to a given target point.
 *   Optionally skips points marked as used via a mask array. Used in morphing
 *   and mesh correspondence algorithms for efficient nearest-neighbor search.
 *
 * ARCHITECTURE ROLE:
 *   Utility function for greedy matching and mapping tasks. Used by morph
 *   preparation and mesh mapping code to pair points between sets.
 *
 * HOW IT WORKS:
 *   1. Iterates through all points in the array
 *   2. Skips any point if mask is provided and mask[i] is true
 *   3. Computes squared Euclidean distance to the target point
 *   4. Tracks the index of the closest point found
 *   5. Returns the index of the nearest point (lowest distance)
 *
 * @param {Array<Array<number>>} arr - Array of points [x, y, z]
 *   The set of candidate points to search.
 * @param {Array<number>} pt - Target point [x, y, z]
 *   The point to which the nearest neighbor is sought.
 * @param {Array<boolean>} [mask] - Optional mask array for used points
 *   If provided, any arr[i] with mask[i] true is skipped (treated as unavailable).
 * @returns {number} Index of nearest point in arr to pt (ignoring masked points)
 *   Returns the index of the closest available point in arr to pt.
 */

"use strict";
export function findNearestIndex(arr, pt, mask) {
  let bestIdx = 0; // Index of closest point found so far
  let bestDist = Infinity; // Squared distance of closest point
  for (let i = 0; i < arr.length; i++) {
    // Skip this point if mask is provided and mask[i] is true (already used)
    if (mask?.[i]) continue;
    // Compute squared Euclidean distance (no sqrt for performance)
    const dx = arr[i][0] - pt[0];
    const dy = arr[i][1] - pt[1];
    const dz = arr[i][2] - pt[2];
    const d2 = dx * dx + dy * dy + dz * dz;
    // If this point is closer, update bestIdx and bestDist
    if (d2 < bestDist) {
      bestDist = d2;
      bestIdx = i;
    }
  }
  // Return the index of the closest available point
  return bestIdx;
}
