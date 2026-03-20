/**
 * morphState.js - Morph pipeline state storage
 *
 * PURPOSE:
 *   Holds the runtime morph API handlers and duration configuration.
 *   Replaces globalThis.morph and globalThis.MORPH_DURATION_MS usage.
 */

"use strict";

export const morphState = {
  api: /** @type {Object|null} */ (null),
  durationMs: 1600,
};
