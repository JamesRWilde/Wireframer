/**
 * zeroQuadric.js - Zero Quadric Constructor
 * 
 * PURPOSE:
 *   Creates a zero-initialized quadric error metric. This represents
 *   "no error" and is used as the starting point when accumulating
 *   quadrics from multiple faces.
 * 
 * ARCHITECTURE ROLE:
 *   Used by LOD algorithms to initialize vertex quadrics before
 *   summing the quadrics of adjacent faces.
 * 
 * WHY ZERO INITIALIZATION:
 *   Quadrics are accumulated by addition. Starting with a zero quadric
 *   ensures that the final result is just the sum of face quadrics,
 *   without any unwanted initial bias.
 */

"use strict";

/**
 * zeroQuadric - Creates a zero quadric error metric
 * 
 * @returns {Array<number>} Zero quadric as 10-element array
 *   All components are 0, representing "no error"
 */
export function zeroQuadric() {
  return [0,0,0,0,0,0,0,0,0,0];
}
