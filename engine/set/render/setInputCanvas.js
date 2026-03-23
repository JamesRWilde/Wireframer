/**
 * setInputCanvas.js - Set Input Canvas
 *
 * PURPOSE:
 *   Stores a reference to the input canvas DOM element that receives pointer
 *   events (mouse and touch) for model interaction.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the inputCanvas property in inputCanvasState.
 *   Called during canvas initialization (initCanvas) so the input handling
 *   system can attach event listeners to the correct element.
 *
 * WHY THIS EXISTS:
 *   The input canvas is the element that receives user interactions (drag
 *   to rotate, touch events). Its reference is stored once so event
 *   listeners can be attached during initialization without passing it
 *   through the entire input handler chain.
 */

"use strict";

// Import the input canvas state container
// Holds the DOM element that receives pointer events for model interaction
import { inputCanvasState } from '@engine/state/render/stateInputCanvasState.js';

/**
 * setInputCanvas - Stores a reference to the input canvas element
 * @param {HTMLCanvasElement} canvas - The canvas element that receives pointer events
 */
export function setInputCanvas(canvas) {
  inputCanvasState.value = canvas;
}
