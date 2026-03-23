/**
 * isAvailable.js - Transform Worker Availability Check
 *
 * PURPOSE:
 *   Checks whether the vertex transform worker has been created
 *   and is available for use.
 *
 * ARCHITECTURE ROLE:
 *   Called by render modules to decide whether to use the async
 *   worker path or fall back to synchronous vertex transforms.
 */

"use strict";

// Import shared transform state to check worker availability
import { vertexTransformState } from "@engine/state/render/vertexTransformBridge.js";

/**
 * isAvailable - Checks if the transform worker is available
 *
 * @returns {boolean} True if the worker was successfully created
 */
export function isAvailable() {
  return vertexTransformState.workerAvailable;
}
