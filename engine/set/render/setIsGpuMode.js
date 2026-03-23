/**
 * setIsGpuMode.js - Set GPU Mode Flag
 *
 * PURPOSE:
 *   Gets and sets the boolean flag indicating whether GPU (WebGL) rendering
 *   mode is active. This flag is read by the frame loop and toggle logic
 *   to determine which rendering pipeline to use.
 *
 * ARCHITECTURE ROLE:
 *   Central accessor for the GPU mode flag stored in gpuModeState.
 *   Read by the frame loop to select the active renderer, and written
 *   when toggling between GPU and CPU pipelines.
 *
 * WHY THIS EXISTS:
 *   The rendering pipeline needs a single source of truth for which mode
 *   is active. Rather than scattering the flag across multiple modules,
 *   this file encapsulates read/write access in one place.
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

/**
 * isGpuMode - Gets the current GPU mode flag
 * @returns {boolean} true if GPU mode is active
 */
export function isGpuMode() {
  return gpuModeState.value;
}
