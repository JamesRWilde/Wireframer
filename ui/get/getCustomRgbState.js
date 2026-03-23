/**
 * getCustomRgbState.js - Getter for custom RGB state
 *
 * PURPOSE:
 *   Provides read-only access to the current custom RGB color.
 *   Returns a copy to prevent external mutation.
 *
 * ARCHITECTURE ROLE:
 *   Getter module in the ui/get/ layer. Imports state directly
 *   and exports a function that returns a copy.
 */

"use strict";

import { customRgbState } from '@ui/state/stateCustomRgbState.js';

/**
 * getCustomRgbState - Returns the current custom RGB as [r,g,b]
 * @returns {number[]} Copy of the RGB triplet
 */
export function getCustomRgbState() {
  return customRgbState.slice();
}
