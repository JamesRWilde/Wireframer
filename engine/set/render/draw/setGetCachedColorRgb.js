/**
 * setGetCachedColorRgb.js - Get Cached Color RGB
 *
 * PURPOSE:
 *   Retrieves RGB values for a color string, using a cache to avoid repeated parsing.
 *
 * ARCHITECTURE ROLE:
 *   Cached color parser for background particle rendering.
 *
 * USAGE:
 *   import { setGetCachedColorRgb } from '@engine/set/render/draw/setGetCachedColorRgb.js';
 *   const rgb = setGetCachedColorRgb('#ff0000');
 */

"use strict";

import { setParseColorToRgb } from '@engine/set/render/draw/setParseColorToRgb.js';

const colorCache = new Map();

export function setGetCachedColorRgb(color) {
  let rgb = colorCache.get(color);
  if (!rgb) {
    rgb = setParseColorToRgb(color);
    colorCache.set(color, rgb);
  }
  return rgb;
}
