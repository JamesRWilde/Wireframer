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

import { renderForegroundState } from '@engine/set/render/renderForegroundState.js';

export function getRenderForeground() {
  return renderForegroundState.fn;
}
