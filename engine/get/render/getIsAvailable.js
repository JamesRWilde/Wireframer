/**
 * getIsAvailable.js - Transform Worker Availability Check
 *
 * PURPOSE:
 *   Checks whether the vertex transform worker has been created
 *   and is available for use.
 *
 * ARCHITECTURE ROLE:
 *   Called by render modules to decide whether to use the async
 *   worker path or fall back to synchronous vertex transforms.
 *
 * WHY THIS EXISTS:
 *   Keep worker availability checks in one place to reduce repeated state
 *   inspection logic and to simplify transition to different worker strategies.
 */

"use strict";

// Import shared transform state to check worker availability
import { vertexTransformWorkerState } from "@engine/state/render/stateVertexTransformWorkerState.js";

/**
 * getIsAvailable - Checks if the transform worker is available
 *
 * @returns {boolean} True if the worker was successfully created
 */
export function getIsAvailable() {
  return vertexTransformWorkerState.workerAvailable;
}
