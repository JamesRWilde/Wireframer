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
 *
 * WHY THIS EXISTS:
 *   Allows render transforms to rely on a single source for model vertical
 *   centering value, improving consistency in both CPU/GPU pipelines.
 */

// Import viewport state container for geometric transformations
import { viewportState } from '@engine/state/render/stateViewportState.js';


/**
 * Returns model center y-coordinate for projection.
 * @returns {*} The current value from state.
 */
export function getModelCy() {
  return viewportState.MODEL_CY;
}
