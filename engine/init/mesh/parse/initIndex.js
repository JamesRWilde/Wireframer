/**
 * parseIndex.js - OBJ Index Parser
 * 
 * PURPOSE:
 *   Converts an OBJ index string to a zero-based array index. OBJ format
 *   uses 1-based indexing and supports negative indices (relative to the
 *   end of the array). This function handles all cases.
 * 
 * ARCHITECTURE ROLE:
 *   Called by idxFromToken to parse individual index components from
 *   face tokens. Essential for correct OBJ parsing.
 *
 * WHY THIS EXISTS:
 *   Creates a shared index normalization helper used by face parsing to
 *   avoid multiple interpreted 1-based to 0-based conversions.
 *
 * OBJ INDEX FORMATS:
 *   - Positive: 1-based index (1 = first element)
 *   - Negative: Relative to end (-1 = last element)
 *   - Zero: Invalid (OBJ indices are 1-based)
 */

/**
 * parseIndex - Converts OBJ index string to zero-based array index
 * 
 * @param {string} str - Index string from OBJ file (e.g., "1", "-1", "5")
 * @param {number} arrayLen - Length of the target array (for negative indices)
 * 
 * @returns {number|null} Zero-based index, or null if invalid
 * 
 * Examples:
 *   parseIndex("1", 10) => 0 (first element)
 *   parseIndex("5", 10) => 4 (fifth element)
 *   parseIndex("-1", 10) => 9 (last element)
 *   parseIndex("0", 10) => null (invalid)
 */
export function index(str, arrayLen) {
  // Empty string is invalid
  if (!str) return null;
  
  // Convert to number
  let i = Number(str);
  
  // Check for valid number (not NaN, not zero)
  if (!Number.isFinite(i) || i === 0) return null;
  
  // Convert to zero-based index
  // Positive: subtract 1 (OBJ is 1-based)
  // Negative: add array length (relative to end)
  return i > 0 ? i - 1 : arrayLen + i;
}