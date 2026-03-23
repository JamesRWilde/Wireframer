/**
 * workerTerminate.js - Vertex Transform Worker Termination
 *
 * PURPOSE:
 *   Terminates the vertex transform worker and cleans up its state.
 *   Releases the worker thread and resets availability flags.
 *
 * ARCHITECTURE ROLE:
 *   Called during engine shutdown or when switching render modes to
 *   release the transform worker thread resources.
 *
 * WHY THIS EXISTS:
 *   Houses worker shutdown behavior in a single file to avoid duplicated
 *   cleanup logic across renderer state changes.
 */

"use strict";

// Import shared transform state to access and clean up worker resources
import { vertexTransformWorkerState } from "@engine/state/render/stateVertexTransformWorkerState.js";

/**
 * workerTerminate - Terminates the vertex transform worker
 *
 * @returns {void}
 */
export function disposeWorker() {
  if (vertexTransformWorkerState.worker) {
    vertexTransformWorkerState.worker.terminate();
    vertexTransformWorkerState.worker = null;
    vertexTransformWorkerState.workerAvailable = false;
  }
}
