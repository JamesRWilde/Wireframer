'use strict';

/**
 * setWireOpacity - Set Wire Opacity
 *
 * PURPOSE:
 *   Sets wireframe line opacity (0-1).
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setWireOpacity.js
 */

import { renderState } from '@engine/state/render/renderState.js';


/**
 * Sets wireframe line opacity (0-1).
 * @param {*} v - The value to set.
 */
export function setWireOpacity(v) {
  renderState.wireOpacity = v;
}
