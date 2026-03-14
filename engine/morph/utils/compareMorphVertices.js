/**
 * compareMorphVertices.js - Vertex Comparison for Morph Ordering
 * 
 * PURPOSE:
 *   Compares two 3D vertices for sorting during morph preparation. This
 *   comparison function creates a consistent ordering of vertices that
 *   helps produce smoother morph transitions between different mesh
 *   topologies.
 * 
 * ARCHITECTURE ROLE:
 *   Used by sortVerticesForMorph to order vertices before morphing.
 *   The ordering ensures that corresponding vertices in source and
 *   target meshes are matched as closely as possible.
 * 
 * COMPARISON STRATEGY:
 *   1. Primary: Y coordinate (vertical position)
 *   2. Secondary: Angle in XZ plane (horizontal direction)
 *   3. Tertiary: Distance from Y axis in XZ plane
 *   
 *   This creates a spiral-like ordering that works well for most
 *   rotationally symmetric shapes.
 */

"use strict";

/**
 * compareMorphVertices - Compares two vertices for morph ordering
 * 
 * @param {Array<number>} a - First vertex [x, y, z]
 * @param {Array<number>} b - Second vertex [x, y, z]
 * 
 * @returns {number} Negative if a < b, positive if a > b, zero if equal
 * 
 * The comparison uses a multi-level strategy:
 * 1. Y coordinate (with tolerance for near-equal values)
 * 2. Angle in XZ plane (atan2)
 * 3. Squared distance from Y axis
 */
export function compareMorphVertices(a, b) {
  // Primary: Compare Y coordinates
  // Use tolerance to avoid floating-point jitter
  if (Math.abs(a[1] - b[1]) > 0.03) return a[1] - b[1];
  
  // Secondary: Compare angle in XZ plane
  // This creates a radial ordering around the Y axis
  const aa = Math.atan2(a[2], a[0]);
  const ab = Math.atan2(b[2], b[0]);
  if (aa !== ab) return aa - ab;
  
  // Tertiary: Compare distance from Y axis (squared for efficiency)
  // This orders vertices by radius within the same angle
  const ra = a[0] * a[0] + a[2] * a[2];
  const rb = b[0] * b[0] + b[2] * b[2];
  return ra - rb;
}
