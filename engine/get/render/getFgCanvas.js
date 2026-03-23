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
 *
 * WHY THIS EXISTS:
 *   Centralizes canvas element state so render initialization can avoid
 *   querying DOM repeatedly and can gracefully handle unmounted canvas.
 */

// Import shared canvas elements state reference
import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * Returns foreground canvas dom element.
 * @returns {*} The current value from state.
 */
export function getFgCanvas() {
  return canvasElementsState.fgCanvas;
}
