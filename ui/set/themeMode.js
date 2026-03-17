/**
 * themeMode.js - Theme Mode Switching
 *
 * PURPOSE:
 *   Sets the application theme mode (light or dark).
 *   Updates renderState and triggers palette rebuild.
 *
 * ARCHITECTURE ROLE:
 *   Called by theme mode toggle in UI controls.
 *   Updates renderState mode and triggers palette rebuild.
 *
 * MODES:
 *   - 'light': Light background with dark text
 *   - 'dark': Dark background with light text
 */

"use strict";

import { palette }from '@ui/set/apply/palette.js';
import { setThemeMode }from '@engine/state/renderState.js';

/**
 * themeMode - Sets application theme mode
 *
 * @param {string} mode - Theme mode ('light' or 'dark')
 * @param {Object} [options={}] - Options
 * @param {boolean} [options.apply=true] - Whether to apply palette immediately
 *
 * @returns {void}
 */
export function themeMode(mode, options = {}) {
  const { apply = true } = options;

  const normalized = mode === 'light' ? 'light' : 'dark';
  setThemeMode(normalized);

  // Update theme mode select element if available
  const el = document.getElementById('theme-mode');
  if (el) el.value = normalized;

  // Apply palette to update UI colors
  if (apply) palette();
}
