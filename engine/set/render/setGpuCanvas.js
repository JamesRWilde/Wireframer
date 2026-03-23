/**
 * setGpuCanvas.js - Set GPU Canvas
 *
 * PURPOSE:
 *   Stores a reference to the GPU (WebGL) canvas DOM element in shared state.
 *   This canvas hosts the WebGL rendering context used by the GPU pipeline.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the gpuCanvas property in canvasElementsState.
 *   Called during canvas initialization (initCanvas) to register the
 *   canvas element so other modules can access it via getter.
 *
 * WHY THIS EXISTS:
 *   The GPU pipeline needs access to the WebGL canvas for buffer clearing
 *   and viewport setup. Storing it in shared state avoids passing it
 *   through every call in the rendering chain.
 */

"use strict";

// Import the shared canvas elements state container
// Holds references to all DOM canvas elements used by the rendering pipeline
import { canvasElementsState } from '@engine/state/render/stateCanvasElementsState.js';

/**
 * setGpuCanvas - Stores a reference to the GPU canvas element
 * @param {HTMLCanvasElement} canvas - The GPU (WebGL) canvas DOM element to store
 */
export function setGpuCanvas(canvas) {
  canvasElementsState.gpuCanvas = canvas;
}
