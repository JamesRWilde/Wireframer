"use strict";

/**
 * setFgCanvas - Set Fg Canvas
 *
 * PURPOSE:
 *   Sets foreground canvas dom element.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setFgCanvas.js
 */

import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';

/**
 * Sets foreground canvas dom element.
 * @param {*} canvas - The value to set.
 */
export function setFgCanvas(canvas) {
  canvasElementsState.fgCanvas = canvas;
}
