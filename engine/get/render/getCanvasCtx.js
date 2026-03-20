/**
 * get/render/canvasContext.js - Canvas context getter
 *
 * Exposes canonical UI state value for the active 2D rendering context.
 * This is the accessor side of the `globalThis.ctx` replacement.
 */

"use strict";

import { canvasContext } from '@engine/state/render/canvasContextState.js';

/**
 * getCanvasCtx - return the current 2D canvas rendering context.
 * @returns {CanvasRenderingContext2D|null}
 */
export function getCanvasCtx() {
  return canvasContext.ctx;
}
