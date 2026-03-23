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
 *   - Mutates vertexTransformWorkerState (worker, workerAvailable, cachedResult, etc.)
 *
 * WHY THIS EXISTS:
 *   Defines worker startup and events for vertex transform offloading,
 *   enabling responsive rendering in complex scenes.
 */

"use strict";

// Import shared transform state to track worker lifecycle
import { vertexTransformWorkerState } from "@engine/state/render/stateVertexTransformWorkerState.js";

/**
 * workerTransform - Creates and initializes the vertex transform worker
 *
 * @returns {boolean} Whether the worker was successfully created
 */
export function initWorkerTransform() {
  // Return early if worker already exists
  if (vertexTransformWorkerState.worker) return true;

  try {
    // Instantiate the vertex transform worker from its module URL
    vertexTransformWorkerState.worker = new Worker(
      new URL('../../state/gpu/stateVertexTransformWorker.js', import.meta.url).href,
      { type: 'module' }
    );
    vertexTransformWorkerState.workerAvailable = true;

    // Handle messages from the transform worker
    vertexTransformWorkerState.worker.onmessage = (event) => {
      const { type, T, P2, frameId, message } = event.data;
      if (type === 'transformed') {
        // Cache the transformed vertex data for the current frame
        vertexTransformWorkerState.cachedResult = { T, P2 };
        vertexTransformWorkerState.cachedFrameId = frameId;
      } else if (type === 'error') {
        // Log worker errors with throttling to avoid console spam
        if (vertexTransformWorkerState.errorCount < vertexTransformWorkerState.MAX_ERROR_LOGS) {
          console.warn('[vertexTransformBridge] Worker error:', message);
          vertexTransformWorkerState.errorCount++;
        }
      }
    };

    // Handle fatal worker errors (e.g., script crash)
    vertexTransformWorkerState.worker.onerror = (error) => {
      if (vertexTransformWorkerState.errorCount < vertexTransformWorkerState.MAX_ERROR_LOGS) {
        console.warn('[vertexTransformBridge] Worker error:', error.message);
        vertexTransformWorkerState.errorCount++;
      }
    };

    return true;
  } catch (error) {
    console.warn('[vertexTransformBridge] Worker creation failed:', error.message);
    vertexTransformWorkerState.workerAvailable = false;
    return false;
  }
}
