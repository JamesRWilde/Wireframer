'use strict';


/**
 * getWz - Get Wz
 *
 * PURPOSE:
 *   Returns z-axis angular velocity.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getWz.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns z-axis angular velocity.
 * @returns {*} The current value from state.
 */
export function getWz() {
  return physicsState.wz;
}
