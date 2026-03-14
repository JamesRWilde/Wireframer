/**
 * getCustomRgbFromInputs.js - RGB from Input Elements
 * 
 * PURPOSE:
 *   Reads RGB values from the custom color input elements.
 *   Falls back to current CUSTOM_RGB if inputs are unavailable.
 * 
 * ARCHITECTURE ROLE:
 *   Called when user adjusts color sliders to get current input values.
 *   Provides safe access to input values with fallback.
 * 
 * DATA FORMAT:
 *   - Reads from <input type="range"> or <input type="number"> elements for R, G, B.
 *   - Returns [r, g, b] with values clamped to 0-255.
 */

"use strict";

import { clampByte } from '../color-utils/clampByte.js';
import { customRed, customGreen, customBlue, CUSTOM_RGB } from '../dom-state.js';

/**
 * getCustomRgbFromInputs - Gets RGB values from input elements
 * 
 * @returns {number[]} RGB color [r, g, b] with values 0-255
 * 
 * The function:
 * 1. Reads values from R, G, B input elements
 * 2. Falls back to current CUSTOM_RGB if inputs unavailable
 * 3. Clamps values to valid byte range
 */
export function getCustomRgbFromInputs() {
  return [
    // Red: from input or fallback to current value
    clampByte(customRed ? customRed.value : CUSTOM_RGB[0]),
    // Green: from input or fallback to current value
    clampByte(customGreen ? customGreen.value : CUSTOM_RGB[1]),
    // Blue: from input or fallback to current value
    clampByte(customBlue ? customBlue.value : CUSTOM_RGB[2]),
  ];
}
