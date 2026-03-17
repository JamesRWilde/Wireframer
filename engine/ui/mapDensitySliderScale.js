/**
 * mapDensitySliderScale.js - Density Slider Scale Mapping
 * 
 * PURPOSE:
 *   Maps raw slider percentage to density scale factor.
 *   Uses piecewise linear mapping for better control at low densities.
 * 
 * ARCHITECTURE ROLE:
 *   Called by UI controls to convert slider value to density multiplier.
 *   Provides non-linear mapping for more intuitive density control.
 * 
 * MAPPING CURVE:
 *   - 0-100% slider: 0-2.4x density (linear)
 *   - 100-220% slider: 2.4-5.08x density (linear with different slope)
 */

"use strict";

/**
 * mapDensitySliderScale - Maps slider percentage to density scale
 * 
 * @param {number} rawPercent - Raw slider value (0-220)
 * 
 * @returns {number} Density scale factor
 * 
 * The function:
 * 1. Clamps input to non-negative
 * 2. Uses piecewise linear mapping:
 *    - Below 100: slope of 2.4
 *    - Above 100: slope of 2.2 (slightly less aggressive)
 */
export function mapDensitySliderScale(rawPercent) {
  // Clamp to non-negative
  const p = Math.max(0, rawPercent);
  
  // Piecewise linear mapping
  if (p <= 1) return p * 2.4;
  return 2.4 + (p - 1) * 2.2;
}
