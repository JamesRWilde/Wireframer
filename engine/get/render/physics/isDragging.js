'use strict';


/**
 * isDragging - Is Dragging
 *
 * PURPOSE:
 *   Returns whether whether the user is currently dragging.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/physics/isDragging.js
 */

import { physicsState } from '@engine/state/render/physicsState.js';


/**
 * Returns whether whether the user is currently dragging.
 * @returns {*} The current value from state.
 */
export function isDragging() {
  return physicsState.dragging;
}
