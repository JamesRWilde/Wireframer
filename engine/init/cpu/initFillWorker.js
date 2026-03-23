/**
 * fillWorker.js - CPU Fill Render Worker Initialization
 *
 * PURPOSE:
 *   Creates and initializes a Web Worker for CPU-based triangle fill
 *   rendering using OffscreenCanvas. Handles worker lifecycle, message
 *   passing, and error handling.
 *
 * ARCHITECTURE ROLE:
 *   Called by setDrawSolidFillModel to set up the offscreen fill render
 *   pipeline. The worker receives render commands and returns rendered
 *   ImageBitmaps for compositing onto the main canvas.
 *
 * WHY THIS EXISTS:
 *   Provides a reusable worker setup for CPU fill path that handles platform
 *   capability detection and worker lifecycle in one place.
 *
 * SIDE EFFECTS:
 *   - Mutates fillRenderState (worker, offscreenCanvas, workerReady, etc.)
 *   - Posts init message to worker with OffscreenCanvas transfer
 */

"use strict";

// Import shared fill render state to track worker lifecycle
import { fillRenderState } from "@engine/state/stateFillRenderBridge.js";

/**
 * fillWorker - Creates and initializes the CPU fill render worker
 *
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {boolean} Whether the worker was successfully initialized
 */
export function initFillWorker(width, height) {
  // Return early if worker already exists
  if (fillRenderState.worker) return true;

  // Check for OffscreenCanvas support (required for worker rendering)
  if (typeof OffscreenCanvas === 'undefined') {
    console.warn('[fillRenderBridge] OffscreenCanvas not supported');
    fillRenderState.workerAvailable = false;
    return false;
  }

  try {
    // Create an OffscreenCanvas for the worker to render into
    fillRenderState.offscreenCanvas = new OffscreenCanvas(width, height);

    // Instantiate the fill worker from its module URL
    fillRenderState.worker = new Worker(
      new URL('../../state/gpu/fillWorker.js', import.meta.url).href,
      { type: 'module' }
    );
    fillRenderState.workerAvailable = true;

    // Handle messages from the worker (ready, rendered frames, errors)
    fillRenderState.worker.onmessage = (event) => {
      const { type, imageBitmap, frameId, message } = event.data;
      if (type === 'ready') {
        // Worker has completed initialization
        fillRenderState.workerReady = true;
      } else if (type === 'rendered') {
        // New rendered frame received; replace cached bitmap
        if (fillRenderState.cachedImageBitmap) fillRenderState.cachedImageBitmap.close();
        fillRenderState.cachedImageBitmap = imageBitmap;
        fillRenderState.cachedFrameId = frameId;
      } else if (type === 'error') {
        // Log worker errors with throttling to avoid console spam
        if (fillRenderState.errorCount < fillRenderState.MAX_ERROR_LOGS) {
          console.warn('[fillRenderBridge] Worker error:', message);
          fillRenderState.errorCount++;
        }
      }
    };

    // Handle fatal worker errors (e.g., script crash)
    fillRenderState.worker.onerror = (error) => {
      if (fillRenderState.errorCount < fillRenderState.MAX_ERROR_LOGS) {
        console.warn('[fillRenderBridge] Worker error:', error.message);
        fillRenderState.errorCount++;
      }
    };

    // Send init message with transferred OffscreenCanvas ownership
    fillRenderState.worker.postMessage(
      { type: 'init', canvas: fillRenderState.offscreenCanvas, width, height },
      [fillRenderState.offscreenCanvas]
    );

    return true;
  } catch (error) {
    console.warn('[fillRenderBridge] Initialization failed:', error.message);
    fillRenderState.workerAvailable = false;
    return false;
  }
}
