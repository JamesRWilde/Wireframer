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
 *
 * WHY THIS EXISTS:
 *   Provides stable access to opacity value used by line drawing logic.
 */

// Import render state containing wire rendering properties.
import { renderState } from '@engine/state/render/stateRenderState.js';


/**
 * Returns wireframe line opacity (0-1).
 * @returns {*} The current value from state.
 */
export function getWireOpacity() {
  return renderState.wireOpacity;
}
