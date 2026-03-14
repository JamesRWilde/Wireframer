/**
 * clampNumber.js - Numeric Value Clamping
 * 
 * PURPOSE:
 *   Clamps a numeric value to a specified range with fallback for invalid input.
 *   Used by UI controls to validate and constrain slider/input values.
 * 
 * ARCHITECTURE ROLE:
 *   Called by restoreUiState and other UI functions to safely clamp values.
 *   Provides consistent numeric validation across the application.
 */

"use strict";

/**
 * clampNumber - Clamps a value to a range with fallback
 * 
 * @param {*} value - Value to clamp (will be converted to number)
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} fallback - Value to return if input is not a valid number
 * 
 * @returns {number} Clamped value within [min, max], or fallback if invalid
 * 
 * The function:
 * 1. Converts input to number
 * 2. Returns fallback if conversion results in NaN or Infinity
 * 3. Clamps result to [min, max] range
 */
export function clampNumber(value, min, max, fallback) {
  // Convert to number
  const n = Number(value);
  
  // Return fallback if not a finite number
  if (!Number.isFinite(n)) return fallback;
  
  // Clamp to range and return
  return Math.max(min, Math.min(max, n));
}
