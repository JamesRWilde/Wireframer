"use strict";

/**
 * getFgCanvas - Get Fg Canvas
 *
 * PURPOSE:
 *   Returns foreground canvas dom element.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getFgCanvas.js
 */

import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * Returns foreground canvas dom element.
 * @returns {*} The current value from state.
 */
export function getFgCanvas() {
  return canvasElementsState.fgCanvas;
}
