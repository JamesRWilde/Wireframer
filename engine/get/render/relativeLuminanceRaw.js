'use strict';
import { linear } from './linear.js';

/**
 * relativeLuminanceRaw - Compute relative luminance from RGB in linear gamma space.
 *
 * @param {Array<number>} rgb - [r, g, b]
 * @returns {number} luminance
 */
export function relativeLuminanceRaw(rgb) {
  const r = linear(rgb[0]);
  const g = linear(rgb[1]);
  const b = linear(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
