/**
 * setFgCanvas.js - Set Foreground Canvas
 *
 * PURPOSE:
 *   Stores a reference to the foreground canvas DOM element in shared state.
 *   The foreground canvas is used by the CPU pipeline to render the 3D model
 *   on a separate layer from the background.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the fgCanvas property in canvasElementsState.
 *   Called during canvas initialization (initCanvas) to register the
 *   canvas element so other modules can access it via getter.
 *
 * WHY THIS EXISTS:
 *   The CPU rendering path draws the 3D model onto the foreground canvas.
 *   Multiple modules need access to it (clearing, compositing, visibility),
 *   so we store the DOM reference once in shared state.
 */

"use strict";

// Import the shared canvas elements state container
// Holds references to all DOM canvas elements used by the rendering pipeline
import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * setFgCanvas - Stores a reference to the foreground canvas element
 * @param {HTMLCanvasElement} canvas - The foreground canvas DOM element to store
 */
export function setFgCanvas(canvas) {
  canvasElementsState.fgCanvas = canvas;
}
