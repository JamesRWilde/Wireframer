/**
 * morphState.js - Morph pipeline state storage
 *
 * PURPOSE:
 *   Holds the runtime morph API handlers and duration configuration.
 *   Replaces legacy morph and MORPH_DURATION_MS usage with module state.
 *
 * ARCHITECTURE ROLE:
 *   Provides a shared state object for retrieving and updating morphing
 *   settings and callbacks across modules.
 *
 * WHY THIS EXISTS:
 *   Enables a single coordinated morph configuration source for consistent
 *   animation behavior and use by the UI and engine.
 */

"use strict";

export const morphState = {
  api: /** @type {Object|null} */ (null),
  durationMs: 1600,
};
