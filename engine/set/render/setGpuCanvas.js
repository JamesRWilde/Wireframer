"use strict";

/**
 * setGpuCanvas - Set Gpu Canvas
 *
 * PURPOSE:
 *   Sets gpu-accelerated canvas dom element.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setGpuCanvas.js
 */

import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';

/**
 * Sets gpu-accelerated canvas dom element.
 * @param {*} canvas - The value to set.
 */
export function setGpuCanvas(canvas) {
  canvasElementsState.gpuCanvas = canvas;
}
