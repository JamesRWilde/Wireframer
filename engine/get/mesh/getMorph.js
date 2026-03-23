/**
 * getMorph.js - Get Morph API
 *
 * PURPOSE:
 *   Returns the current morph animation API function.
 *
 * ARCHITECTURE ROLE:
 *   Getter for the morph animation function from morphState.
 *
 * WHY THIS EXISTS:
 *   Keeps morph API resolution centralized so consumers don't depend on
 *   implementation details of how morph state is tracked.
 */

"use strict";

// Import morphState which contains the active API callbacks and parameters.
import { morphState } from '@engine/state/mesh/stateMorphState.js';

/**
 * getMorph - Returns the currently configured morph API function.
 * @returns {Function|null} The morph API function or null if uninitialized.
 */
export function getMorph() {
  return morphState.api;
}
