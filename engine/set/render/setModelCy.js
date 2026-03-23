'use strict';

/**
 * setModelCy - Set Model Cy
 *
 * PURPOSE:
 *   Sets model center y-coordinate for projection.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setModelCy.js
 */

import { viewportState } from '@engine/state/render/stateViewportState.js';


/**
 * Sets model center y-coordinate for projection.
 * @param {*} v - The value to set.
 */
export function setModelCy(v) {
  viewportState.MODEL_CY = v;
}
