'use strict';


/**
 * getAxisAngleY - Get Axis Angle Y
 *
 * PURPOSE:
 *   Returns axis-angle y component.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getAxisAngleY.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns axis-angle y component.
 * @returns {*} The current value from state.
 */
export function getAxisAngleY() {
  return physicsState.axisAngleY;
}
