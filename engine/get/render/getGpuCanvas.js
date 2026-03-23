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
 *
 * WHY THIS EXISTS:
 *   Provides a centralized getter to avoid coupling GPU path code directly
 *   to DOM element references.
 */

// Import shared canvas elements state reference
import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * Returns gpu canvas dom element.
 * @returns {*} The current value from state.
 */
export function getGpuCanvas() {
  return canvasElementsState.gpuCanvas;
}
