/**
 * canvasContextState.js - Shared 2D Canvas Rendering Context State
 *
 * PURPOSE:
 *   Holds the main 2D rendering context (`ctx`) used by the CPU pipeline.
 *   Single source of truth for the canvas context so consumers import
 *   from here instead of threading it through function parameters.
 *
 * ARCHITECTURE ROLE:
 *   Written once during canvas init (initCanvas). Read by all CPU rendering
 *   functions that need to draw on the main canvas.
 *
 * WHY THIS EXISTS:
 *   The rendering context was previously scoped to `window` — this module
 *   replaces that with proper encapsulation so the context is trackable,
 *   testable, and explicitly owned by the engine state layer.
 */

export const canvasContext = {
  ctx: /** @type {CanvasRenderingContext2D|null} */ (null),
};
