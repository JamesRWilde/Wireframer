/**
 * canvasContextState.js - Shared 2D canvas rendering context state
 *
 * PURPOSE:
 *   Provide a focused getter/setter for the main 2D rendering context
 *   (`ctx`) so callers do not touch globalThis directly.
 *
 * ARCHITECTURE:
 *   This is one global state variable / domain, the first full migration
 *   for the old `globalThis.ctx`. All new code should import from here.
 */

"use strict";

/**
 * canvasContextState.js - Shared 2D canvas context state container.
 *
 * PURPOSE:
 *   Holds mutable shared variables only. Getters/setters are exposed through
 *   engine/get/* and engine/set/*. This keeps domain separation explicit.
 */

export const canvasContext = {
  ctx: /** @type {CanvasRenderingContext2D|null} */ (null),
};
