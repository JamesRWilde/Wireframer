/**
 * setLodRange.js - Set LOD Range Bounds
 *
 * PURPOSE:
 *   Stores the min/max LOD range object that defines the valid bounds
 *   for the detail level slider. The range is model-specific and is
 *   updated whenever a new model is loaded.
 *
 * ARCHITECTURE ROLE:
 *   Setter for lodRangeState.value. Called by setLodRangeForModel when
 *   a new model is loaded. Read by the LOD slider handler to clamp
 *   the valid range.
 *
 * WHY THIS EXISTS:
 *   Different models have different vertex counts. The LOD slider must
 *   be configured to the model's range so 100% means "all vertices
 *   for this model" not an arbitrary number.
 */

"use strict";

// Import the LOD range state container
// Holds the min/max range object for the detail level slider
import { lodRangeState } from '@engine/state/mesh/stateLodRangeState.js';

/**
 * setLodRange - Stores the LOD range bounds
 * @param {{ min: number, max: number }} range - The min/max vertex count range
 */
export function setLodRange(range) {
  lodRangeState.value = range;
}
