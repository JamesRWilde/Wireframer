"use strict";

/**
 * setGpuGl - Set Gpu Gl
 *
 * PURPOSE:
 *   Sets webgl rendering context for gpu operations.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/gpu/setGpuGl.js
 */

import { glState } from '@engine/state/gpu/glState.js';

/**
 * Sets webgl rendering context for gpu operations.
 * @param {*} gl - The value to set.
 */
export function setGpuGl(gl) {
  glState.gpuGl = gl;
}
