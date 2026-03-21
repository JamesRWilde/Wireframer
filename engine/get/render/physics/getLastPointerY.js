'use strict';


/**
 * getLastPointerY - Get Last Pointer Y
 *
 * PURPOSE:
 *   Returns last recorded pointer y position.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getLastPointerY.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns last recorded pointer y position.
 * @returns {*} The current value from state.
 */
export function getLastPointerY() {
  return physicsState.lastPointerY;
}
