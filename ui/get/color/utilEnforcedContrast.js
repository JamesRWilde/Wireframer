/**
 * enforceContrast.js - Contrast Enforcement
 * 
 * PURPOSE:
 *   Ensures foreground colors meet minimum contrast requirements against
 *   background colors for accessibility compliance.
 * 
 * ARCHITECTURE ROLE:
 *   Called by buildCustomTheme to ensure UI text meets WCAG contrast standards.
 *   Iteratively adjusts colors toward white or black until contrast is met.
 *
 * WHY THIS EXISTS:
 *   Encapsulates contrast remediation logic so theme palette generation can
 *   rely on a single accessible color correction algorithm.
 *
 * DATA FORMAT:
 *   - fg/bg: [r, g, b] arrays (0-255)
 *   - minRatio: contrast ratio (e.g., 4.5 for WCAG AA)
 * 
 * ALGORITHM:
 *   1. Check if current contrast meets minimum
 *   2. If not, try mixing toward white and black
 *   3. Return first color that meets minimum, or best found
 */

"use strict";

import { utilContrastRatio }from '@ui/get/color/utilContrastRatio.js';
import { utilMixedRgb }from '@ui/get/color/utilMixedRgb.js';

/**
 * enforceContrast - Adjusts foreground color to meet contrast requirements
 * 
 * @param {Array<number>} fg - Foreground RGB color [r, g, b]
 * @param {Array<number>} bg - Background RGB color [r, g, b]
 * @param {number} minRatio - Minimum required contrast ratio (e.g., 4.5 for WCAG AA)
 * 
 * @returns {Array<number>} Adjusted foreground color meeting contrast requirements
 * 
 * The function:
 * 1. Returns original color if contrast already meets minimum
 * 2. Tries mixing toward white and black in 24 steps
 * 3. Returns first color meeting minimum, or best found
 */
export function utilEnforcedContrast(fg, bg, minRatio) {
  // Check current contrast
  const current = utilContrastRatio(fg, bg);
  if (current >= minRatio) return fg;

  // Track best color found
  let best = fg;
  let bestRatio = current;

  // Try mixing toward white and black
  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    
    // Try mixing toward white
    const towardWhite = utilMixedRgb(fg, [255, 255, 255], t);
    const cw = utilContrastRatio(towardWhite, bg);
    if (cw > bestRatio) {
      bestRatio = cw;
      best = towardWhite;
    }
    if (cw >= minRatio) return towardWhite;

    // Try mixing toward black
    const towardBlack = utilMixedRgb(fg, [0, 0, 0], t);
    const cb = utilContrastRatio(towardBlack, bg);
    if (cb > bestRatio) {
      bestRatio = cb;
      best = towardBlack;
    }
    if (cb >= minRatio) return towardBlack;
  }

  // Return best color found (may not meet minimum)
  return best;
}
