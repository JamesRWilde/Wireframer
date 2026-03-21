'use strict';

/**
 * setZoom - Set Zoom
 *
 * PURPOSE:
 *   Sets camera zoom level.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setZoom.js
 */

import { zoomState } from '@engine/state/render/zoomState.js';


/**
 * Sets camera zoom level.
 * @param {*} v - The value to set.
 */
export function setZoom(v) {
  zoomState.zoom = v;
}
