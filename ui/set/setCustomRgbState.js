/**
 * setCustomRgbState.js - Setter for custom RGB state
 *
 * PURPOSE:
 *   Updates the custom RGB color state with validation.
 *
 * ARCHITECTURE ROLE:
 *   Setter module in the ui/set/ layer. Imports state directly
 *   and mutates it with validated values.
 *
 * WHY THIS EXISTS:
 *   Isolates custom RGB state mutation so color updates are always validated
 *   and kept in one place.
 *
 * @param {number[]} rgb - RGB triplet [r, g, b] with each 0-255
 */

"use strict";

import { customRgbState } from '@ui/state/stateCustomRgbState.js';

/**
 * setCustomRgbState - Sets the custom RGB color
 * @param {number[]} rgb - RGB array with 3 components (0-255)
 */
export function setCustomRgbState(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3) return;
  customRgbState[0] = rgb[0];
  customRgbState[1] = rgb[1];
  customRgbState[2] = rgb[2];
}
