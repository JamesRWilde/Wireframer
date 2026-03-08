/**
 * fillCachedFrame.js - Cached Fill Frame Getter
 *
 * PURPOSE:
 *   Returns the most recently rendered fill frame (ImageBitmap) from
 *   the fill worker, along with its associated frame ID for
 *   synchronization with the render loop.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawSolidFillModel to retrieve the worker-rendered frame
 *   for compositing onto the fill layer canvas. Returns null if no
 *   cached frame is available.
 */

"use strict";

// Import shared fill state to access the cached frame
import { fillState } from "@engine/state/fillRenderBridge.js";

/**
 * fillCachedFrame - Returns the cached fill render frame
 *
 * @returns {{ imageBitmap: ImageBitmap, frameId: number }|null}
 *   The cached frame with its frame ID, or null if no frame is available
 */
export function fillCachedFrame() {
  return fillState.cachedImageBitmap ? { imageBitmap: fillState.cachedImageBitmap, frameId: fillState.cachedFrameId } : null;
}
