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
 *
 * WHY THIS EXISTS:
 *   Exposes LOD selection data for render loops and performance tuning.
 */

// Import the detail level state container used for LOD decisions
import { detailLevelState } from '@engine/state/render/stateDetailLevelState.js';

/**
 * Returns current lod detail level value.
 * @returns {*} The current value from state.
 */
export function getDetailLevelValue() {
  return detailLevelState.value;
}
