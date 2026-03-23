/**
 * rgbA.js - RGBA CSS String Generation
 * 
 * PURPOSE:
 *   Generates a CSS rgba() color string from RGB values and alpha.
 *   Used for creating CSS-compatible color strings with transparency.
 * 
 * ARCHITECTURE ROLE:
 *   Called by wireframe renderer to create edge colors with alpha.
 *   Provides consistent rgba string formatting.
 * 
 * WHY THIS EXISTS:
 *   Avoids repeated formatting logic and ensures uniform alpha formatting
 *   across rendering code paths.
 */

"use strict";

/**
 * rgbA - Creates CSS rgba() string from RGB and alpha
 * 
 * @param {Array<number>} rgb - RGB color [r, g, b] with values 0-255
 * @param {number} alpha - Alpha value (0-1)
 * 
 * @returns {string} CSS rgba() color string
 * 
 * The function:
 * 1. Formats RGB values as integers
 * 2. Formats alpha with 3 decimal places
 * 3. Returns CSS rgba() string
 */
export function utilRgbaString(rgb, alpha) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
}
