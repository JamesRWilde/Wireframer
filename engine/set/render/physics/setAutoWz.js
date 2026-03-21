'use strict';


/**
 * setAutoWz - Set Auto Wz
 *
 * PURPOSE:
 *   Sets auto-rotation target angular velocity around z.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setAutoWz.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets auto-rotation target angular velocity around z.
 * @param {*} value - The value to set.
 */
export function setAutoWz(value) {
  physicsState.AUTO_WZ = value;
}
