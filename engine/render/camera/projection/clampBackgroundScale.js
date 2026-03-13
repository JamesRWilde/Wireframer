/**
 * clampBackgroundScale.js - Background Scale Value Clamp
 * 
 * PURPOSE:
 *   Clamps background scale values to valid range [0, 5.2].
 *   Ensures background rendering scale stays within acceptable bounds.
 * 
 * ARCHITECTURE ROLE:
 *   Used by UI controls to validate and constrain background scale input.
 *   Prevents invalid or extreme scale values from breaking rendering.
 */

/**
 * clampBackgroundScale - Clamps background scale to valid range
 * 
 * @param {number} level - Raw background scale value from UI
 * 
 * @returns {number} Clamped value between 0 and 5.2
 * 
 * The function:
 * 1. Converts input to number (handles string inputs)
 * 2. Falls back to 0 if conversion fails
 * 3. Clamps to range [0, 5.2]
 */
export function clampBackgroundScale(level) {
  // Convert to number, fallback to 0 if invalid
  // Then clamp to valid range [0, 5.2]
  return Math.max(0, Math.min(5.2, Number(level) || 0));
}
