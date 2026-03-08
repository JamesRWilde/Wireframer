"use strict";

/**
 * setFillLayerCanvas - Set Fill Layer Canvas
 *
 * PURPOSE:
 *   Sets fill layer canvas dom element.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setFillLayerCanvas.js
 */

import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';

/**
 * Sets fill layer canvas dom element.
 * @param {*} canvas - The value to set.
 */
export function setFillLayerCanvas(canvas) {
  canvasElementsState.fillLayerCanvas = canvas;
}
