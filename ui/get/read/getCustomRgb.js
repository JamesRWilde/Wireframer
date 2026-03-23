/**
 * readCustomRgb.js - Read Custom RGB from Local Storage
 *
 * PURPOSE:
 *   Reads the saved custom RGB color from localStorage, with validation and fallbacks.
 *
 * ARCHITECTURE ROLE:
 *   Used during initialization to restore the user's saved custom color.
 *   Ensures values are clamped and defaults are used on corruption.
 *
 * DATA FORMAT:
 *   - Stored in localStorage as JSON array [r,g,b].
 *
 * @returns {number[]} RGB array [r, g, b]
 */

"use strict";

import {customRed,customGreen,customBlue, CUSTOM_RGB_KEY, CUSTOM_RGB_DEFAULT }from '@ui/state/dom.js';
import { getClampByte }from '@ui/get/color/getClampByte.js';

export function getCustomRgb() {
  try {
    const saved = localStorage.getItem(CUSTOM_RGB_KEY);
    if (!saved) return CUSTOM_RGB_DEFAULT.slice();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length !== 3) return CUSTOM_RGB_DEFAULT.slice();
    return [getClampByte(parsed[0]), getClampByte(parsed[1]), getClampByte(parsed[2])];
  } catch {
    return CUSTOM_RGB_DEFAULT.slice();
  }
}
