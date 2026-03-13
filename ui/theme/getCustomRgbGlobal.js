/**
 * getCustomRgbGlobal.js - Global RGB Accessor
 * 
 * PURPOSE:
 *   Returns the current custom RGB color array.
 *   Provides read access to the module-scoped CUSTOM_RGB.
 * 
 * ARCHITECTURE ROLE:
 *   Called by code that needs to read the current custom color.
 *   Provides consistent access pattern for CUSTOM_RGB.
 */

import { CUSTOM_RGB } from '../dom-state.js';

/**
 * getCustomRgbGlobal - Gets current custom RGB color
 * 
 * @returns {Array<number>} Current RGB color [r, g, b]
 */
export function getCustomRgbGlobal() { return CUSTOM_RGB; }
