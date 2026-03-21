'use strict';

/**
 * getZoomMin - Get Zoom Min
 *
 * PURPOSE:
 *   Returns minimum allowed camera zoom level.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getZoomMin.js
 */

import { zoomState } from '@engine/state/render/zoomState.js';


/**
 * Returns minimum allowed camera zoom level.
 * @returns {*} The current value from state.
 */
export function getZoomMin() {
  return zoomState.zoomMin;
}
