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
 */

"use strict";

// Import shared transform state to access and clean up worker resources
import { transformState } from "@engine/state/render/vertexTransformBridge.js";

/**
 * workerTerminate - Terminates the vertex transform worker
 *
 * @returns {void}
 */
export function workerTerminate() {
  if (transformState.worker) {
    transformState.worker.terminate();
    transformState.worker = null;
    transformState.workerAvailable = false;
  }
}
