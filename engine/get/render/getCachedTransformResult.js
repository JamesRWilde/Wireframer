/**
 * cachedTransformResult.js - Cached Transform Result Getter
 *
 * PURPOSE:
 *   Returns the most recently computed vertex transform result from the
 *   transform worker, along with its frame ID for synchronization.
 *   Returns a shallow copy to prevent mutation of the cached data.
 *
 * ARCHITECTURE ROLE:
 *   Called by frameData.js to check if a worker-computed transform
 *   is available for the current frame. If not available, falls back
 *   to synchronous transform.
 *
 * WHY THIS EXISTS:
 *   Exposes a safe read-only snapshot of transform worker output to avoid
 *   sharing mutable objects between threads and render frame consumers.
 */

"use strict";

// Import shared transform state to access cached results
// Tracks latest worker transform output and associated frameId.
import { vertexTransformWorkerState } from "@engine/state/render/stateVertexTransformWorkerState.js";

/**
 * cachedTransformResult - Returns a copy of the cached transform result
 *
 * @returns {{ T: Float32Array, P2: Float32Array, frameId: number }|null}
 *   Cached transform result with frame ID, or null if no result is cached
 */
export function getCachedTransformResult() {
  // Return snapshot copy since the underlying state object may be mutated in-place.
  return vertexTransformWorkerState.cachedResult
    ? { ...vertexTransformWorkerState.cachedResult, frameId: vertexTransformWorkerState.cachedFrameId }
    : null;
}
