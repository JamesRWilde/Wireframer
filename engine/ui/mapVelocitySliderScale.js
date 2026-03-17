/**
 * mapVelocitySliderScale.js - Velocity Slider Scale Mapping
 * 
 * PURPOSE:
 *   Maps raw slider percentage to velocity scale factor.
 *   Uses piecewise linear mapping for better control at low velocities.
 * 
 * ARCHITECTURE ROLE:
 *   Called by UI controls to convert slider value to velocity multiplier.
 *   Provides non-linear mapping for more intuitive speed control.
 * 
 * MAPPING CURVE:
 *   - 0-100% slider: 0-2.8x velocity (linear)
 *   - 100-220% slider: 2.8-5.68x velocity (linear with different slope)
 */

"use strict";

/**
 * mapVelocitySliderScale - Maps slider percentage to velocity scale
 * 
 * @param {number} rawPercent - Raw slider value (0-220)
 * 
 * @returns {number} Velocity scale factor
 * 
 * The function:
 * 1. Clamps input to non-negative
 * 2. Uses piecewise linear mapping:
 *    - Below 100: slope of 2.8
 *    - Above 100: slope of 2.4 (slightly less aggressive)
 */
export function mapVelocitySliderScale(rawPercent) {
  // Clamp to non-negative
  const p = Math.max(0, rawPercent);
  
  // Piecewise linear mapping
  if (p <= 1) return p * 2.8;
  return 2.8 + (p - 1) * 2.4;
}
