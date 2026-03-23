/**
 * setCanvasCtx.js - Set Canvas 2D Rendering Context
 *
 * PURPOSE:
 *   Stores the active 2D canvas rendering context used by the CPU pipeline.
 *   This context is retrieved by CPU rendering functions to draw triangles,
 *   wireframes, and clear the canvas each frame.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the shared canvas context reference in canvasContextState.
 *   Called once during initialization (initCanvas) so the CPU pipeline
 *   can access the context without passing it through every function.
 *
 * WHY THIS EXISTS:
 *   The CPU rendering path needs a CanvasRenderingContext2D for all draw
 *   operations. Rather than threading the context through every call,
 *   we store it once and retrieve it via getCanvasCtx when needed.
 */

"use strict";

// Import the shared canvas context state container
// Holds the 2D rendering context used by all CPU draw operations
import { canvasContext } from '@engine/state/render/stateCanvasContextState.js';

/**
 * setCanvasCtx - Stores the active 2D canvas rendering context
 * @param {CanvasRenderingContext2D|null} ctx - The 2D rendering context to store
 */
export function setCanvasCtx(ctx) {
  canvasContext.ctx = ctx;
}
