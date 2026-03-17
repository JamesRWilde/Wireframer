/**
 * writeStat.js - Telemetry Stat DOM Writer
 *
 * PURPOSE:
 *   Writes a text value to a DOM element used for displaying
 *   telemetry statistics (FPS, frame time, etc.).
 *
 * ARCHITECTURE ROLE:
 *   Called by the HUD telemetry module to update stat display elements
 *   with computed values (FPS, frame budget, etc.).
 */

"use strict";

/**
 * writeStat - Sets the text content of a stats DOM element
 *
 * @param {HTMLElement|null} elem - The DOM element to update
 * @param {string|number} val - The value to display
 * @returns {void}
 */
export function writeStat(elem, val) {
  // Guard against null/undefined elements
  if (!elem) return;

  // Set text content directly (safe from XSS as it does not parse HTML)
  elem.textContent = val;
}
