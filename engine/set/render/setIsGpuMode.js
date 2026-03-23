/**
 * setIsGpuMode.js - Set GPU Mode Flag
 *
 * PURPOSE:
 *   Sets the boolean flag indicating whether GPU (WebGL) rendering mode is active.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the GPU mode flag stored in gpuModeState. Written when toggling
 *   between GPU and CPU pipelines. For reads, use getIsGpuMode.js.
 *
 * WHY THIS EXISTS:
 *   The rendering pipeline needs a single source of truth for which mode
 *   is active. This file encapsulates the write access. Reads are handled
 *   by getIsGpuMode.js to maintain single-function-per-file discipline.
 */

"use strict";

// Import the GPU mode state container
// Holds the boolean flag indicating whether GPU rendering is active
import { gpuModeState } from '@engine/set/render/setGpuModeState.js';

/**
 * setIsGpuMode - Sets the GPU mode flag
 * @param {boolean} value - true for GPU mode, false for CPU mode
 */
export function setIsGpuMode(value) {
  gpuModeState.value = value;
}
