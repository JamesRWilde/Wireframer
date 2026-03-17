/**
 * syncCanvasSize.js - Canvas Size Synchronization
 *
 * PURPOSE:
 *   Synchronizes all canvas elements (CPU, GPU, background, fill layer)
 *   to match the current viewport dimensions. Called on initialization
 *   and window resize events.
 *
 * ARCHITECTURE ROLE:
 *   Called by canvas.js init and window resize handlers. Ensures all
 *   rendering surfaces stay in sync with the browser viewport.
 *
 * DETAILS:
 *   Sets canvas.width and canvas.height directly (not CSS dimensions)
 *   to update the actual pixel resolution of each rendering surface.
 */

"use strict";

/**
 * syncCanvasSize - Synchronizes all canvas dimensions to viewport size
 *
 * @param {HTMLCanvasElement} [cpuCanvas] - The CPU canvas element to resize
 * @returns {void}
 */
export function syncCanvasSize(cpuCanvas) {
  // Read current viewport dimensions
  const w = globalThis.innerWidth;
  const h = globalThis.innerHeight;

  // Store viewport dimensions globally
  globalThis.W = w;
  globalThis.H = h;

  // Resize the CPU canvas
  if (cpuCanvas) {
    cpuCanvas.width = w;
    cpuCanvas.height = h;
  }

  // Resize the background canvas
  const bgCanvas = document.getElementById('bg');
  if (bgCanvas) {
    bgCanvas.width = w;
    bgCanvas.height = h;
  }

  // Resize the foreground (CPU) canvas
  if (globalThis.fgCanvas) {
    globalThis.fgCanvas.width = w;
    globalThis.fgCanvas.height = h;
  }

  // Resize the GPU canvas
  if (globalThis.gpuCanvas) {
    globalThis.gpuCanvas.width = w;
    globalThis.gpuCanvas.height = h;
  }

  // Resize the fill layer canvas (used for triangle fill rendering)
  if (globalThis.fillLayerCanvas) {
    globalThis.fillLayerCanvas.width = w;
    globalThis.fillLayerCanvas.height = h;
  }

}
