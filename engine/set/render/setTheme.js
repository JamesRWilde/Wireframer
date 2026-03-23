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
 *
 * WHY THIS EXISTS:
 *   The theme controls fill color, wire color, and shade colors. When it
 *   changes, downstream derived values (computed RGBs, shade variants)
 *   must be recomputed. Incrementing themeVer signals UI controls to
 *   refresh, and resetting cacheVer forces color recomputation.
 */

"use strict";

// Import the render state container
// Holds theme, opacity, and color parameters shared by both rendering pipelines
import { renderState } from '@engine/state/render/stateRenderState.js';

/**
 * setTheme - Sets the active theme and invalidates the derived color cache
 * @param {Object} t - The theme object containing color definitions (fill, wire, etc.)
 * @returns {void}
 */
export function setTheme(t) {
  // Store the new theme object
  renderState.theme = t;
  // Increment theme version to signal UI controls to refresh
  renderState.themeVer++;
  // Reset cache version to -1 to force color recomputation on next render
  renderState.cacheVer = -1;
}
