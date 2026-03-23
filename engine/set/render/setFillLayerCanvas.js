/**
 * setFillLayerCanvas.js - Set Fill Layer Canvas
 *
 * PURPOSE:
 *   Stores a reference to the fill layer canvas DOM element in shared state.
 *   This canvas is used for triangle fill rendering in the CPU pipeline.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the fillLayerCanvas property in canvasElementsState.
 *   Called during canvas initialization (initCanvas) to register the
 *   canvas element so other modules can access it via getter.
 *
 * WHY THIS EXISTS:
 *   Multiple rendering modules need access to the fill layer canvas (the
 *   transparent overlay used for triangle-fill rendering). Rather than
 *   passing it as a parameter through every call chain, we store it in
 *   shared state once during initialization.
 */

"use strict";

// Import the shared canvas elements state container
// Holds references to all DOM canvas elements used by the rendering pipeline
import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * setFillLayerCanvas - Stores a reference to the fill layer canvas element
 * @param {HTMLCanvasElement} canvas - The fill layer canvas DOM element to store
 */
export function setFillLayerCanvas(canvas) {
  // Store the canvas reference so getFillLayerCanvas can retrieve it later
  canvasElementsState.fillLayerCanvas = canvas;
}
