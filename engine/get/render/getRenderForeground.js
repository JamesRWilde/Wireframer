/**
 * getRenderForeground.js - Getter for foreground render function
 *
 * PURPOSE:
 *   Returns the currently active foreground render function.
 *
 * ARCHITECTURE ROLE:
 *   Getter module in engine/get/render/. Imports state directly
 *   and returns the function pointer.
 *
 * USAGE:
 *   import { getRenderForeground } from '@engine/get/render/getRenderForeground.js';
 *   const renderFn = getRenderForeground();
 */

"use strict";

import { renderForegroundState } from '@engine/state/render/stateRenderForegroundState.js';

/**
 * getRenderForeground - Returns the current foreground render function
 * @returns {function|null} The active render function
 */
export function getRenderForeground() {
  return renderForegroundState._renderForeground;
}
