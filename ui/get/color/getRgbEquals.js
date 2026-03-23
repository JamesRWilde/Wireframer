/**
 * rgbEquals.js - RGB Color Equality Check
 * 
 * PURPOSE:
 *   Compares two RGB colors for exact equality.
 *   Used to highlight active preset swatches in the UI.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateCustomColor to mark the currently active preset.
 *   Provides simple component-wise color comparison.
 *
 * WHY THIS EXISTS:
 *   Creates a reusable color equality assertion so active preset rendering is consistent.
 */

"use strict";

/**
 * rgbEquals - Checks if two RGB colors are exactly equal
 * 
 * @param {Array<number>} a - First RGB color [r, g, b]
 * @param {Array<number>} b - Second RGB color [r, g, b]
 * 
 * @returns {boolean} True if all components are equal
 * 
 * The function:
 * 1. Compares each RGB component
 * 2. Returns true only if all three match exactly
 */
export function getRgbEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
