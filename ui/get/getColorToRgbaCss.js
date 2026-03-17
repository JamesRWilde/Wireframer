/**
 * toRgbaCss.js - RGBA CSS String Generation
 * 
 * PURPOSE:
 *   Generates a CSS rgba() color string from RGB values and alpha.
 *   Similar to rgbA.js but named for consistency with toRgbCss.
 * 
 * ARCHITECTURE ROLE:
 *   Called by buildCustomTheme to create CSS variables with alpha.
 *   Used for UI theme color definitions.
 */

"use strict";

/**
 * toRgbaCss - Creates CSS rgba() string
 * 
 * @param {Array<number>} rgb - RGB color [r, g, b] with values 0-255
 * @param {number} alpha - Alpha value (0-1)
 * 
 * @returns {string} CSS rgba() color string
 */
export function uiColorToRgbaCss(rgb, alpha) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
}
