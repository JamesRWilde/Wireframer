/**
 * setSyncCanvasSize.js - Canvas Size Synchronization
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
 * WHY THIS EXISTS:
 *   The rendering pipeline uses multiple canvas layers that must all have
 *   matching dimensions. If any canvas is out of sync, rendering artifacts
 *   (misaligned layers, stretched content) will occur. This function
 *   ensures they all stay aligned during init and resize.
 *
 * DETAILS:
 *   Sets canvas.width and canvas.height directly (not CSS dimensions)
 *   to update the actual pixel resolution of each rendering surface.
 */

"use strict";

// Import width/height setters to store viewport dimensions in shared state
import { setW } from '@engine/set/render/setW.js';
import { setH } from '@engine/set/render/setH.js';
// Import canvas getters to retrieve the GPU and foreground canvas references
import { getFgCanvas } from '@engine/get/render/getFgCanvas.js';
import { getGpuCanvas } from '@engine/get/render/getGpuCanvas.js';
import { getFillLayerCanvas } from '@engine/get/render/getFillLayerCanvas.js';

/**
 * setSyncCanvasSize - Synchronizes all canvas dimensions to viewport size
 *
 * @param {HTMLCanvasElement} [cpuCanvas] - The CPU canvas element to resize
 * @returns {void}
 */
export function setSyncCanvasSize(cpuCanvas) {
  // Read current viewport dimensions (guard against non-browser environments)
  const w = 'window' in globalThis ? (globalThis.window.innerWidth || 0) : 0;
  const h = 'window' in globalThis ? (globalThis.window.innerHeight || 0) : 0;

  // Store viewport dimensions in shared state so renderers can read them
  setW(w);
  setH(h);

  // Resize the CPU canvas if provided
  if (cpuCanvas) {
    cpuCanvas.width = w;
    cpuCanvas.height = h;
  }

  // Resize the background canvas (CPU background particles)
  const bgCanvas = document.getElementById('bg');
  if (bgCanvas) {
    bgCanvas.width = w;
    bgCanvas.height = h;
  }

  // Resize the GPU background canvas (separate pipeline for GPU particles)
  const bgGpuCanvas = document.getElementById('bg-gpu');
  if (bgGpuCanvas) {
    bgGpuCanvas.width = w;
    bgGpuCanvas.height = h;
  }

  // Resize the foreground canvas (CPU model rendering layer)
  const fgCanvas = getFgCanvas();
  if (fgCanvas) {
    fgCanvas.width = w;
    fgCanvas.height = h;
  }

  // Resize the GPU canvas (WebGL rendering layer)
  const gpuCanvas = getGpuCanvas();
  if (gpuCanvas) {
    gpuCanvas.width = w;
    gpuCanvas.height = h;
  }

  // Resize the fill layer canvas (triangle fill overlay for CPU pipeline)
  const fillLayerCanvas = getFillLayerCanvas();
  if (fillLayerCanvas) {
    fillLayerCanvas.width = w;
    fillLayerCanvas.height = h;
  }

}
