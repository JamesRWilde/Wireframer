"use strict";

/**
 * getGpuCanvas - Get Gpu Canvas
 *
 * PURPOSE:
 *   Returns gpu canvas dom element.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getGpuCanvas.js
 */

import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * Returns gpu canvas dom element.
 * @returns {*} The current value from state.
 */
export function getGpuCanvas() {
  return canvasElementsState.gpuCanvas;
}
