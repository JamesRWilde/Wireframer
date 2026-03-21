'use strict';


/**
 * getLastPointerX - Get Last Pointer X
 *
 * PURPOSE:
 *   Returns last recorded pointer x position.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getLastPointerX.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns last recorded pointer x position.
 * @returns {*} The current value from state.
 */
export function getLastPointerX() {
  return physicsState.lastPointerX;
}
