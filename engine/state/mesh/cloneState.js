/**
 * cloneState.js - Mesh cloning state abstraction
 *
 * PURPOSE:
 *   Allows safe use of a configurable clone function in place of globalThis.clone.
 */

"use strict";

export const cloneState = {
  value: /** @type {function|null} */ (null),
};
