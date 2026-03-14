/**
 * easeInOutCubic.js - Cubic Ease-In-Out Easing Function
 * 
 * PURPOSE:
 *   Provides smooth acceleration and deceleration for animations using a
 *   cubic curve. This is a stronger easing than the quadratic version,
 *   creating more pronounced slow-start and slow-end behavior.
 * 
 * ARCHITECTURE ROLE:
 *   Alternative easing function available for morphing operations. The
 *   cubic curve provides more dramatic acceleration/deceleration than
 *   the quadratic easeInOut used by default.
 * 
 * MATHEMATICAL BASIS:
 *   Uses a cubic ease-in-out curve:
 *   - For t < 0.5: 4t³ (strong acceleration)
 *   - For t ≥ 0.5: 1 - (-2t + 2)³ / 2 (strong deceleration)
 *   
 *   This creates a more pronounced S-curve than quadratic easing.
 */

"use strict";

/**
 * easeInOutCubic - Applies cubic ease-in-out easing to a linear progress value
 * 
 * @param {number} t - Linear progress value (0-1)
 *   0 = start, 1 = end
 * 
 * @returns {number} Eased progress value (0-1)
 *   Stronger acceleration/deceleration than quadratic easing
 * 
 * Examples:
 *   easeInOutCubic(0) => 0 (start)
 *   easeInOutCubic(0.25) => 0.0625 (very slow start)
 *   easeInOutCubic(0.5) => 0.5 (midpoint)
 *   easeInOutCubic(0.75) => 0.9375 (slowing down)
 *   easeInOutCubic(1) => 1 (end)
 */
export function easeInOutCubic(t) {
  // Cubic ease-in-out
  // First half: ease in (strong acceleration)
  // Second half: ease out (strong deceleration)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
