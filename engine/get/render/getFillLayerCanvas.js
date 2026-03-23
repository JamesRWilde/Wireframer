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
 *
 * WHY THIS EXISTS:
 *   Ensures all modules access the same canvas instance when rendering fills.
 */

// Import shared canvas elements state reference
import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * Returns fill layer canvas dom element.
 * @returns {*} The current value from state.
 */
export function getFillLayerCanvas() {
  return canvasElementsState.fillLayerCanvas;
}
