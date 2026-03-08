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
import { fillState } from "@engine/state/fillRenderBridge.js";

/**
 * fillWorker - Terminates the fill render worker and releases resources
 *
 * @returns {void}
 */
export function fillWorker() {
  // Terminate the worker if it exists
  if (fillState.worker) {
    fillState.worker.terminate();
    fillState.worker = null;
    fillState.workerReady = false;
    fillState.workerAvailable = false;
  }

  // Close and release the cached image bitmap to free GPU memory
  if (fillState.cachedImageBitmap) {
    fillState.cachedImageBitmap.close();
    fillState.cachedImageBitmap = null;
  }

  // Clear the offscreen canvas reference
  fillState.offscreenCanvas = null;
}
