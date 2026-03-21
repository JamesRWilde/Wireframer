'use strict';


/**
 * setWz - Set Wz
 *
 * PURPOSE:
 *   Sets z-axis angular velocity (rotation speed around z).
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setWz.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets z-axis angular velocity (rotation speed around z).
 * @param {*} value - The value to set.
 */
export function setWz(value) {
  physicsState.wz = value;
}
