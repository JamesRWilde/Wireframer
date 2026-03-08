'use strict';

/**
 * getW - Get W
 *
 * PURPOSE:
 *   Returns viewport width in css pixels.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getW.js
 */

import { viewportState } from '@engine/state/render/viewportState.js';


/**
 * Returns viewport width in css pixels.
 * @returns {*} The current value from state.
 */
export function getW() {
  return viewportState.W;
}
