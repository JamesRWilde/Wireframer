'use strict';


/**
 * getWy - Get Wy
 *
 * PURPOSE:
 *   Returns y-axis angular velocity.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getWy.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns y-axis angular velocity.
 * @returns {*} The current value from state.
 */
export function getWy() {
  return physicsState.wy;
}
