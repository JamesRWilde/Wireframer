/**
 * vertexTransformBridge.js - Vertex Transform Worker State
 *
 * PURPOSE:
 *   Holds the shared mutable state for the vertex transform Web Worker,
 *   including the worker instance, cached transform results, and error
 *   tracking counters.
 *
 * ARCHITECTURE ROLE:
 *   Central state module for the vertex transform pipeline. Read and
 *   written by workerTransform.js (init), workerSend.js (post),
 *   cachedTransformResult.js (read), and getIsAvailable.js (read).
 *
 * WHY THIS EXISTS:
 *   Ensures a recognizable header format and clarifies this module's state
 *   role in the worker pipeline.
 *
 * DETAILS:
 *   Uses a mutable object so importing modules can assign properties
 *   directly without creating new objects.
 */

"use strict";

/**
 * vertexTransformState - Mutable state for the vertex transform worker
 * @property {Worker|null} worker - The vertex transform Web Worker instance
 * @property {boolean} workerAvailable - Whether a worker was successfully created
 * @property {number} pendingFrameId - Frame ID of the most recently sent transform request
 * @property {Object|null} cachedResult - Latest transformed result { T: Float32Array, P2: Float32Array }
 * @property {number} cachedFrameId - Frame ID of the cached result
 * @property {number} errorCount - Number of errors encountered (for throttling logs)
 */
export const vertexTransformState = {
  worker: null,
  workerAvailable: false,
  pendingFrameId: -1,
  cachedResult: null,
  cachedFrameId: -1,
  errorCount: 0,
};

/** Maximum number of error logs to emit before suppressing further warnings */
export const MAX_ERROR_LOGS = 3;
