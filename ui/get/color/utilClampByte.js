/**
 * clampByte.js - Byte Value Clamping
 * 
 * PURPOSE:
 *   Clamps a numeric value to valid byte range [0, 255].
 *   Used to ensure RGB color components are valid.
 * 
 * ARCHITECTURE ROLE:
 *   Called by color manipulation functions to validate RGB values.
 *   Provides consistent byte clamping across color utilities.
 */

"use strict";

/**
 * clampByte - Clamps a value to valid byte range [0, 255]
 * 
 * @param {number} value - Value to clamp
 * 
 * @returns {number} Integer value clamped to [0, 255]
 * 
 * The function:
 * 1. Converts to number (handles string inputs)
 * 2. Rounds to nearest integer
 * 3. Clamps to [0, 255] range
 */
export function utilClampByte(value) {
  // Convert to number, round, and clamp to byte range
  return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}
