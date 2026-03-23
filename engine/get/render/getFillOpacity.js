'use strict';

/**
 * getFillOpacity - Get Fill Opacity
 *
 * PURPOSE:
 *   Returns fill layer opacity (0-1).
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getFillOpacity.js
 */

import { renderState } from '@engine/state/render/stateRenderState.js';


/**
 * Returns fill layer opacity (0-1).
 * @returns {*} The current value from state.
 */
export function getFillOpacity() {
  return renderState.fillOpacity;
}
