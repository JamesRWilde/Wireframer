/**
 * setMeshClone - Set Mesh Clone
 *
 * PURPOSE:
 *   Sets callback function for mesh cloning.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/mesh/setMeshClone.js
 */

import { cloneState } from '@engine/state/mesh/cloneState.js';


/**
 * Sets callback function for mesh cloning.
 * @param {*} fn - The value to set.
 */
export function setMeshClone(fn) {
  cloneState.value = fn;
}
