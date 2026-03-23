'use strict';

/**
 * linear - Convert sRGB component to linear gamma space compressor.
 *
 * @param {number} v - sRGB component 0-255
 * @returns {number} linearized value 0-1
 */
export function getLinear(v) {
  const normalized = v / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}
