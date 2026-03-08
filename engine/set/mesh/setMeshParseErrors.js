/**
 * setMeshParseErrors - Set Mesh Parse Errors
 *
 * PURPOSE:
 *   Sets array of mesh parse error messages.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/mesh/setMeshParseErrors.js
 */

import { meshParseErrorsState } from '@engine/state/mesh/meshParseErrorsState.js';


/**
 * Sets array of mesh parse error messages.
 * @param {*} errors - The value to set.
 */
export function setMeshParseErrors(errors) {
  meshParseErrorsState.value = errors;
}
