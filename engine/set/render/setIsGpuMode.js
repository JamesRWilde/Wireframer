/**
 * setIsGpuMode.js - Set GPU Mode Flag
 *
 * PURPOSE:
 *   Sets whether GPU rendering mode is active.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the GPU mode flag.
 *
 * USAGE:
 *   import { setIsGpuMode } from '@engine/set/render/setIsGpuMode.js';
 *   setIsGpuMode(true);
 */

"use strict";

import { gpuModeState } from '@engine/set/render/setGpuModeState.js';

export function setIsGpuMode(value) {
  gpuModeState.value = value;
}

export function isGpuMode() {
  return gpuModeState.value;
}
