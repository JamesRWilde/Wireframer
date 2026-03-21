'use strict';

/**
 * setZoomMax - Set Zoom Max
 *
 * PURPOSE:
 *   Sets maximum allowed camera zoom level.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setZoomMax.js
 */

import { zoomState } from '@engine/state/render/zoomState.js';


/**
 * Sets maximum allowed camera zoom level.
 * @param {*} v - The value to set.
 */
export function setZoomMax(v) {
  zoomState.zoomMax = v;
}
