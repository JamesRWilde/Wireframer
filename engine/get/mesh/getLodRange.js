/**
 * getLodRange - Get Lod Range
 *
 * PURPOSE:
 *   Returns lod range object with min and max bounds.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/mesh/getLodRange.js
 */

import { lodRangeState } from '@engine/state/mesh/lodRangeState.js';


/**
 * Returns lod range object with min and max bounds.
 * @returns {*} The current value from state.
 */
export function getLodRange() {
  return lodRangeState.value;
}
