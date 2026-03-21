'use strict';


/**
 * setAutoWx - Set Auto Wx
 *
 * PURPOSE:
 *   Sets auto-rotation target angular velocity around x.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setAutoWx.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets auto-rotation target angular velocity around x.
 * @param {*} value - The value to set.
 */
export function setAutoWx(value) {
  physicsState.AUTO_WX = value;
}
