'use strict';


/**
 * setAxisAngleX - Set Axis Angle X
 *
 * PURPOSE:
 *   Sets axis-angle x component for rotation.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setAxisAngleX.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets axis-angle x component for rotation.
 * @param {*} value - The value to set.
 */
export function setAxisAngleX(value) {
  physicsState.axisAngleX = value;
}
