/**
 * getLodRange.js - LOD Range Configuration
 * 
 * PURPOSE:
 *   Returns the current LOD (Level of Detail) range configuration.
 *   This defines the minimum and maximum vertex counts available
 *   for the detail slider.
 * 
 * ARCHITECTURE ROLE:
 *   Called by UI code to configure the LOD slider range, and by
 *   LOD algorithms to understand the available detail levels.
 * 
 * WHY SEPARATE:
 *   The LOD range is a configuration value that may be updated
 *   when new models are loaded. This accessor provides a clean
 *   interface without exposing the global directly.
 */

/**
 * LOD_RANGE - Global LOD range configuration
 * 
 * @property {number} min - Minimum vertex count (lowest detail)
 * @property {number} max - Maximum vertex count (highest detail)
 * 
 * Updated by setLodRangeForModel when a new model is loaded.
 */
const LOD_RANGE = { min: 0, max: 0 };

/**
 * getLodRange - Gets the current LOD range configuration
 * 
 * @returns {{ min: number, max: number }} The LOD range
 *   min: Minimum vertex count (lowest detail)
 *   max: Maximum vertex count (highest detail)
 */
export function getLodRange() {
  return LOD_RANGE;
}
