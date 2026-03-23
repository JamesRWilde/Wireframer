/**
 * set/render/canvasContext.js - Canvas context setter
 *
 * Exposes canonical UI state mutator for the active 2D rendering context.
 */

"use strict";

import { canvasContext } from '@engine/state/render/stateCanvasContextState.js';

/**
 * setCanvasCtx - set the current 2D canvas rendering context.
 * @param {CanvasRenderingContext2D|null} ctx
 */
export function setCanvasCtx(ctx) {
  canvasContext.ctx = ctx;
}
