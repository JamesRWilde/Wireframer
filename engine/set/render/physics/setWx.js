'use strict';


/**
 * setWx - Set Wx
 *
 * PURPOSE:
 *   Sets x-axis angular velocity (rotation speed around x).
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setWx.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets x-axis angular velocity (rotation speed around x).
 * @param {*} value - The value to set.
 */
export function setWx(value) {
  physicsState.wx = value;
}
