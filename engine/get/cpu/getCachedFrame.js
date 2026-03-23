/**
 * getCachedFrame.js - Cached Fill Frame Getter
 *
 * PURPOSE:
 *   Returns the most recently rendered fill frame (ImageBitmap) from
 *   the fill worker, along with its associated frame ID for
 *   synchronization with the render loop.
 *
 * ARCHITECTURE ROLE:
 *   Called by setDrawSolidFillModel to retrieve the worker-rendered frame
 *   for compositing onto the fill layer canvas. Returns null if no
 *   cached frame is available.
 *
 * WHY THIS EXISTS:
 *   Encapsulates worker fill frame retrieval to keep render orchestration
 *   logic consistent and prevent in-place state mutations.
 */

"use strict";

// Import shared fill state to access the cached frame
import { fillRenderState } from "@engine/state/stateFillRenderBridge.js";

/**
 * fillCachedFrame - Returns the cached fill render frame
 *
 * @returns {{ imageBitmap: ImageBitmap, frameId: number }|null}
 *   The cached frame with its frame ID, or null if no frame is available
 */
export function getCachedFrame() {
  return fillRenderState.cachedImageBitmap ? { imageBitmap: fillRenderState.cachedImageBitmap, frameId: fillRenderState.cachedFrameId } : null;
}
