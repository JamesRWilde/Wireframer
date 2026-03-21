'use strict';

/**
 * getZoomMax - Get Zoom Max
 *
 * PURPOSE:
 *   Returns maximum allowed camera zoom level.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getZoomMax.js
 */

import { zoomState } from '@engine/state/render/zoomState.js';


/**
 * Returns maximum allowed camera zoom level.
 * @returns {*} The current value from state.
 */
export function getZoomMax() {
  return zoomState.zoomMax;
}
