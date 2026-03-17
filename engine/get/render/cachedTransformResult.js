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
 */

"use strict";

// Import shared transform state to access cached results
import { transformState } from "@engine/state/render/vertexTransformBridge.js";

/**
 * cachedTransformResult - Returns a copy of the cached transform result
 *
 * @returns {{ T: Float32Array, P2: Float32Array, frameId: number }|null}
 *   Cached transform result with frame ID, or null if no result is cached
 */
export function cachedTransformResult() {
  return transformState.cachedResult ? { ...transformState.cachedResult, frameId: transformState.cachedFrameId } : null;
}
