"use strict";

/**
 * canvasElementsState.js - Canvas DOM element and context references
 *
 * PURPOSE:
 *   Stores cross-module references to primary canvas elements and their
 *   associated contexts.
 *
 * ARCHITECTURE ROLE:
 *   Shared source of truth for canvas element references used by render
 *   initialization and drawing modules.
 *
 * WHY THIS EXISTS:
 *   Communicates the file's role in the state architecture clearly and
 *   makes state ownership explicit.
 *
 * STATE RULES:
 *   - State file only: no getters/setters.
 *   - Access via @engine/get/render/* and @engine/set/render/* modules.
 */

export const canvasElementsState = {
  fgCanvas: null,
  gpuCanvas: null,
  fillLayerCanvas: null,
  fillLayerCtx: null,
};
