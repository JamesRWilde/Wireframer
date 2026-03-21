'use strict';


/**
 * getRotation - Get Rotation
 *
 * PURPOSE:
 *   Returns 4x4 rotation matrix.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getRotation.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns 4x4 rotation matrix.
 * @returns {*} The current value from state.
 */
export function getRotation() {
  return physicsState.R;
}
