/**
 * workerTransform.js - Vertex Transform Worker Initialization
 *
 * PURPOSE:
 *   Creates and initializes a Web Worker for offloading vertex transform
 *   (rotation + projection) computations. The worker rotates vertices and
 *   projects them to 2D screen coordinates, returning cached results.
 *
 * ARCHITECTURE ROLE:
 *   Called by workerSend when the transform worker hasn't been created yet.
 *   Moves expensive per-frame vertex math off the main thread.
 *
 * SIDE EFFECTS:
 *   - Mutates vertexTransformState (worker, workerAvailable, cachedResult, etc.)
 */

"use strict";

// Import shared transform state to track worker lifecycle
import { vertexTransformState } from "@engine/state/render/vertexTransformBridge.js";

/**
 * workerTransform - Creates and initializes the vertex transform worker
 *
 * @returns {boolean} Whether the worker was successfully created
 */
export function workerTransform() {
  // Return early if worker already exists
  if (vertexTransformState.worker) return true;

  try {
    // Instantiate the vertex transform worker from its module URL
    vertexTransformState.worker = new Worker(
      new URL('../../state/gpu/vertexTransformWorker.js', import.meta.url).href,
      { type: 'module' }
    );
    vertexTransformState.workerAvailable = true;

    // Handle messages from the transform worker
    vertexTransformState.worker.onmessage = (event) => {
      const { type, T, P2, frameId, message } = event.data;
      if (type === 'transformed') {
        // Cache the transformed vertex data for the current frame
        vertexTransformState.cachedResult = { T, P2 };
        vertexTransformState.cachedFrameId = frameId;
      } else if (type === 'error') {
        // Log worker errors with throttling to avoid console spam
        if (vertexTransformState.errorCount < vertexTransformState.MAX_ERROR_LOGS) {
          console.warn('[vertexTransformBridge] Worker error:', message);
          vertexTransformState.errorCount++;
        }
      }
    };

    // Handle fatal worker errors (e.g., script crash)
    vertexTransformState.worker.onerror = (error) => {
      if (vertexTransformState.errorCount < vertexTransformState.MAX_ERROR_LOGS) {
        console.warn('[vertexTransformBridge] Worker error:', error.message);
        vertexTransformState.errorCount++;
      }
    };

    return true;
  } catch (error) {
    console.warn('[vertexTransformBridge] Worker creation failed:', error.message);
    vertexTransformState.workerAvailable = false;
    return false;
  }
}
