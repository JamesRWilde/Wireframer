/**
 * fillWorker.js - CPU Fill Worker Disposal
 *
 * PURPOSE:
 *   Terminates the CPU fill render worker and cleans up its resources
 *   (worker instance, cached image bitmap, offscreen canvas reference).
 *
 * ARCHITECTURE ROLE:
 *   Called during engine shutdown or when switching render modes to
 *   release worker thread resources and prevent memory leaks.
 */

"use strict";

// Import shared fill state to access and clean up worker resources
import { fillRenderState } from "@engine/state/stateFillRenderBridge.js";

/**
 * fillWorker - Terminates the fill render worker and releases resources
 *
 * @returns {void}
 */
export function fillWorker() {
  // Terminate the worker if it exists
  if (fillRenderState.worker) {
    fillRenderState.worker.terminate();
    fillRenderState.worker = null;
    fillRenderState.workerReady = false;
    fillRenderState.workerAvailable = false;
  }

  // Close and release the cached image bitmap to free GPU memory
  if (fillRenderState.cachedImageBitmap) {
    fillRenderState.cachedImageBitmap.close();
    fillRenderState.cachedImageBitmap = null;
  }

  // Clear the offscreen canvas reference
  fillRenderState.offscreenCanvas = null;
}
