/**
 * inputCanvasState.js - Input canvas reference state
 *
 * PURPOSE:
 *   Store and retrieve the current input canvas reference in a single state module.
 *   Avoids globalThis._inputCanvas usage and enables test-friendly access.
 */

"use strict";

/**
 * inputCanvasState.js - Input canvas reference state
 *
 * PURPOSE:
 *   Keep only the state container in this module.
 *   Get/set behavior is implemented in get/set folders.
 */

export const inputCanvasState = {
  value: /** @type {?HTMLCanvasElement} */ (null),
};
