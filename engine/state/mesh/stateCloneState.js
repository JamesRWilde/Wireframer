/**
 * cloneState.js - Mesh cloning state abstraction
 *
 * PURPOSE:
 *   Allows safe use of a configurable clone function in module state.
 *
 * ARCHITECTURE ROLE:
 *   Provides a shared storage point for the global clone callback used by
 *   mesh operations requiring deep copies or transformations.
 *
 * WHY THIS EXISTS:
 *   Enables pluggable cloning behavior and avoids hard-coded clone semantics
 *   across multiple modules.
 */

"use strict";

export const cloneState = {
  value: /** @type {function|null} */ (null),
};
