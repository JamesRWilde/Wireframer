/**
 * getInputCanvas - Get Input Canvas
 *
 * PURPOSE:
 *   Returns input canvas dom element.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getInputCanvas.js
 */

import { inputCanvasState } from '@engine/state/render/stateInputCanvasState.js';


/**
 * Returns input canvas dom element.
 * @returns {*} The current value from state.
 */
export function getInputCanvas() {
  return inputCanvasState.value;
}
