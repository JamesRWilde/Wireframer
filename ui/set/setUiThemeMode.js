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
 * WHY THIS EXISTS:
 *   Centralizes theme mode updates to avoid duplicated state transitions and
 *   inconsistent UI color behavior when toggling between modes.
 *

"use strict";

import { setPalette }from '@ui/set/apply/setPalette.js';
import { setEngineThemeMode } from '@engine/set/render/setEngineThemeMode.js';

/**
 * themeMode - Sets application theme mode
 *
 * @param {string} mode - Theme mode ('light' or 'dark')
 * @param {Object} [options={}] - Options
 * @param {boolean} [options.apply=true] - Whether to apply palette immediately
 *
 * @returns {void}
 */
export function setUiThemeMode(mode, options = {}) {
  const { apply = true } = options;

  const normalized = mode === 'light' ? 'light' : 'dark';
  setEngineThemeMode(normalized);

  // Update theme mode select element if available
  const el = document.getElementById('theme-mode');
  if (el) el.value = normalized;

  // Apply palette to update UI colors
  if (apply) setPalette();
}
