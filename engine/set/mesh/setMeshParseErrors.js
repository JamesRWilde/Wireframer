/**
 * setMeshParseErrors.js - Set Mesh Parse Error Buffer
 *
 * PURPOSE:
 *   Stores the array of mesh parse error messages accumulated during
 *   the most recent model load. Cleared at the start of each load
 *   and inspected after loading to report issues to the user.
 *
 * ARCHITECTURE ROLE:
 *   Setter for meshParseErrorsState.value. Called by the OBJ parser
 *   to accumulate warnings (e.g. invalid face indices, missing normals).
 *
 * WHY THIS EXISTS:
 *   OBJ parsing is complex and often produces non-fatal errors (malformed
 *   lines, out-of-range indices). Collecting them in a shared buffer
 *   lets the UI display them to the user after loading completes.
 */

"use strict";

// Import the mesh parse errors state container
// Holds the array of error message strings from the most recent parse
import { meshParseErrorsState } from '@engine/state/mesh/stateMeshParseErrorsState.js';

/**
 * setMeshParseErrors - Stores the array of parse error messages
 * @param {Array<string>} errors - Array of error message strings
 */
export function setMeshParseErrors(errors) {
  meshParseErrorsState.value = errors;
}
