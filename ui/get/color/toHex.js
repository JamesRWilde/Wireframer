/**
 * toHex.js - RGB to Hex String Conversion
 * 
 * PURPOSE:
 *   Converts an RGB color array to a CSS hex color string.
 *   Used for displaying colors in hex format in the UI.
 * 
 * ARCHITECTURE ROLE:
 *   Called by SetUiUpdateCustomColor and initPresetSwatches to display
 *   color values in hex format.
 */

"use strict";

import { clampByte }from '@ui/get/color/clampByte.js';

/**
 * toHex - Converts RGB to hex color string
 * 
 * @param {Array<number>} rgb - RGB color [r, g, b]
 * 
 * @returns {string} Hex color string (#RRGGBB)
 * 
 * The function:
 * 1. Clamps each component to valid byte range
 * 2. Converts to 2-digit hex string
 * 3. Joins and prefixes with #
 * 4. Returns uppercase result
 */
export function toHex(rgb) {
  // Convert each component to 2-digit hex
  const hex = rgb.map((v) => GetUiColorClampByte(v).toString(16).padStart(2, '0')).join('');
  
  // Return uppercase hex string with # prefix
  return `#${hex.toUpperCase()}`;
}
