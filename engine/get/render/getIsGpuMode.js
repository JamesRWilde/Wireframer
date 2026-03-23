/**
 * getIsGpuMode.js - Getter for GPU mode flag
 *
 * PURPOSE:
 *   Returns whether GPU rendering is currently active.
 *
 * ARCHITECTURE ROLE:
 *   Getter module in engine/get/render/.
 */

"use strict";

import { gpuModeState } from '@engine/set/render/gpuModeState.js';

/**
 * getIsGpuMode - Returns whether GPU rendering is active
 * @returns {boolean}
 */
export function getIsGpuMode() {
  return gpuModeState.value;
}
