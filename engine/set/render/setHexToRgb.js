/**
 * setHexToRgb.js - Convert hex color string to RGB array
 *
 * One function per file module.
 */

"use strict";

/**
 * setHexToRgb - Converts a hex color string to an [r, g, b] array
 *
 * @param {string} hex - Hex color string (e.g. '#ff0000', 'ff0000')
 * @returns {Array<number>} RGB values as [r, g, b] (0-255)
 */
export function setHexToRgb(hex) {
  const h = (hex || '#000000').replace('#', '');
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16)
  ];
}
