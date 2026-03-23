'use strict';

/**
 * getW - Get W
 *
 * PURPOSE:
 *   Returns viewport width in css pixels.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getW.js
 *
 * WHY THIS EXISTS:
 *   Provides consistent viewport dimension retrieval for render scaling and
 *   layout drive tasks.
 */

// Import viewport state object that tracks dimensions.
import { viewportState } from '@engine/state/render/stateViewportState.js';


/**
 * Returns viewport width in css pixels.
 * @returns {*} The current value from state.
 */
export function getW() {
  return viewportState.W;
}
