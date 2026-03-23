'use strict';
import { getLinear } from '@engine/get/render/getLinear.js';

/**
 * relativeLuminanceRaw - Compute relative luminance from RGB in linear gamma space.
 *
 * @param {Array<number>} rgb - [r, g, b]
 * @returns {number} luminance
 */
export function getRelativeLuminanceRaw(rgb) {
  const r = getLinear(rgb[0]);
  const g = getLinear(rgb[1]);
  const b = getLinear(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
