'use strict';

/**
 * getZHalf - Get Z Half
 *
 * PURPOSE:
 *   Returns half-depth value for z-buffer.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getZHalf.js
 */

import { viewportState } from '@engine/state/render/viewportState.js';


/**
 * Returns half-depth value for z-buffer.
 * @returns {*} The current value from state.
 */
export function getZHalf() {
  return viewportState.Z_HALF;
}
