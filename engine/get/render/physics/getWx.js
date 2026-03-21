'use strict';


/**
 * getWx - Get Wx
 *
 * PURPOSE:
 *   Returns x-axis angular velocity.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getWx.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns x-axis angular velocity.
 * @returns {*} The current value from state.
 */
export function getWx() {
  return physicsState.wx;
}
