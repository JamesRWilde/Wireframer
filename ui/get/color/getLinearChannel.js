/**
 * linearChannel.js - sRGB to Linear RGB Conversion
 * 
 * PURPOSE:
 *   Converts a single sRGB channel value to linear RGB.
 *   Required for accurate luminance calculations (WCAG compliance).
 * 
 * ARCHITECTURE ROLE:
 *   Called by relativeLuminance to convert sRGB values before
 *   computing perceptual luminance.
 * 
 * WHY CONVERSION IS NEEDED:
 *   sRGB uses gamma encoding for perceptual uniformity.
 *   Luminance calculations require linear (non-gamma) values.
 */

"use strict";

/**
 * linearChannel - Converts sRGB channel to linear RGB
 * 
 * @param {number} v - sRGB channel value (0-255)
 * 
 * @returns {number} Linear RGB value (0-1)
 * 
 * The function:
 * 1. Normalizes to 0-1 range
 * 2. Applies inverse sRGB gamma correction:
 *    - Low values: linear (v / 12.92)
 *    - High values: power function ((v + 0.055) / 1.055)^2.4
 */
export function getLinearChannel(v) {
  // Normalize to 0-1 range
  const n = v / 255;
  
  // Inverse sRGB gamma correction
  // Threshold at 0.04045 per sRGB specification
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}
