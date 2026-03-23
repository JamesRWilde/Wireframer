/**
 * setGetRenderForeground.js - Get Active Foreground Render Function
 *
 * PURPOSE:
 *   Returns the current foreground render function pointer (either GPU or CPU path).
 *
 * ARCHITECTURE ROLE:
 *   Getter for the mutable render function reference managed by renderForeground module.
 *
 * USAGE:
 *   import { setGetRenderForeground } from '@engine/set/render/setGetRenderForeground.js';
 *   const renderFn = setGetRenderForeground();
 */

"use strict";

import { renderForegroundState } from '@engine/set/render/setRenderForegroundState.js';

export function setGetRenderForeground() {
  return renderForegroundState.fn;
}
