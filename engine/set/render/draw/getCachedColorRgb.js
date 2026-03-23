/**
 * getCachedColorRgb.js - Get Cached Color RGB
 *
 * PURPOSE:
 *   Retrieves RGB values for a color string, using a cache to avoid repeated parsing.
 *   Lazily populates the cache on first access for each unique color string.
 *
 * ARCHITECTURE ROLE:
 *   Cached color parser for particle rendering. Called once per unique color
 *   per frame, returns cached result on subsequent calls.
 *
 * USAGE:
 *   import { getCachedColorRgb } from '@engine/set/render/draw/getCachedColorRgb.js';
 *   const rgb = getCachedColorRgb('#ff0000');
 */

"use strict";

import { setParseColorToRgb } from '@engine/set/render/draw/setParseColorToRgb.js';

const colorCache = new Map();

export function getCachedColorRgb(color) {
  let rgb = colorCache.get(color);
  if (!rgb) {
    rgb = setParseColorToRgb(color);
    colorCache.set(color, rgb);
  }
  return rgb;
}
