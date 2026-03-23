/**
 * setInputCanvas - Set Input Canvas
 *
 * PURPOSE:
 *   Sets input canvas dom element for pointer events.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setInputCanvas.js
 */

import { inputCanvasState } from '@engine/state/render/stateInputCanvasState.js';


/**
 * Sets input canvas dom element for pointer events.
 * @param {*} canvas - The value to set.
 */
export function setInputCanvas(canvas) {
  inputCanvasState.value = canvas;
}
