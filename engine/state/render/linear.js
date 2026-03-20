'use strict';

/**
 * linear - Convert sRGB channel to linear luminance factor
 *
 * @param {number} v - 0..255 sRGB color channel
 * @returns {number} linearized channel
 */
export function linear(v) {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}
