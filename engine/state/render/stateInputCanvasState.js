/**
 * inputCanvasState.js - Input canvas reference state
 *
 * PURPOSE:
 *   Store and retrieve the current input canvas reference in a single state module.
 *   Avoids legacy global inputCanvas usage and enables test-friendly access.
 *
 * ARCHITECTURE ROLE:
 *   Encapsulates input canvas state for cross-module access via get/set helpers.
 *
 * WHY THIS EXISTS:
 *   Explicitly states the purpose of this state container to match project-wide
 *   header conventions.
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
