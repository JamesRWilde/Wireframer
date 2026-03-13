/**
 * toRgbCss.js - RGB CSS String Generation
 * 
 * PURPOSE:
 *   Generates a CSS rgb() color string from RGB values.
 *   Used for creating CSS-compatible color strings without alpha.
 * 
 * ARCHITECTURE ROLE:
 *   Called by buildCustomTheme and updateCustomColorUi to create
 *   CSS color values for UI elements.
 */

/**
 * toRgbCss - Creates CSS rgb() string
 * 
 * @param {Array<number>} rgb - RGB color [r, g, b] with values 0-255
 * 
 * @returns {string} CSS rgb() color string
 */
export function toRgbCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
