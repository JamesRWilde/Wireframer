'use strict';


/**
 * getAutoWz - Get Auto Wz
 *
 * PURPOSE:
 *   Returns auto-rotation target z angular velocity.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getAutoWz.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns auto-rotation target z angular velocity.
 * @returns {*} The current value from state.
 */
export function getAutoWz() {
  return physicsState.AUTO_WZ;
}
