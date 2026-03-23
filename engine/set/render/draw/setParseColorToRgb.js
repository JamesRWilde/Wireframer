/**
 * setParseColorToRgb.js - Parse Color String to RGB
 *
 * PURPOSE:
 *   Parses a hex color string (#RRGGBB) or rgba() format into RGB components.
 *
 * ARCHITECTURE ROLE:
 *   Utility function for background particle rendering.
 *
 * WHY THIS EXISTS:
 *   Standardizes color string parsing to RGB values in one location to avoid
 *   repeated parse code and inconsistent edge handling.
 *
 * USAGE:
 *   import { setParseColorToRgb } from '@engine/set/render/draw/setParseColorToRgb.js';
 *   const [r,g,b] = setParseColorToRgb('#ff0000');
 */

"use strict";

export function setParseColorToRgb(color) {
  let r = 0, g = 0, b = 0;
  if (color.startsWith('#')) {
    r = Number.parseInt(color.slice(1, 3), 16);
    g = Number.parseInt(color.slice(3, 5), 16);
    b = Number.parseInt(color.slice(5, 7), 16);
  } else {
    const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
    if (match) {
      r = Number(match[1]);
      g = Number(match[2]);
      b = Number(match[3]);
    }
  }
  return [r, g, b];
}
