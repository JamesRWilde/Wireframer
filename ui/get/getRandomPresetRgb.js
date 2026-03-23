/**
 * randomPresetRgb.js - Random Preset RGB Generator
 *
 * PURPOSE:
 *   Generates a random RGB color that meets contrast and saturation heuristics
 *   for use as a preset custom color swatch.
 *
 * ARCHITECTURE ROLE:
 *   Used by the theme UI when selecting a random preset color. Ensures generated
 *   colors are bright and varied enough to appear distinct from default themes.
 *
 * @returns {number[]} RGB array [r, g, b]
 */

"use strict";

import { getHsvToRgb }from '@ui/get/color/getHsvToRgb.js';
import { getRelativeLuminance }from '@ui/get/color/getRelativeLuminance.js';

export function getRandomPresetRgb() {
  for (let i = 0; i < 18; i++) {
    const hue = Math.random();
    const saturation = 0.68 + Math.random() * 0.28;
    const value = 0.74 + Math.random() * 0.23;
    const rgb = getHsvToRgb(hue, saturation, value);

    const max = Math.max(rgb[0], rgb[1], rgb[2]);
    const min = Math.min(rgb[0], rgb[1], rgb[2]);
    const spread = max - min;
    const lum = getRelativeLuminance(rgb);

    // Accept only colors with enough contrast and saturation.
    if (spread >= 90 && max >= 150 && lum >= 0.17) return rgb;
  }

  // Fallback: return a moderately saturated, bright color.
  return getHsvToRgb(Math.random(), 0.82, 0.86);
}
