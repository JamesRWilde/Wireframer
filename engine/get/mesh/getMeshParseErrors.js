/**
 * getMeshParseErrors - Get Mesh Parse Errors
 *
 * PURPOSE:
 *   Returns array of mesh parse error messages.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/mesh/getMeshParseErrors.js
 */

import { meshParseErrorsState } from '@engine/state/mesh/stateMeshParseErrorsState.js';


/**
 * Returns array of mesh parse error messages.
 * @returns {*} The current value from state.
 */
export function getMeshParseErrors() {
  return meshParseErrorsState.value;
}
