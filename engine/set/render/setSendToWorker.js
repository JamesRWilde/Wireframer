/**
 * workerSend.js - Vertex Transform Worker Command Sender
 *
 * PURPOSE:
 *   Sends a vertex transform request to the background worker thread.
 *   The worker rotates and projects vertices, returning cached results
 *   for use by the main render loop.
 *
 * ARCHITECTURE ROLE:
 *   Called by frameData.js each frame to offload vertex math. Lazily
 *   initializes the transform worker if it hasn't been created yet.
 *
 * DETAILS:
 *   The message includes the flat vertex array (Float32Array), rotation
 *   matrix, field of view, and canvas dimensions for the projection.
 */

"use strict";

// Import shared transform state to track worker availability
import { vertexTransformState } from "@engine/state/render/vertexTransformBridge.js";

// Import worker initialization for lazy setup
import { initWorkerTransform } from '@engine/init/render/initWorkerTransform.js';

/**
 * workerSend - Sends a vertex transform command to the worker
 *
 * @param {Float32Array} vertices - Flattened vertex array (x,y,z packed sequentially)
 * @param {Float32Array} rotation - 3x3 rotation matrix as Float32Array
 * @param {number} fov - Field of view for perspective projection
 * @param {number} halfW - Half canvas width for screen-space centering
 * @param {number} halfH - Half canvas height for screen-space centering
 * @param {number} modelCy - Model Y center offset
 * @param {number} frameId - Current frame ID for synchronization
 * @returns {void}
 */
export function setSendToWorker(vertices, rotation, fov, halfW, halfH, modelCy, frameId) {
  // Lazily initialize the transform worker if not yet available
  if (!vertexTransformState.workerAvailable && !initWorkerTransform()) return;

  // Track the pending frame ID for result matching
  vertexTransformState.pendingFrameId = frameId;

  // Post the transform command to the worker
  vertexTransformState.worker.postMessage({
    type: 'transform',
    vertices, rotation, fov, halfW, halfH, modelCy, frameId
  });
}
