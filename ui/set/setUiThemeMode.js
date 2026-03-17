/**
 * SetUiThemeMode.js - Theme Mode Switching
 * 
 * PURPOSE:
 *   Sets the application theme mode (light or dark).
 *   Updates global state and optionally applies the theme.
 * 
 * ARCHITECTURE ROLE:
 *   Called by theme mode toggle in UI controls.
 *   Updates THEME_MODE and triggers palette rebuild.
 * 
 * MODES:
 *   - 'light': Light background with dark text
 *   - 'dark': Dark background with light text
 */

"use strict";

import { themeMode } from ''../state/stateUiDom.js'';
import { setUiApplyPalette } from ''./setUiApplyPalette.js'';

/**
 * SetUiThemeMode - Sets application theme mode
 * 
 * @param {string} mode - Theme mode ('light' or 'dark')
 * @param {Object} [options={}] - Options
 * @param {boolean} [options.apply=true] - Whether to apply palette immediately
 * 
 * @returns {void}
 * 
 * The function:
 * 1. Sets global THEME_MODE
 * 2. Updates theme mode select element
 * 3. Optionally applies palette to update UI
 */
export function setUiThemeMode(mode, options = {}) {
  const { apply = true } = options;
  
  // Set global theme mode (normalize to 'light' or 'dark')
  globalThis.THEME_MODE = mode === 'light' ? 'light' : 'dark';
  
  // Update theme mode select element if available
  if (themeMode) themeMode.value = globalThis.THEME_MODE;
  
  // Apply palette to update UI colors
  if (apply) SetUiApplyPalette();
}
