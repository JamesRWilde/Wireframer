/**
 * setDetailLevelValue.js - Set Detail Level Value
 *
 * PURPOSE:
 *   Sets the LOD detail level slider value in shared state. This value
 *   is read by setDetailLevel to determine how much geometry decimation
 *   to apply to the model for both CPU and GPU rendering.
 *
 * ARCHITECTURE ROLE:
 *   Setter for detailLevelState.value. Called when the user moves the
 *   detail level slider in the HUD. The value drives the LOD percentage
 *   used during mesh decimation.
 *
 * WHY THIS EXISTS:
 *   The detail level slider controls how many polygons are rendered.
 *   Storing the value here allows the render loop to read it and
 *   re-decimate the model when the slider changes.
 */

"use strict";

// Import the detail level state container
// Holds the slider value (0-1) that controls geometry LOD
import { detailLevelState } from '@engine/state/render/stateDetailLevelState.js';

/**
 * setDetailLevelValue - Stores the detail level slider value
 * @param {number} v - LOD value from 0 (minimum detail) to 1 (full detail)
 */
export function setDetailLevelValue(v) {
  detailLevelState.value = v;
}
