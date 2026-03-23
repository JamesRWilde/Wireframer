/**
 * utilLinear.js - sRGB to Linear Gamma Conversion
 *
 * PURPOSE:
 *   Converts 0-255 sRGB color components to linear gamma space values
 *   in the range 0-1 for lighting and luminance calculations.
 *
 * ARCHITECTURE ROLE:
 *   Called by color and shading utilities (e.g., utilRelativeLuminanceRaw)
 *   to convert display-coded color values to linear light measurements.
 *
 * WHY THIS EXISTS:
 *   Centralizes gamma conversion so all lighting math uses a consistent
 *   linearized color space.
 */

'use strict';

/**
 * linear - Convert sRGB component to linear gamma space compressor.
 *
 * @param {number} v - sRGB component 0-255
 * @returns {number} linearized value 0-1
 */
export function utilLinear(v) {
  const normalized = v / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}
