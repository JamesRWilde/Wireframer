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
 *   import { setRenderForeground } from '@engine/set/render/setRenderForeground.js';
 *   setRenderForeground(gpuPath);
 */

"use strict";

let _renderForeground = null;

export function setRenderForeground(fn) {
  _renderForeground = fn;
}
