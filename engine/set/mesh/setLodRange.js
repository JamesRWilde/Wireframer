/**
 * setLodRange - Set Lod Range
 *
 * PURPOSE:
 *   Sets lod range object with min and max bounds.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/mesh/setLodRange.js
 */

import { lodRangeState } from '@engine/state/mesh/stateLodRangeState.js';


/**
 * Sets lod range object with min and max bounds.
 * @param {*} range - The value to set.
 */
export function setLodRange(range) {
  lodRangeState.value = range;
}
