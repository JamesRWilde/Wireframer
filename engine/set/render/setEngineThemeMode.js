'use strict';

/**
 * setThemeMode - Set Theme Mode
 *
 * PURPOSE:
 *   Sets theme mode, either "light" or "dark".
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setThemeMode.js
 */

import { renderState } from '@engine/state/render/renderState.js';


/**
 * Sets theme mode, either "light" or "dark".
 * @param {*} mode - The value to set.
 */
export function setEngineThemeMode(mode) {
  renderState.themeMode = mode === 'light' ? 'light' : 'dark';
}
