"use strict";

/**
 * setDetailLevelValue - Set Detail Level Value
 *
 * PURPOSE:
 *   Sets lod detail level slider value.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setDetailLevelValue.js
 */

import { detailLevelState } from '@engine/state/render/stateDetailLevelState.js';

/**
 * Sets lod detail level slider value.
 * @param {*} v - The value to set.
 */
export function setDetailLevelValue(v) {
  detailLevelState.value = v;
}
