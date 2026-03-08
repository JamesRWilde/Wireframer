/**
 * getMeshClone - Get Mesh Clone
 *
 * PURPOSE:
 *   Returns callback function for mesh cloning.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/mesh/getMeshClone.js
 */

import { cloneState } from '@engine/state/mesh/cloneState.js';


/**
 * Returns callback function for mesh cloning.
 * @returns {*} The current value from state.
 */
export function getMeshClone() {
  return cloneState.value;
}
