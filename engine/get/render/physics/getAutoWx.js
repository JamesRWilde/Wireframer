'use strict';


/**
 * getAutoWx - Get Auto Wx
 *
 * PURPOSE:
 *   Returns auto-rotation target x angular velocity.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getAutoWx.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns auto-rotation target x angular velocity.
 * @returns {*} The current value from state.
 */
export function getAutoWx() {
  return physicsState.AUTO_WX;
}
