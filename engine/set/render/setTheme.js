'use strict';

/**
 * setTheme.js - Theme Setter
 *
 * PURPOSE:
 *   Sets the active theme object, increments the theme version counter
 *   to trigger UI updates, and invalidates the derived color cache.
 *   The cache is marked as stale (cacheVer = -1) so derived colors
 *   are recomputed on the next render cycle.
 *
 * ARCHITECTURE ROLE:
 *   Called when the user switches themes or when the theme is first
 *   loaded. Triggers a full color recomputation downstream.
 */

import { renderState } from '@engine/state/render/stateRenderState.js';

/**
 * Sets the active theme and invalidates the derived color cache.
 * @param {Object} t - The theme object containing color definitions.
 * @returns {void}
 */
export function setTheme(t) {
  renderState.theme = t;
  renderState.themeVer++;
  renderState.cacheVer = -1;
}
