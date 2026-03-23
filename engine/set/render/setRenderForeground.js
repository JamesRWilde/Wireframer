/**
 * setRenderForeground.js - Set Active Foreground Render Function
 *
 * PURPOSE:
 *   Stores the foreground render function pointer used by the frame loop.
 *   During initialization, the engine sets this to either the GPU or CPU
 *   rendering path. After that, every frame calls this function pointer
 *   without any mode checking.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the mutable render function reference in renderForegroundState.
 *   The frame loop calls setGetRenderForeground() to retrieve this pointer
 *   and invoke it each frame.
 *
 * WHY THIS EXISTS:
 *   Decouples the frame loop from the specific rendering implementation.
 *   The loop doesn't need to know or check whether it's running GPU or CPU
 *   — it just calls whatever function pointer was set at startup.
 */

"use strict";

// Import the render foreground state container
// Holds the function pointer (fn) that the frame loop invokes each frame
import { renderForegroundState } from '@engine/set/render/setRenderForegroundState.js';

/**
 * setRenderForeground - Sets the foreground render function pointer
 * @param {Function} fn - The render function to call each frame.
 *   Should accept (meshToRender, backgroundOnSeparateCanvas, morphing).
 */
export function setRenderForeground(fn) {
  renderForegroundState.fn = fn;
}
