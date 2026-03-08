"use strict";

/**
 * canvasElementsState.js - Canvas DOM element and context references
 *
 * PURPOSE:
 *   Stores cross-module references to primary canvas elements and their
 *   associated contexts.
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
