/**
 * getInputCanvas.js - Get Input Canvas
 *
 * PURPOSE:
 *   Returns input canvas dom element.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getInputCanvas.js
 *
 * WHY THIS EXISTS:
 *   Isolates input canvas access for pointer/touch coordinate translation without
 *   direct DOM coupling.
 */

"use strict";

// Import input canvas state container as a single source-of-truth.
import { inputCanvasState } from '@engine/state/render/stateInputCanvasState.js';


/**
 * Returns input canvas dom element.
 * @returns {*} The current value from state.
 */
export function getInputCanvas() {
  return inputCanvasState.value;
}
