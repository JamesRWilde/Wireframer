'use strict';

/**
 * setZHalf - Set Z Half
 *
 * PURPOSE:
 *   Sets half-depth value for z-buffer projection.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setZHalf.js
 */

import { viewportState } from '@engine/state/render/viewportState.js';


/**
 * Sets half-depth value for z-buffer projection.
 * @param {*} v - The value to set.
 */
export function setZHalf(v) {
  viewportState.Z_HALF = v;
}
