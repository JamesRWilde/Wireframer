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

import { setW } from '@engine/set/render/width.js';
import { setH } from '@engine/set/render/height.js';
import { getFgCanvas } from '@engine/get/render/getFgCanvas.js';
import { getGpuCanvas } from '@engine/get/render/getGpuCanvas.js';
import { getFillLayerCanvas } from '@engine/get/render/getFillLayerCanvas.js';

/**
 * syncCanvasSize - Synchronizes all canvas dimensions to viewport size
 *
 * @param {HTMLCanvasElement} [cpuCanvas] - The CPU canvas element to resize
 * @returns {void}
 */
export function syncCanvasSize(cpuCanvas) {
  // Read current viewport dimensions
  const w = 'window' in globalThis ? (globalThis.window.innerWidth || 0) : 0;
  const h = 'window' in globalThis ? (globalThis.window.innerHeight || 0) : 0;

  // Store viewport dimensions in shared state
  setW(w);
  setH(h);

  // Resize the CPU canvas
  if (cpuCanvas) {
    cpuCanvas.width = w;
    cpuCanvas.height = h;
  }

  // Resize the background canvas (CPU background)
  const bgCanvas = document.getElementById('bg');
  if (bgCanvas) {
    bgCanvas.width = w;
    bgCanvas.height = h;
  }

  // Resize the GPU background canvas (separate pipeline)
  const bgGpuCanvas = document.getElementById('bg-gpu');
  if (bgGpuCanvas) {
    bgGpuCanvas.width = w;
    bgGpuCanvas.height = h;
  }

  // Resize the foreground (CPU) canvas
  const fgCanvas = getFgCanvas();
  if (fgCanvas) {
    fgCanvas.width = w;
    fgCanvas.height = h;
  }

  // Resize the GPU canvas
  const gpuCanvas = getGpuCanvas();
  if (gpuCanvas) {
    gpuCanvas.width = w;
    gpuCanvas.height = h;
  }

  // Resize the fill layer canvas (used for triangle fill rendering)
  const fillLayerCanvas = getFillLayerCanvas();
  if (fillLayerCanvas) {
    fillLayerCanvas.width = w;
    fillLayerCanvas.height = h;
  }

}
