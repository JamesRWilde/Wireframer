/**
 * morphState.js - Morph pipeline state storage
 *
 * PURPOSE:
 *   Holds the runtime morph API handlers and duration configuration.
 *   Replaces legacy morph and MORPH_DURATION_MS usage with module state.
 */

"use strict";

export const morphState = {
  api: /** @type {Object|null} */ (null),
  durationMs: 1600,
};
