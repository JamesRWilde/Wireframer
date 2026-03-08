/**
 * parseCssColor.js - Parse CSS color string to normalized RGBA object
 *
 * One function per file module.
 */

"use strict";

import { parseColorToRgb } from '@engine/set/render/draw/parseColorToRgb.js';

/**
 * parseCssColor - Converts a CSS color string to normalized {r, g, b, a} object
 *
 * @param {string} cssColor - CSS color string (e.g. '#ffffff', 'rgb(255,0,0)')
 * @returns {{r: number, g: number, b: number, a: number}} Normalized color with channels in [0, 1]
 */
export function parseCssColor(cssColor) {
  const [r, g, b] = parseColorToRgb(cssColor || '#ffffff');
  return { r: r / 255, g: g / 255, b: b / 255, a: 1 };
}
