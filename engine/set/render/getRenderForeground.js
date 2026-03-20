/**
 * getRenderForeground.js - Get Active Foreground Render Function
 *
 * PURPOSE:
 *   Returns the current foreground render function pointer (either GPU or CPU path).
 *
 * ARCHITECTURE ROLE:
 *   Getter for the mutable render function reference managed by renderForeground module.
 *
 * USAGE:
 *   import { getRenderForeground } from '@engine/set/render/getRenderForeground.js';
 *   const renderFn = getRenderForeground();
 */

"use strict";

let _renderForeground = null;

export function getRenderForeground() {
  return _renderForeground;
}
