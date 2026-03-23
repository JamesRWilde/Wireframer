/**
 * getIsGpuMode.js - Getter for GPU mode flag
 *
 * PURPOSE:
 *   Returns whether GPU rendering is currently active.
 *
 * ARCHITECTURE ROLE:
 *   Getter module in engine/get/render/.
 *
 * WHY THIS EXISTS:
 *   Provides clear API for runtime routing between GPU and CPU render paths.
 */

"use strict";

// Import GPU mode tracking state from set layer.
import { gpuModeState } from '@engine/set/render/setGpuModeState.js';

/**
 * getIsGpuMode - Returns whether GPU rendering is active
 * @returns {boolean}
 */
export function getIsGpuMode() {
  return gpuModeState.value;
}

export { getIsGpuMode as isGpuMode };
