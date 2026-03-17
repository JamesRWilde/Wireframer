/**
 * vertexTransformBridge.js - Bridge to Vertex Transform Worker
 * 
 * PURPOSE:
 *   Manages the vertex transform Web Worker lifecycle and implements
 *   double-buffering for zero-latency vertex transformation. Allows the
 *   main thread to send current frame data while receiving previous frame's
 *   transformed results.
 * 
 * ARCHITECTURE ROLE:
 *   Sits between getModelFrameData.js and vertex-transform-worker.js.
 *   Provides a synchronous-looking API that returns cached results from
 *   the previous frame while the current frame is being computed in the
 *   worker.
 * 
 * DOUBLE-BUFFERING STRATEGY:
 *   Frame N:   Send frame N data to worker → Receive frame N-1 results
 *   Frame N+1: Send frame N+1 data → Receive frame N results
 *   This means each frame uses results computed during the previous frame,
 *   introducing one frame of latency (~16ms) but keeping the main thread free.
 * 
 * FALLBACK:
 *   If worker creation fails or is unsupported, falls back to synchronous
 *   transformation on the main thread.
 */

"use strict";

// Worker instance (created lazily)
let worker = null;

// Worker availability flag
let workerAvailable = false;

// Pending frame data waiting for worker response
let pendingFrameId = -1;

// Cached results from last completed worker computation
let cachedResult = null;

// Cached result frame ID
let cachedFrameId = -1;

// Error count for throttling error messages
let errorCount = 0;
const MAX_ERROR_LOGS = 3;

/**
 * initWorker - Creates the vertex transform worker
 * 
 * @returns {boolean} True if worker was created successfully
 */
function initWorker() {
  if (worker) return true;

  try {
    worker = new Worker(
      new URL('../../../../workers/vertex-transform-worker.js', import.meta.url).href,
      { type: 'module' }
    );
    workerAvailable = true;

    worker.onmessage = (event) => {
      const { type, T, P2, frameId, message } = event.data;

      if (type === 'transformed') {
        // Store results for main thread to pick up next frame
        cachedResult = { T, P2 };
        cachedFrameId = frameId;
      } else if (type === 'error') {
        if (errorCount < MAX_ERROR_LOGS) {
          console.warn('[vertexTransformBridge] Worker error:', message);
          errorCount++;
        }
      }
    };

    worker.onerror = (error) => {
      if (errorCount < MAX_ERROR_LOGS) {
        console.warn('[vertexTransformBridge] Worker error:', error.message);
        errorCount++;
      }
      // Don't disable worker on single errors - it may recover
    };

    return true;
  } catch (error) {
    console.warn('[vertexTransformBridge] Worker creation failed:', error.message);
    workerAvailable = false;
    return false;
  }
}

/**
 * sendToWorker - Sends vertex data to worker for transformation
 * 
 * @param {Float32Array} vertices - Flat vertex array
 * @param {Float32Array} rotation - Rotation matrix
 * @param {number} fov - Field of view scale
 * @param {number} halfW - Half canvas width
 * @param {number} halfH - Half canvas height
 * @param {number} modelCy - Model center Y offset
 * @param {number} frameId - Current frame ID
 */
export function sendToWorker(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  if (!workerAvailable && !initWorker()) return;

  pendingFrameId = frameId;

  worker.postMessage({
    type: 'transform',
    vertices,
    rotation,
    fov,
    halfW,
    halfH,
    modelCy,
    frameId
  });
}

/**
 * getCachedResult - Gets the last completed transformation result
 * 
 * @returns {{ T: Float32Array, P2: Float32Array, frameId: number } | null}
 *   Cached result from previous frame, or null if not available
 */
export function getCachedResult() {
  return cachedResult ? { ...cachedResult, frameId: cachedFrameId } : null;
}

/**
 * isWorkerAvailable - Checks if the worker is available
 * 
 * @returns {boolean} True if worker is available
 */
export function isWorkerAvailable() {
  return workerAvailable;
}

/**
 * terminateWorker - Terminates the worker (for cleanup)
 */
export function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    workerAvailable = false;
  }
}
