'use strict';


/**
 * setAutoWy - Set Auto Wy
 *
 * PURPOSE:
 *   Sets auto-rotation target angular velocity around y.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setAutoWy.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets auto-rotation target angular velocity around y.
 * @param {*} value - The value to set.
 */
export function setAutoWy(value) {
  physicsState.AUTO_WY = value;
}
