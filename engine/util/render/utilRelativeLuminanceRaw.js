/**
 * relativeLuminanceRaw.js - RGB Luminance Conversion
 *
 * PURPOSE:
 *   Converts linearized RGB values to relative luminance using
 *   standard Rec. 709 weights.
 *
 * ARCHITECTURE ROLE:
 *   Used by color and lighting utilities to compute brightness for
 *   contrast, palette selection, and UI color harmonization.
 *
 * WHY THIS EXISTS:
 *   Avoids duplicating luminance conversion logic in multiple places
 *   and ensures consistency across shading and color palette controls.
 */

'use strict';
import { utilLinear } from '@engine/util/render/utilLinear.js';

/**
 * relativeLuminanceRaw - Compute relative luminance from RGB in linear gamma space.
 *
 * @param {Array<number>} rgb - [r, g, b]
 * @returns {number} luminance
 */
export function utilRelativeLuminanceRaw(rgb) {
  const r = utilLinear(rgb[0]);
  const g = utilLinear(rgb[1]);
  const b = utilLinear(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
