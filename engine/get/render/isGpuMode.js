/**
 * isGpuMode.js - Getter for GPU mode flag
 *
 * PURPOSE:
 *   Returns whether GPU rendering is currently active.
 *
 * ARCHITECTURE ROLE:
 *   Getter module in engine/get/render/.
 */

"use strict";

import { renderForegroundState } from '@engine/state/render/renderForegroundState.js';

/**
 * isGpuMode - Returns whether GPU rendering is active
 * @returns {boolean}
 */
export function isGpuMode() {
  return renderForegroundState._isGpuMode;
}
