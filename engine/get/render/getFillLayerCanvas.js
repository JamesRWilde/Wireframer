"use strict";

/**
 * getFillLayerCanvas - Get Fill Layer Canvas
 *
 * PURPOSE:
 *   Returns fill layer canvas dom element.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getFillLayerCanvas.js
 */

import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';

/**
 * Returns fill layer canvas dom element.
 * @returns {*} The current value from state.
 */
export function getFillLayerCanvas() {
  return canvasElementsState.fillLayerCanvas;
}
