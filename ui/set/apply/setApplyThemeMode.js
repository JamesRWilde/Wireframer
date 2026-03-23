/**
 * themeMode.js - Theme Mode DOM Writer
 *
 * PURPOSE:
 *   Writes the current theme mode ('light' or 'dark') to the theme-mode
 *   DOM element so the UI reflects the active theme selection.
 *
 * ARCHITECTURE ROLE:
 *   Called by theme toggle logic to persist the visual state of the
 *   theme-mode input/select element in the UI.
 *
 * WHY THIS EXISTS:
 *   Keeps DOM theme mode control in sync with internal theme state, preventing
 *   mismatch between input element state and actual applied theme.
 */

"use strict";

/**
 * themeMode - Sets the theme-mode DOM element value
 *
 * @param {string|Object} modeOrState - Either a theme mode string ('light'|'dark')
 *   or an object containing a themeMode property
 * @param {Object} [options={}] - Additional options (reserved for future use)
 * @returns {void}
 */
export function setApplyThemeMode(modeOrState, options = {}) {
  // Locate the theme-mode DOM element
  const el = document.getElementById('theme-mode');

  // Extract the mode string from either a direct string or state object
  const mode = typeof modeOrState === 'string' ? modeOrState : modeOrState?.themeMode;

  // Bail out if element or mode is missing
  if (!el || !mode) return;

  // Set the element value to match the resolved mode (defaults to 'dark' for non-light modes)
  el.value = mode === 'light' ? 'light' : 'dark';
}
