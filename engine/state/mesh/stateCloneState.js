/**
 * cloneState.js - Mesh cloning state abstraction
 *
 * PURPOSE:
 *   Allows safe use of a configurable clone function in module state.
 */

"use strict";

export const cloneState = {
  value: /** @type {function|null} */ (null),
};
