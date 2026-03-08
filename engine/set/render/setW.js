'use strict';

/**
 * setW - Set W
 *
 * PURPOSE:
 *   Sets viewport width in css pixels.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setW.js
 */

import { viewportState } from '@engine/state/render/viewportState.js';


/**
 * Sets viewport width in css pixels.
 * @param {*} v - The value to set.
 */
export function setW(v) {
  viewportState.W = v;
}
