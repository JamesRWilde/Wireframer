'use strict';


/**
 * getAutoWy - Get Auto Wy
 *
 * PURPOSE:
 *   Returns auto-rotation target y angular velocity.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getAutoWy.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns auto-rotation target y angular velocity.
 * @returns {*} The current value from state.
 */
export function getAutoWy() {
  return physicsState.AUTO_WY;
}
