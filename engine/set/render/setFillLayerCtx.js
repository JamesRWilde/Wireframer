"use strict";

/**
 * setFillLayerCtx - Set Fill Layer Ctx
 *
 * PURPOSE:
 *   Sets fill layer 2d rendering context.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setFillLayerCtx.js
 */

import { canvasElementsState } from '@engine/state/render/canvasElementsState.js';

/**
 * Sets fill layer 2d rendering context.
 * @param {*} ctx - The value to set.
 */
export function setFillLayerCtx(ctx) {
  canvasElementsState.fillLayerCtx = ctx;
}
