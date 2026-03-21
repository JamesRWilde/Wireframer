'use strict';


/**
 * setWy - Set Wy
 *
 * PURPOSE:
 *   Sets y-axis angular velocity (rotation speed around y).
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setWy.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets y-axis angular velocity (rotation speed around y).
 * @param {*} value - The value to set.
 */
export function setWy(value) {
  physicsState.wy = value;
}
