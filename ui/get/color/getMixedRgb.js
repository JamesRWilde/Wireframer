/**
 * mixRgb.js - RGB Color Mixing
 * 
 * PURPOSE:
 *   Mixes two RGB colors using linear interpolation.
 *   Functionally identical to lerpColor but named for clarity in theme building.
 * 
 * ARCHITECTURE ROLE:
 *   Called by buildCustomTheme to create theme color variations.
 *   Used extensively for generating UI colors from base color.
 */

"use strict";

/**
 * mixRgb - Mixes two colors with linear interpolation
 * 
 * @param {Array<number>} a - First color [r, g, b]
 * @param {Array<number>} b - Second color [r, g, b]
 * @param {number} t - Mix factor (0=all a, 1=all b)
 * 
 * @returns {Array<number>} Mixed color [r, g, b]
 * 
 * The function:
 * 1. Interpolates each channel independently
 * 2. Formula: result = a + (b - a) * t
 * 3. Rounds to integers
 */
export function getMixedRgb(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
