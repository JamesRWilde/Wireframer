"use strict";

/**
 * getFillLayerCtx - Get Fill Layer Ctx
 *
 * PURPOSE:
 *   Returns fill layer 2d rendering context.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getFillLayerCtx.js
 *
 * WHY THIS EXISTS:
 *   Prevents direct DOM context access throughout rendering logic and
 *   simplifies response to context recreation/replacement.
 */

// Import shared canvas elements state reference
import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * Returns fill layer 2d rendering context.
 * @returns {*} The current value from state.
 */
export function getFillLayerCtx() {
  return canvasElementsState.fillLayerCtx;
}
