/**
 * getCachedColorRgb.js - Get Cached Color RGB
 *
 * PURPOSE:
 *   Retrieves RGB values for a color string, using a cache to avoid repeated parsing.
 *
 * ARCHITECTURE ROLE:
 *   Cached color parser for background particle rendering.
 *
 * USAGE:
 *   import { getCachedColorRgb } from '@engine/set/render/draw/getCachedColorRgb.js';
 *   const rgb = getCachedColorRgb('#ff0000');
 */

"use strict";

const colorCache = new Map();

export function getCachedColorRgb(color) {
  let rgb = colorCache.get(color);
  if (!rgb) {
    rgb = parseColorToRgb(color);
    colorCache.set(color, rgb);
  }
  return rgb;
}
