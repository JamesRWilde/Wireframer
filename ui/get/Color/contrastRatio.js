/**
 * contrastRatio.js - WCAG Contrast Ratio Calculation
 * 
 * PURPOSE:
 *   Calculates the WCAG contrast ratio between two colors.
 *   Used to ensure text and UI elements meet accessibility standards.
 * 
 * ARCHITECTURE ROLE:
 *   Called by enforceContrast to verify color combinations meet minimum
 *   contrast requirements for accessibility.
 * 
 * WCAG FORMULA:
 *   contrast = (L1 + 0.05) / (L2 + 0.05)
 *   where L1 is lighter luminance, L2 is darker
 *   Minimum ratios: 4.5:1 for normal text, 3:1 for large text
 */

"use strict";

import { relativeLuminance } from './relativeLuminance.js';

/**
 * contrastRatio - Calculates WCAG contrast ratio between two colors
 * 
 * @param {Array<number>} a - First RGB color [r, g, b]
 * @param {Array<number>} b - Second RGB color [r, g, b]
 * 
 * @returns {number} Contrast ratio (1-21, higher is more contrast)
 * 
 * The function:
 * 1. Computes relative luminance for both colors
 * 2. Identifies lighter and darker colors
 * 3. Applies WCAG contrast formula
 */
export function contrastRatio(a, b) {
  // Get relative luminance for both colors
  const la = GetUiColorRelativeLuminance(a);
  const lb = GetUiColorRelativeLuminance(b);
  
  // Identify lighter and darker
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  
  // WCAG contrast ratio formula
  return (light + 0.05) / (dark + 0.05);
}
