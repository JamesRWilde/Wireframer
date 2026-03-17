/**
 * setCustomRgbGlobal.js - Global RGB Setter
 * 
 * PURPOSE:
 *   Sets the globalThis.CUSTOM_RGB value for backwards compatibility.
 *   Used alongside setCustomRgb to maintain both module and global state.
 * 
 * ARCHITECTURE ROLE:
 *   Called during initialization to sync global and module state.
 *   Provides backwards compatibility for code using globalThis.CUSTOM_RGB.
 * 
 * DATA FORMAT:
 *   - val: Array [r, g, b] with 0-255 values.
 */

"use strict";

/**
 * setCustomRgbGlobal - Sets globalThis.CUSTOM_RGB
 * 
 * @param {Array<number>} val - RGB color [r, g, b] to set
 * 
 * @returns {void}
 */
export function setCustomRgbGlobal(val) { globalThis.CUSTOM_RGB = val; }
