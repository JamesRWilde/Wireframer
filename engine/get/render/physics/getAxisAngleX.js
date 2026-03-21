'use strict';


/**
 * getAxisAngleX - Get Axis Angle X
 *
 * PURPOSE:
 *   Returns axis-angle x component.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/getAxisAngleX.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns axis-angle x component.
 * @returns {*} The current value from state.
 */
export function getAxisAngleX() {
  return physicsState.axisAngleX;
}
