/**
 * getLodRange - Get Lod Range
 *
 * PURPOSE:
 *   Returns lod range object with min and max bounds.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/mesh/getLodRange.js
 *
 * WHY THIS EXISTS:
 *   Provides a single access point for level-of-detail thresholds used by
 *   mesh LOD selection logic.
 */

"use strict";

// Import LOD range state that tunes mesh detail switching.
import { lodRangeState } from '@engine/state/mesh/stateLodRangeState.js';


/**
 * Returns lod range object with min and max bounds.
 * @returns {*} The current value from state.
 */
export function getLodRange() {
  return lodRangeState.value;
}
