'use strict';


/**
 * setRotation - Set Rotation
 *
 * PURPOSE:
 *   Sets 4x4 rotation matrix.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setRotation.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets 4x4 rotation matrix.
 * @param {*} value - The value to set.
 */
export function setRotation(value) {
  physicsState.R = value;
}
