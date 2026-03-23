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
 *
 * WHY THIS EXISTS:
 *   Encapsulates access to the fill alpha setting so UI and render logic use a
 *   consistent source-of-truth with potential smoothing/calc in set phase.
 */

// Import base render state containing opacity.
import { renderState } from '@engine/state/render/stateRenderState.js';


/**
 * Returns fill layer opacity (0-1).
 * @returns {*} The current value from state.
 */
export function getFillOpacity() {
  return renderState.fillOpacity;
}
