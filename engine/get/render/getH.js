'use strict';

/**
 * getH - Get H
 *
 * PURPOSE:
 *   Returns viewport height in css pixels.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getH.js
 */

import { viewportState } from '@engine/state/render/stateViewportState.js';


/**
 * Returns viewport height in css pixels.
 * @returns {*} The current value from state.
 */
export function getH() {
  return viewportState.H;
}
