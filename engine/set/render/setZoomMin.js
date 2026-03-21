'use strict';

/**
 * setZoomMin - Set Zoom Min
 *
 * PURPOSE:
 *   Sets minimum allowed camera zoom level.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setZoomMin.js
 */

import { zoomState } from '@engine/state/render/zoomState.js';


/**
 * Sets minimum allowed camera zoom level.
 * @param {*} v - The value to set.
 */
export function setZoomMin(v) {
  zoomState.zoomMin = v;
}
