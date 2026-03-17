/**
 * fillWorker.js - CPU Fill Render Worker Initialization
 *
 * PURPOSE:
 *   Creates and initializes a Web Worker for CPU-based triangle fill
 *   rendering using OffscreenCanvas. Handles worker lifecycle, message
 *   passing, and error handling.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawSolidFillModel to set up the offscreen fill render
 *   pipeline. The worker receives render commands and returns rendered
 *   ImageBitmaps for compositing onto the main canvas.
 *
 * SIDE EFFECTS:
 *   - Mutates fillState (worker, offscreenCanvas, workerReady, etc.)
 *   - Posts init message to worker with OffscreenCanvas transfer
 */

"use strict";

// Import shared fill render state to track worker lifecycle
import { fillState as state } from "@engine/state/cpu/fillRenderBridge.js";

/**
 * fillWorker - Creates and initializes the CPU fill render worker
 *
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {boolean} Whether the worker was successfully initialized
 */
export function fillWorker(width, height) {
  // Return early if worker already exists
  if (state.worker) return true;

  // Check for OffscreenCanvas support (required for worker rendering)
  if (typeof OffscreenCanvas === 'undefined') {
    console.warn('[fillRenderBridge] OffscreenCanvas not supported');
    state.workerAvailable = false;
    return false;
  }

  try {
    // Create an OffscreenCanvas for the worker to render into
    state.offscreenCanvas = new OffscreenCanvas(width, height);

    // Instantiate the fill worker from its module URL
    state.worker = new Worker(
      new URL('../../state/gpu/fillWorker.js', import.meta.url).href,
      { type: 'module' }
    );
    state.workerAvailable = true;

    // Handle messages from the worker (ready, rendered frames, errors)
    state.worker.onmessage = (event) => {
      const { type, imageBitmap, frameId, message } = event.data;
      if (type === 'ready') {
        // Worker has completed initialization
        state.workerReady = true;
      } else if (type === 'rendered') {
        // New rendered frame received; replace cached bitmap
        if (state.cachedImageBitmap) state.cachedImageBitmap.close();
        state.cachedImageBitmap = imageBitmap;
        state.cachedFrameId = frameId;
      } else if (type === 'error') {
        // Log worker errors with throttling to avoid console spam
        if (state.errorCount < state.MAX_ERROR_LOGS) {
          console.warn('[fillRenderBridge] Worker error:', message);
          state.errorCount++;
        }
      }
    };

    // Handle fatal worker errors (e.g., script crash)
    state.worker.onerror = (error) => {
      if (state.errorCount < state.MAX_ERROR_LOGS) {
        console.warn('[fillRenderBridge] Worker error:', error.message);
        state.errorCount++;
      }
    };

    // Send init message with transferred OffscreenCanvas ownership
    state.worker.postMessage(
      { type: 'init', canvas: state.offscreenCanvas, width, height },
      [state.offscreenCanvas]
    );

    return true;
  } catch (error) {
    console.warn('[fillRenderBridge] Initialization failed:', error.message);
    state.workerAvailable = false;
    return false;
  }
}
