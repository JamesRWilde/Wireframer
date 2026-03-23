/**
 * setFillLayerCtx.js - Set Fill Layer 2D Rendering Context
 *
 * PURPOSE:
 *   Stores the 2D rendering context of the fill layer canvas in shared state.
 *   This context is used by the CPU pipeline for triangle-fill rendering
 *   on the transparent overlay layer.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the fillLayerCtx property in canvasElementsState.
 *   Called during canvas initialization (initCanvas) alongside the other
 *   context and canvas setters.
 *
 * WHY THIS EXISTS:
 *   The fill layer is a transparent overlay canvas used for triangle-fill
 *   rendering separate from the main foreground. Its 2D context is needed
 *   by the CPU fill renderer but shouldn't be passed through every call.
 */

"use strict";

// Import the shared canvas elements state container
// Holds references to all DOM canvas elements and their 2D contexts
import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * setFillLayerCtx - Stores the fill layer's 2D rendering context
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the fill layer canvas
 */
export function setFillLayerCtx(ctx) {
  canvasElementsState.fillLayerCtx = ctx;
}
