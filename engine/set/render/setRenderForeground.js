/**
 * setRenderForeground.js - Set Active Foreground Render Function
 *
 * PURPOSE:
 *   Sets the foreground render function pointer to the specified function.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the mutable render function reference.
 *
 * USAGE:
 *   import { setRenderForeground } from '@engine/render/setRenderForeground.js';
 *   setRenderForeground(gpuPath);
 */

"use strict";

import { renderForegroundState } from '@engine/set/render/renderForegroundState.js';

export function setRenderForeground(fn) {
  renderForegroundState.fn = fn;
}
