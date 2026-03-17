/**
 * relativeLuminance.js - WCAG Relative Luminance Calculation
 * 
 * PURPOSE:
 *   Calculates the relative luminance of an RGB color per WCAG 2.0 spec.
 *   Used for contrast ratio calculations and accessibility compliance.
 * 
 * ARCHITECTURE ROLE:
 *   Called by contrastRatio to compute luminance values.
 *   Used by randomPresetRgb to ensure generated colors have sufficient brightness.
 * 
 * WCAG FORMULA:
 *   L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 *   where R, G, B are linear (not sRGB) values
 */

"use strict";

import { linearChannel }from '@ui/get/color/linearChannel.js';

/**
 * relativeLuminance - Calculates WCAG relative luminance
 * 
 * @param {Array<number>} rgb - RGB color [r, g, b] with values 0-255
 * 
 * @returns {number} Relative luminance (0-1, where 0=black, 1=white)
 * 
 * The function:
 * 1. Converts each channel from sRGB to linear RGB
 * 2. Applies WCAG luminance weights
 * 3. Returns weighted sum
 */
export function relativeLuminance(rgb) {
  // Convert sRGB channels to linear RGB
  const r = GetUiColorLinearChannel(rgb[0]);
  const g = GetUiColorLinearChannel(rgb[1]);
  const b = GetUiColorLinearChannel(rgb[2]);
  
  // WCAG relative luminance formula
  // Weights reflect human eye sensitivity to different colors
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
