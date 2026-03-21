'use strict';


/**
 * setDragging - Set Dragging
 *
 * PURPOSE:
 *   Sets whether the user is currently dragging.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/physics/setDragging.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Sets whether the user is currently dragging.
 * @param {*} value - The value to set.
 */
export function setDragging(value) {
  physicsState.dragging = value;
}
