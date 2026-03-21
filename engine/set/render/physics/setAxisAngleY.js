'use strict';


/**
 * setAxisAngleY - Set Axis Angle Y
 *
 * PURPOSE:
 *   Sets axis-angle y component for rotation.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setAxisAngleY.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets axis-angle y component for rotation.
 * @param {*} value - The value to set.
 */
export function setAxisAngleY(value) {
  physicsState.axisAngleY = value;
}
