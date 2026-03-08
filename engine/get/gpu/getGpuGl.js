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
 */

import { glState } from '@engine/state/gpu/glState.js';

/**
 * Returns webgl rendering context.
 * @returns {*} The current value from state.
 */
export function getGpuGl() {
  return glState.gpuGl;
}
