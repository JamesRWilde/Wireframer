'use strict';

/**
 * getZoom - Get Zoom
 *
 * PURPOSE:
 *   Returns camera zoom level.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getZoom.js
 */

import { zoomState } from '@engine/state/render/zoomState.js';


/**
 * Returns camera zoom level.
 * @returns {*} The current value from state.
 */
export function getZoom() {
  return zoomState.zoom;
}
