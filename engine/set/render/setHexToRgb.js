/**
 * setHexToRgb.js - Convert Hex Color String to RGB Array
 *
 * PURPOSE:
 *   Converts a hex color string (e.g. '#ff0000' or 'ff0000') into an
 *   [r, g, b] array with values in the 0-255 range. Used by both GPU
 *   and CPU renderers to convert theme hex colors to numeric RGB.
 *
 * ARCHITECTURE ROLE:
 *   Pure utility function — no state dependencies. Called by GPU path
 *   to convert edge/fill colors, and by theme initialization to parse
 *   color definitions.
 *
 * WHY THIS EXISTS:
 *   Theme colors are stored as hex strings for readability, but the
 *   rendering pipeline needs numeric [r, g, b] arrays for canvas
 *   operations and WebGL uniforms.
 */

"use strict";

/**
 * setHexToRgb - Converts a hex color string to an [r, g, b] array
 *
 * @param {string} hex - Hex color string (e.g. '#ff0000', 'ff0000')
 * @returns {Array<number>} RGB values as [r, g, b] (each 0-255)
 */
export function setHexToRgb(hex) {
  // Strip leading '#' if present, default to black if null/undefined
  const h = (hex || '#000000').replace('#', '');
  return [
    // Parse 2-character hex substrings to base-10 integers
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16)
  ];
}
