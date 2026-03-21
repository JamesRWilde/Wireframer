'use strict';


/**
 * setLastPointerX - Set Last Pointer X
 *
 * PURPOSE:
 *   Sets last recorded pointer x position.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setLastPointerX.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets last recorded pointer x position.
 * @param {*} value - The value to set.
 */
export function setLastPointerX(value) {
  physicsState.lastPointerX = value;
}
