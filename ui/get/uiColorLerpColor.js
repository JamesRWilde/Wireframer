/**
 * lerpColor.js - Color Linear Interpolation
 * 
 * PURPOSE:
 *   Linearly interpolates between two RGB colors.
 *   Used for smooth color transitions and shading calculations.
 * 
 * ARCHITECTURE ROLE:
 *   Called by computeTriangleShadeColor to blend between dark and bright
 *   theme colors based on lighting intensity.
 */

"use strict";

/**
 * lerpColor - Linearly interpolates between two colors
 * 
 * @param {Array<number>} a - Start color [r, g, b]
 * @param {Array<number>} b - End color [r, g, b]
 * @param {number} t - Interpolation factor (0=start, 1=end)
 * 
 * @returns {Array<number>} Interpolated color [r, g, b]
 * 
 * The function:
 * 1. Interpolates each channel independently
 * 2. Formula: result = a + (b - a) * t
 * 3. Rounds to integers
 */
export function uiColorLerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
