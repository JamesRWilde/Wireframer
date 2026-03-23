/**
 * getMeshClone.js - Get Mesh Clone Function
 *
 * PURPOSE:
 *   Returns callback function for mesh cloning.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/mesh/getMeshClone.js
 *
 * WHY THIS EXISTS:
 *   Encapsulates clone callback state so callers never bind to mutable state object.
 */

"use strict";

// Import clone state container, used for object instance duplication.
import { cloneState } from '@engine/state/mesh/stateCloneState.js';


/**
 * Returns callback function for mesh cloning.
 * @returns {*} The current value from state.
 */
export function getMeshClone() {
  return cloneState.value;
}
