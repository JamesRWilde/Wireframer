'use strict';


/**
 * setLastPointerY - Set Last Pointer Y
 *
 * PURPOSE:
 *   Sets last recorded pointer y position.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setLastPointerY.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets last recorded pointer y position.
 * @param {*} value - The value to set.
 */
export function setLastPointerY(value) {
  physicsState.lastPointerY = value;
}
