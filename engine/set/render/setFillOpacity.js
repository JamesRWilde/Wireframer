'use strict';

/**
 * setFillOpacity - Set Fill Opacity
 *
 * PURPOSE:
 *   Sets fill layer opacity (0-1).
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setFillOpacity.js
 */

import { renderState } from '@engine/state/render/stateRenderState.js';


/**
 * Sets fill layer opacity (0-1).
 * @param {*} v - The value to set.
 */
export function setFillOpacity(v) {
  renderState.fillOpacity = v;
}
