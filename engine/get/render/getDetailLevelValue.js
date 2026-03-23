"use strict";

/**
 * getDetailLevelValue - Get Detail Level Value
 *
 * PURPOSE:
 *   Returns current lod detail level value.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getDetailLevelValue.js
 */

import { detailLevelState } from '@engine/state/render/stateDetailLevelState.js';

/**
 * Returns current lod detail level value.
 * @returns {*} The current value from state.
 */
export function getDetailLevelValue() {
  return detailLevelState.value;
}
