/**
 * applyPalette.js - Theme Application
 *
 * PURPOSE:
 *   Applies the current custom color theme to the application.
 *   Builds theme palette from CUSTOM_RGB and updates CSS variables.
 *
 * ARCHITECTURE ROLE:
 *   Called when theme changes (color selection, mode toggle).
 *   Updates renderState and CSS custom properties.
 *
 * DATA FORMAT:
 *   - Custom theme palette contains color arrays and CSS variable strings.
 *
 * THEME APPLICATION:
 *   1. Builds complete palette from base color
 *   2. Sets renderState theme for runtime access
 *   3. Updates CSS variables for UI styling
 */

"use strict";

import { setCustomTheme } from '@ui/set/setCustomTheme.js';
import { CUSTOM_RGB, themeModeEl } from '@ui/state/stateDom.js';
import { setTheme } from '@engine/set/render/setTheme.js';

/**
 * applyPalette - Applies current color theme to application
 *
 * @returns {void}
 *
 * The function:
 * 1. Builds complete theme palette from CUSTOM_RGB
 * 2. Sets renderState theme for runtime color access
 * 3. Updates CSS custom properties for UI styling
 */
export function setPalette() {
  // Build complete theme palette from base color
  const palette = setCustomTheme(CUSTOM_RGB, themeModeEl.value);

  // Set renderState theme for runtime access by renderers
  setTheme(palette);

  // Update CSS custom properties for UI styling
  for (const [k, v] of Object.entries(palette.uiVars)) {
    document.documentElement.style.setProperty(k, v);
  }
}
