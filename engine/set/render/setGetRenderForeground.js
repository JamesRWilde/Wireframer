/**
 * setGetRenderForeground.js - Get Active Foreground Render Function
 *
 * PURPOSE:
 *   Returns the current foreground render function pointer (either GPU or CPU path).
 *   The frame loop calls this each frame to get the active renderer and invoke it.
 *
 * ARCHITECTURE ROLE:
 *   Getter for the mutable render function reference in renderForegroundState.
 *   Paired with setRenderForeground, which sets the pointer during initialization.
 *
 * WHY THIS EXISTS:
 *   Provides a clean access point for the frame loop to retrieve the active
 *   renderer without directly accessing the state object. This maintains the
 *   setter/getter encapsulation pattern used throughout the codebase.
 */

"use strict";

// Import the render foreground state container
// Holds the function pointer (fn) that the frame loop invokes each frame
import { renderForegroundState } from '@engine/set/render/setRenderForegroundState.js';

/**
 * setGetRenderForeground - Returns the active foreground render function
 * @returns {Function} The render function (gpuPath or cpuPath) set during initialization
 */
export function setGetRenderForeground() {
  return renderForegroundState.fn;
}
