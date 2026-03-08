/**
 * priority.js - Quality Level Priority Mapper
 *
 * PURPOSE:
 *   Maps quality level strings to numeric priority values for
 *   comparison. Higher values indicate higher quality. Used by the
 *   adaptive quality system to determine upgrade/downgrade direction.
 *
 * ARCHITECTURE ROLE:
 *   Called by qualityApplyChange.js to compare current vs target
 *   quality levels numerically.
 */

"use strict";

/**
 * priority - Returns the numeric priority for a quality level
 *
 * @param {string} quality - Quality level string ('high'|'medium'|'low')
 * @returns {number} Priority value (3=high, 2=medium, 1=low, 0=unknown)
 */
export function priority(quality) {
  switch (quality) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}
