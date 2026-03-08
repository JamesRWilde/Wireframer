/**
 * easeInOut.js - Ease-In-Out Easing Function
 * 
 * PURPOSE:
 *   Provides smooth acceleration and deceleration for animations. This easing
 *   function starts slow, speeds up in the middle, then slows down at the end,
 *   creating a natural-looking motion.
 * 
 * ARCHITECTURE ROLE:
 *   Used by advanceMorphFrame to smooth the morph animation progress. Without
 *   easing, morphs would have linear interpolation which looks mechanical.
 * 
 * MATHEMATICAL BASIS:
 *   Uses a quadratic ease-in-out curve:
 *   - For t < 0.5: 2t² (acceleration)
 *   - For t ≥ 0.5: 1 - (-2t + 2)² / 2 (deceleration)
 *   
 *   This creates an S-shaped curve that smoothly transitions from slow to fast
 *   to slow, providing natural-looking motion.
 */

"use strict";

/**
 * easeInOut - Applies ease-in-out easing to a linear progress value
 * 
 * @param {number} t - Linear progress value (0-1)
 *   0 = start, 1 = end
 * 
 * @returns {number} Eased progress value (0-1)
 *   Starts slow, accelerates in middle, decelerates at end
 * 
 * Examples:
 *   easeInOut(0) => 0 (start)
 *   easeInOut(0.25) => 0.125 (slow start)
 *   easeInOut(0.5) => 0.5 (midpoint)
 *   easeInOut(0.75) => 0.875 (slowing down)
 *   easeInOut(1) => 1 (end)
 */
export function easeOut(t) {
  // Quadratic ease-in-out
  // First half: ease in (accelerate)
  // Second half: ease out (decelerate)
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
