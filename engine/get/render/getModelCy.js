'use strict';

/**
 * getModelCy - Get Model Cy
 *
 * PURPOSE:
 *   Returns model center y-coordinate for projection.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getModelCy.js
 */

import { viewportState } from '@engine/state/render/viewportState.js';


/**
 * Returns model center y-coordinate for projection.
 * @returns {*} The current value from state.
 */
export function getModelCy() {
  return viewportState.MODEL_CY;
}
