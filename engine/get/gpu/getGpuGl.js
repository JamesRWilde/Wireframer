"use strict";

/**
 * getGpuGl - Get Gpu Gl
 *
 * PURPOSE:
 *   Returns webgl rendering context.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/gpu/getGpuGl.js
 *
 * WHY THIS EXISTS:
 *   Provides a single entrypoint for WebGL context reads to avoid
 *   duplicate state references and to simplify context recreation handling.
 */

// Import global GPU GL state container
import { glState } from '@engine/state/gpu/stateGlState.js';

/**
 * Returns webgl rendering context.
 * @returns {*} The current value from state.
 */
export function getGpuGl() {
  return glState.gpuGl;
}
