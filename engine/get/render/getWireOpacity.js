'use strict';

/**
 * getWireOpacity - Get Wire Opacity
 *
 * PURPOSE:
 *   Returns wireframe line opacity (0-1).
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getWireOpacity.js
 */

import { renderState } from '@engine/state/render/stateRenderState.js';


/**
 * Returns wireframe line opacity (0-1).
 * @returns {*} The current value from state.
 */
export function getWireOpacity() {
  return renderState.wireOpacity;
}
