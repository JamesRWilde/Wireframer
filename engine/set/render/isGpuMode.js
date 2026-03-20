/**
 * isGpuMode.js - Check GPU Mode Active
 *
 * PURPOSE:
 *   Returns whether GPU rendering mode is currently active.
 *
 * ARCHITECTURE ROLE:
 *   Getter for the GPU mode flag.
 *
 * USAGE:
 *   import { isGpuMode } from '@engine/set/render/isGpuMode.js';
 *   if (isGpuMode()) { ... }
 */

"use strict";

import { gpuModeState } from '@engine/set/render/gpuModeState.js';

export function isGpuMode() {
  return gpuModeState.value;
}
